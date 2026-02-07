import { Module } from '@nestjs/common';
import { StacksModule } from '../../stacks/stacks.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartAlertsService } from './smart-alerts.service';
import { SmartAlertsController } from './smart-alerts.controller';
import { User } from '../../entities/user.entity';
import { Alert } from '../../entities/alert.entity';

@Module({
  imports: [
    StacksModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, Alert])
  ],
  controllers: [SmartAlertsController],
  providers: [SmartAlertsService],
  exports: [SmartAlertsService],
})
export class SmartAlertsModule {}
