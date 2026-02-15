import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollingService } from './polling.service';
import { Alert } from '../entities/alert.entity';
import { StacksModule } from '../stacks/stacks.module';
import { RedisModule } from '../redis/redis.module';
import { FeeOracleModule } from '../contracts/fee-oracle/fee-oracle.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Alert]),
    StacksModule,
    RedisModule,
    FeeOracleModule
  ],
  providers: [PollingService],
})
export class TasksModule {}
