import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { RedisModule } from '../redis/redis.module';
import { StacksModule } from '../stacks/stacks.module';
import { FeeEstimate } from '../entities/fee-estimate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeeEstimate]), RedisModule, StacksModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
