import { Module } from '@nestjs/common';
import { StacksModule } from '../../stacks/stacks.module';
import { ConfigModule } from '@nestjs/config';
import { SmartAlertsService } from './smart-alerts.service';
import { SmartAlertsController } from './smart-alerts.controller';

@Module({
  imports: [StacksModule, ConfigModule],
  controllers: [SmartAlertsController],
  providers: [SmartAlertsService],
  exports: [SmartAlertsService],
})
export class SmartAlertsModule {}
