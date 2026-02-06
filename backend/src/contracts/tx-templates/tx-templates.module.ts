import { Module } from '@nestjs/common';
import { StacksModule } from '../../stacks/stacks.module';
import { ConfigModule } from '@nestjs/config';
import { TxTemplatesService } from './tx-templates.service';
import { TxTemplatesController } from './tx-templates.controller';

@Module({
  imports: [StacksModule, ConfigModule],
  controllers: [TxTemplatesController],
  providers: [TxTemplatesService],
  exports: [TxTemplatesService],
})
export class TxTemplatesModule {}
