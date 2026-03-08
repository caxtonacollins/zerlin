import { Module } from '@nestjs/common';
import { FeeOracleService } from './fee-oracle.service';
import { StacksModule } from '../../stacks/stacks.module';
import { ConfigModule } from '@nestjs/config';
import { FeeOracleController } from './fee-oracle.controller';
import { FeeOracleStatusController } from './fee-oracle-status.controller';

@Module({
  imports: [StacksModule, ConfigModule],
  controllers: [FeeOracleController, FeeOracleStatusController],
  providers: [FeeOracleService],
  exports: [FeeOracleService],
})
export class FeeOracleModule {}
