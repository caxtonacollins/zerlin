import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FeeOracleService } from './fee-oracle.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateFeeRateDto, InitializeOracleDto } from './dto/update-fee.dto';

@ApiTags('Fee Oracle')
@Controller('fee-oracle')
export class FeeOracleController {
  constructor(private readonly feeOracleService: FeeOracleService) {}

  @Get('fee-rate')
  @ApiOperation({ summary: 'Get current fee rate' })
  @ApiResponse({ status: 200, description: 'Current fee rate in microSTX/byte' })
  async getFeeRate() {
    return this.feeOracleService.getFeeRate();
  }

  @Get('estimate-transfer')
  @ApiOperation({ summary: 'Estimate STX transfer fee' })
  async estimateTransferFee() {
    return this.feeOracleService.estimateTransferFee();
  }

  @Post('update-rate')
  @ApiOperation({ summary: 'Update on-chain fee rate (requires Oracle authorization)' })
  async updateFeeRate(@Body() dto: UpdateFeeRateDto) {
    return this.feeOracleService.updateFeeRate(dto.feeRate, dto.congestion);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize the fee oracle (Owner only, once)' })
  async initialize(@Body() dto: InitializeOracleDto) {
    return this.feeOracleService.initialize(dto.initialFeeRate);
  }
}
