import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StacksService } from '../stacks/stacks.service';
import { RedisService } from '../redis/redis.service';
import { Alert } from '../entities/alert.entity';

@Injectable()
export class PollingService {
  private readonly logger = new Logger(PollingService.name);

  constructor(
    private stacksService: StacksService,
    private redisService: RedisService,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) {}

  @Cron('*/30 * * * * *')
  async handleNetworkStatus() {
    this.logger.debug('Polling network status...');
    try {
      const info = await this.stacksService.getNetworkStatus();
      if (!info) return;

      const mempool = await this.stacksService.getRecentMempoolStats();


      let currentFee = 0;
      try {
        currentFee = await this.stacksService.estimateTransferFee(BigInt(1), 'SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD8PR1618C');
      } catch (e) {
        this.logger.warn('Failed to fetch fee estimate, using default', e);
        currentFee = 250; // Default fallback
      }

      const status = {
        congestionLevel: this.calculateCongestion(mempool),
        averageFeeRate: currentFee,
        mempoolSize: mempool ? mempool.total_count : 0,
        blockHeight: info.burn_block_height,
        updatedAt: new Date().toISOString()
      };

      await this.redisService.set('network_status', JSON.stringify(status), 60);
      this.logger.debug(`Network status updated: Block ${status.blockHeight}, Fee: ${currentFee}`);

      await this.checkAlerts(currentFee);

    } catch (error) {
      this.logger.error('Failed to poll network status', error);
    }
  }

  private async checkAlerts(currentFee: number) {
    const activeAlerts = await this.alertRepository.find({ where: { isActive: true }, relations: ['user'] });

    for (const alert of activeAlerts) {
      let triggered = false;
      if (alert.condition === 'BELOW' && currentFee <= alert.targetFee) {
        triggered = true;
      } else if (alert.condition === 'ABOVE' && currentFee >= alert.targetFee) {
        triggered = true;
      }

      if (triggered) {
        this.logger.log(`[NOTIFICATION TRIGGERED] Alert ${alert.id} for User ${alert.user.stacksAddress}: Current Fee ${currentFee} is ${alert.condition} ${alert.targetFee}`);
      }
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
