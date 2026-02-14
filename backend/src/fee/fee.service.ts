import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeEstimate } from '../entities/fee-estimate.entity';
import { NetworkStatus } from '../entities/network-status.entity';
import { StacksService } from '../stacks/stacks.service';
import { RedisService } from '../redis/redis.service';
import { FeeOracleService } from '../contracts/fee-oracle/fee-oracle.service';
import { EstimateFeeDto, FeeEstimateResponseDto, NetworkStatusResponseDto } from './dto/fee.dto';

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
      private feeOracleService: FeeOracleService,
  ) {}

    async estimateFee(dto: EstimateFeeDto): Promise<FeeEstimateResponseDto> {
        const { type, payload, templateId } = dto;
    
        try {
          const networkInfo = await this.getNetworkStatus();

        let feeInMicroStx = 0;
        let breakdown = { baseFee: 0, executionCost: 0, dataSize: 0 };

        // Estimate based on type
        if (type === 'transfer') {
            feeInMicroStx = await this.feeOracleService.estimateTransferFee();
          breakdown = {
              baseFee: feeInMicroStx,
              executionCost: 0,
              dataSize: 180,
        };
      } else if (type === 'contract-call') {
            feeInMicroStx = await this.feeOracleService.estimateContractCallFee(1); // Default complexity
          breakdown = {
              baseFee: networkInfo.averageFeeRate,
              executionCost: feeInMicroStx - networkInfo.averageFeeRate,
              dataSize: 250,
          };
        } else if (type === 'nft-mint') {
            feeInMicroStx = await this.feeOracleService.estimateNftMintFee();
          breakdown = {
              baseFee: networkInfo.averageFeeRate,
              executionCost: feeInMicroStx - networkInfo.averageFeeRate,
              dataSize: 450,
          };
      } else {
            // For other types, use contract base rate
            const baseRate = await this.feeOracleService.getFeeRate();
            feeInMicroStx = baseRate * 300; 
          breakdown = {
              baseFee: baseRate,
              executionCost: feeInMicroStx - baseRate,
              dataSize: 300,
          };
      }

        const result: FeeEstimateResponseDto = {
        transactionType: type,
          estimatedFee: {
              stx: (feeInMicroStx / 1000000).toFixed(6),
              microStx: feeInMicroStx,
              usd: '0.00', // TODO: Integrate price feed
              btc: 0,
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

        this.saveEstimate(result).catch(err =>
            this.logger.error('Failed to save estimate', err)
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
            return JSON.parse(cached);
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

            return estimates.map(est => ({
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
