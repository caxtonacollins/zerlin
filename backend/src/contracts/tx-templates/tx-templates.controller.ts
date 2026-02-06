import { Controller, Get, Param, Query } from '@nestjs/common';
import { TxTemplatesService } from './tx-templates.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Transaction Templates')
@Controller('tx-templates')
export class TxTemplatesController {
  constructor(private readonly txTemplatesService: TxTemplatesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get template details' })
  async getTemplate(@Param('id') id: string) {
    return this.txTemplatesService.getTemplate(id);
  }

  @Get(':id/gas')
  @ApiOperation({ summary: 'Get template gas usage' })
  async getTemplateGas(@Param('id') id: string) {
    return this.txTemplatesService.getTemplateGas(id);
  }

  @Get(':id/estimate')
  @ApiOperation({ summary: 'Get full estimate for template' })
  async getFullEstimate(@Param('id') id: string) {
    return this.txTemplatesService.getFullEstimate(id);
  }
}
