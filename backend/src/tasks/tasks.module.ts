import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollingService } from './polling.service';
import { Alert } from '../entities/alert.entity';
import { StacksModule } from '../stacks/stacks.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Alert]),
    StacksModule,
    RedisModule
  ],
  providers: [PollingService],
})
export class TasksModule {}
