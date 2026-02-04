import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PollingService } from './polling.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PollingService],
})
export class TasksModule {}
