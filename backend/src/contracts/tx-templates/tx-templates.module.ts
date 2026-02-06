import { Module } from '@nestjs/common';
import { StacksModule } from '../../stacks/stacks.module';
import { ConfigModule } from '@nestjs/config';
import { TxTemplatesService } from './tx-templates.service';

@Module({
  imports: [StacksModule, ConfigModule],
  providers: [TxTemplatesService],
  exports: [TxTemplatesService],
})
export class TxTemplatesModule {}
