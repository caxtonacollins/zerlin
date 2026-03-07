import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeEstimate } from '../entities/fee-estimate.entity';
import { NetworkStatus } from '../entities/network-status.entity';
import { StacksService } from '../stacks/stacks.service';
import { RedisService } from '../redis/redis.service';
import { PriceService } from '../price/price.service';
import { FeeOracleService } from '../contracts/fee-oracle/fee-oracle.service';
import {
  EstimateFeeDto,
  FeeEstimateResponseDto,
  NetworkStatusResponseDto,
} from './dto/fee.dto';

@Injectable()
export class FeeService {
  private readonly logger = new Logger(FeeService.name);

  constructor(
    @InjectRepository(FeeEstimate)
    private feeEstimateRepo: Repository<FeeEstimate>,
    @InjectRepository(NetworkStatus)
    private networkStatusRepo: Repository<NetworkStatus>,
    private stacksService: StacksService,
    private redisService: RedisService,
    private priceService: PriceService,
    private feeOracleService: FeeOracleService,
  ) {}

  async estimateFee(dto: EstimateFeeDto): Promise<FeeEstimateResponseDto> {
    const { type } = dto;

    try {
      const networkInfo = await this.getNetworkStatus();

      let feeInMicroStx = 0;
      let breakdown = { baseFee: 0, executionCost: 0, dataSize: 0 };

      // Fallback fee values (in microSTX) if contract calls fail
      const FALLBACK_FEES = {
        transfer: 180,
        'contract-call': 2500,
        'nft-mint': 5000,
        default: 1000,
      };

      // Estimate based on type
      if (type === 'transfer') {
        try {
          feeInMicroStx = await this.feeOracleService.estimateTransferFee();
          if (!feeInMicroStx || isNaN(feeInMicroStx)) {
            throw new Error('Invalid fee returned from contract');
          }
        } catch (error) {
          this.logger.warn(
            'Contract call failed, using fallback fee for transfer',
            error,
          );
          feeInMicroStx = FALLBACK_FEES.transfer;
        }
        breakdown = {
          baseFee: feeInMicroStx,
          executionCost: 0,
          dataSize: 180,
        };
      } else if (type === 'contract-call') {
        try {
          feeInMicroStx =
            await this.feeOracleService.estimateContractCallFee(1);
          if (!feeInMicroStx || isNaN(feeInMicroStx)) {
            throw new Error('Invalid fee returned from contract');
          }
        } catch (error) {
          this.logger.warn(
            'Contract call failed, using fallback fee for contract-call',
            error,
          );
          feeInMicroStx = FALLBACK_FEES['contract-call'];
        }
        breakdown = {
          baseFee: networkInfo.averageFeeRate,
          executionCost: feeInMicroStx - networkInfo.averageFeeRate,
          dataSize: 250,
        };
      } else if (type === 'nft-mint') {
        try {
          feeInMicroStx = await this.feeOracleService.estimateNftMintFee();
          if (!feeInMicroStx || isNaN(feeInMicroStx)) {
            throw new Error('Invalid fee returned from contract');
          }
        } catch (error) {
          this.logger.warn(
            'Contract call failed, using fallback fee for nft-mint',
            error,
          );
          feeInMicroStx = FALLBACK_FEES['nft-mint'];
        }
        breakdown = {
          baseFee: networkInfo.averageFeeRate,
          executionCost: feeInMicroStx - networkInfo.averageFeeRate,
          dataSize: 450,
        };
      } else {
        // For other types, use contract base rate
        try {
          const baseRate = await this.feeOracleService.getFeeRate();
          if (!baseRate || isNaN(baseRate)) {
            throw new Error('Invalid base rate returned from contract');
          }
          feeInMicroStx = baseRate * 300;
        } catch (error) {
          this.logger.warn(
            'Contract call failed, using fallback fee for other types',
            error,
          );
          feeInMicroStx = FALLBACK_FEES.default;
        }
        breakdown = {
          baseFee: Math.floor(feeInMicroStx / 300),
          executionCost: feeInMicroStx - Math.floor(feeInMicroStx / 300),
          dataSize: 300,
        };
      }

      // Get price conversions
      const usd = await this.priceService.convertMicroStxToUsd(feeInMicroStx);
      const btc = await this.priceService.convertMicroStxToBtc(feeInMicroStx);

      const result: FeeEstimateResponseDto = {
        transactionType: type,
        estimatedFee: {
          stx: (feeInMicroStx / 1000000).toFixed(6),
          microStx: feeInMicroStx,
          usd,
          btc,
        },
        breakdown,
        networkStatus: {
          congestion: networkInfo.congestionLevel,
          averageFee: networkInfo.averageFeeRate,
          recommendedBuffer: feeInMicroStx * 2,
        },
        timestamp: new Date(),
        cached: false,
      };

      this.saveEstimate(result).catch((err) =>
        this.logger.error('Failed to save estimate', err),
      );

      return result;
    } catch (error) {
      this.logger.error('Error estimating fee', error);
      throw error;
    }
  }

  async getNetworkStatus(): Promise<NetworkStatusResponseDto> {
    try {
      const cached = await this.redisService.get('network_status');
      if (cached) {
        return JSON.parse(cached) as NetworkStatusResponseDto;
      }
      const info = await this.stacksService.getNetworkStatus();
      const mempoolStats = await this.stacksService.getRecentMempoolStats();

      const status: NetworkStatusResponseDto = {
        congestionLevel: this.determineCongestion(mempoolStats?.tx_count || 0),
        averageFeeRate: 1, // Default fee rate
        mempoolSize: mempoolStats?.tx_count || 0,
        blockHeight: info.stacks_tip_height || info.burn_block_height,
      };

      await this.redisService.set('network_status', JSON.stringify(status), 30);

      return status;
    } catch (error) {
      this.logger.error('Error fetching network status', error);
      return {
        congestionLevel: 'medium',
        averageFeeRate: 1,
        mempoolSize: 0,
        blockHeight: 0,
      };
    }
  }

  async getHistory(): Promise<FeeEstimateResponseDto[]> {
    try {
      const estimates = await this.feeEstimateRepo.find({
        order: { createdAt: 'DESC' },
        take: 50,
      });

      return estimates.map((est) => ({
        transactionType: est.transactionType,
        estimatedFee: est.estimatedFee,
        breakdown: est.breakdown,
        networkStatus: est.networkStatus,
        timestamp: est.createdAt,
        cached: true,
      }));
    } catch (error) {
      this.logger.error('Error fetching history', error);
      return [];
    }
  }

  private async saveEstimate(estimate: FeeEstimateResponseDto): Promise<void> {
    try {
      const entity = this.feeEstimateRepo.create({
        transactionType: estimate.transactionType,
        estimatedFee: estimate.estimatedFee,
        breakdown: estimate.breakdown,
        networkStatus: estimate.networkStatus,
      });
      await this.feeEstimateRepo.save(entity);
    } catch (error) {
      this.logger.error('Failed to save estimate to database', error);
    }
  }

  private determineCongestion(mempoolSize: number): string {
    if (mempoolSize < 10) return 'low';
    if (mempoolSize < 50) return 'medium';
    return 'high';
  }
}
