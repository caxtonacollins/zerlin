import { Module } from '@nestjs/common';
import { StacksModule } from '../../stacks/stacks.module';
import { ConfigModule } from '@nestjs/config';
import { SmartAlertsService } from './smart-alerts.service';

@Module({
  imports: [StacksModule, ConfigModule],
  providers: [SmartAlertsService],
  exports: [SmartAlertsService],
})
export class SmartAlertsModule {}
