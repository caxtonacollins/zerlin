import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StacksService } from '../stacks/stacks.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class PollingService {
  private readonly logger = new Logger(PollingService.name);

  constructor(
    private stacksService: StacksService,
    private redisService: RedisService,
  ) {}

  @Cron('*/30 * * * * *') // Every 30 seconds
  async handleNetworkStatus() {
    this.logger.debug('Polling network status...');
    try {
      const info = await this.stacksService.getNetworkStatus();
      if (!info) return;

      const mempool = await this.stacksService.getRecentMempoolStats();

      const status = {
        congestionLevel: this.calculateCongestion(mempool),
        averageFeeRate: 0, // Todo: calculate from recent blocks
        mempoolSize: mempool ? mempool.total_count : 0,
        blockHeight: info.burn_block_height,
        updatedAt: new Date().toISOString()
      };

      await this.redisService.set('network_status', JSON.stringify(status), 60);
      this.logger.debug(`Network status updated: Block ${status.blockHeight}`);
    } catch (error) {
      this.logger.error('Failed to poll network status', error);
    }
  }

  private calculateCongestion(mempoolStats: any): string {
      if (!mempoolStats) return 'unknown';
      // Simple heuristic
      if (mempoolStats.total_count > 5000) return 'high';
      if (mempoolStats.total_count > 1000) return 'medium';
      return 'low';
  }
}
