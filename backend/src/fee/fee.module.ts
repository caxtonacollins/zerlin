import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeController } from './fee.controller';
import { FeeService } from './fee.service';
import { FeeEstimate } from '../entities/fee-estimate.entity';
import { NetworkStatus } from '../entities/network-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeeEstimate, NetworkStatus]),
  ],
  controllers: [FeeController],
  providers: [FeeService],
})
export class FeeModule {}
