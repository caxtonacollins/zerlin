import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TxTemplatesService } from './tx-templates.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateTemplateDto, UpdateTemplateDto, InitializeTemplatesDto } from './dto/template.dto';

@ApiTags('tx-templates')
@Controller('tx-templates')
export class TxTemplatesController {
  constructor(private readonly txTemplatesService: TxTemplatesService) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize transaction templates on-chain' })
  async initialize(@Body() dto: InitializeTemplatesDto) {
    // This supports both initializing default templates and setting the oracle
    await this.txTemplatesService.initializeTemplates();
    return this.txTemplatesService.setFeeOracle(dto.oracleAddress);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new transaction template' })
  async createTemplate(@Body() dto: CreateTemplateDto) {
    return this.txTemplatesService.createTemplate(
      dto.templateId,
      dto.sizeBytes,
      dto.gasUnits,
      dto.description,
      dto.category,
    );
  }

  @Post('update/:id')
  @ApiOperation({ summary: 'Update an existing transaction template' })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.txTemplatesService.updateTemplate(id, dto.newSizeBytes, dto.newGasUnits);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific template by ID' })
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
