import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { StacksService } from '../stacks/stacks.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeEstimate } from '../entities/fee-estimate.entity';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly stacksService: StacksService,
    @InjectRepository(FeeEstimate)
    private feeEstimateRepo: Repository<FeeEstimate>,
  ) {}

  async check() {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        stacks: await this.checkStacks(),
      },
    };

    const allHealthy = Object.values(checks.services).every(
      (service) => service.status === 'up',
    );

    if (!allHealthy) {
      checks.status = 'unhealthy';
    }

    return checks;
  }

  private async checkDatabase() {
    try {
      await this.feeEstimateRepo.query('SELECT 1');
      return { status: 'up', message: 'Database connection successful' };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return { status: 'down', message: 'Database connection failed' };
    }
  }

  private async checkRedis() {
    try {
      await this.redisService.set('health_check', 'ok', 10);
      const value = await this.redisService.get('health_check');
      if (value === 'ok') {
        return { status: 'up', message: 'Redis connection successful' };
      }
      return { status: 'down', message: 'Redis read/write failed' };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return { status: 'down', message: 'Redis connection failed' };
    }
  }

  private async checkStacks() {
    try {
      await this.stacksService.getNetworkStatus();
      return { status: 'up', message: 'Stacks API connection successful' };
    } catch (error) {
      this.logger.error('Stacks health check failed', error);
      return { status: 'down', message: 'Stacks API connection failed' };
    }
  }
}
