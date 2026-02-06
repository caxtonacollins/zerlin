import { Module } from '@nestjs/common';
import { FeeOracleService } from './fee-oracle.service';
import { StacksModule } from '../../stacks/stacks.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [StacksModule, ConfigModule],
  providers: [FeeOracleService],
  exports: [FeeOracleService],
})
export class FeeOracleModule {}
