import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeEstimate } from '../entities/fee-estimate.entity';
import { NetworkStatus } from '../entities/network-status.entity';
import { StacksService } from '../stacks/stacks.service';
import { RedisService } from '../redis/redis.service';

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
  ) {}

  async estimateFee(dto: any) {
    // Determine type and call relevant stacks service method
    // Calculate breakdown
    // Save to DB (optional or async)
    // Return result
    
    const { type, payload } = dto;
    let estimate;

     // Fetch current network status (cached or fresh)
    const networkInfo = await this.getNetworkStatus();

    if (type === 'transfer') {
        const feeRate = await this.stacksService.estimateTransferFee(BigInt(payload.amount || 0), payload.recipient);
        // Calculate total fee based on size * rate
        // Simplified for MVP:
        estimate = {
            stx: (feeRate * 0.000001).toFixed(6),
            microStx: feeRate, // dummy, normally feeRate * size
            usd: '0.00', // needs price feed
            btc: 0
        };
    } else if (type === 'contract_call') {
        // ...
        estimate = { stx: '0.00', microStx: 0, usd: '0.00', btc: 0 };
    }

    // Persist estimate for history
    const saved = this.feeEstimateRepo.create({
        transactionType: type,
        estimatedFee: estimate,
        breakdown: { baseFee: 0, executionCost: 0, dataSize: 0 }, // TODO
        networkStatus: { 
            congestion: networkInfo.congestionLevel, 
            averageFee: networkInfo.averageFeeRate,
            recommendedBuffer: 0
        }
    });
    // await this.feeEstimateRepo.save(saved); // Fire and forget in prod?

    return saved;
  }

  async getNetworkStatus() {
      // Try redis first
      const cached = await this.redisService.get('network_status');
      if (cached) return JSON.parse(cached);

      // Fetch fresh
      const info = await this.stacksService.getNetworkStatus();
      // Transform info to our internal NetworkStatus shape
      const status = {
          congestionLevel: 'low', // logic implementation needed
          averageFeeRate: 0,
          mempoolSize: 0,
          blockHeight: info.burn_block_height
      };

      // Cache
      await this.redisService.set('network_status', JSON.stringify(status), 30);
      return status;
  }
  
  async getHistory() {
      return this.feeEstimateRepo.find({
          order: { createdAt: 'DESC' },
          take: 50
      });
  }
}
