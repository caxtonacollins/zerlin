import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import { FeeEstimate } from '../entities/fee-estimate.entity';
import { NetworkStatus } from '../entities/network-status.entity';

import { StacksModule } from '../stacks/stacks.module';
import { RedisModule } from '../redis/redis.module';
import { FeeOracleModule } from '../contracts/fee-oracle/fee-oracle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeeEstimate, NetworkStatus]),
    StacksModule,
    RedisModule,
    FeeOracleModule,
  ],
  controllers: [FeeController],
  providers: [FeeService],
})
export class FeeModule {}
