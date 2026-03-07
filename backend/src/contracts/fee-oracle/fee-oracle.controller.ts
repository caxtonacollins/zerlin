import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FeeOracleService } from './fee-oracle.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  UpdateFeeRateDto,
  InitializeOracleDto,
  UpdateTransactionAverageDto,
  BatchUpdateAveragesDto,
  TransferOwnershipDto,
  AuthorizeOracleDto,
  RevokeOracleDto,
  GetFeeAtBlockDto,
  GetTransactionAverageDto,
  EstimateSwapFeeDto,
  IsAuthorizedOracleDto,
} from './dto/update-fee.dto';

@ApiTags('Fee Oracle')
@Controller('fee-oracle')
export class FeeOracleController {
  constructor(private readonly feeOracleService: FeeOracleService) {}

  @Get('fee-rate')
  @ApiOperation({ summary: 'Get current fee rate' })
  @ApiResponse({
    status: 200,
    description: 'Current fee rate in microSTX/byte',
  })
  async getFeeRate() {
    return this.feeOracleService.getFeeRate();
  }

  @Get('estimate-transfer')
  @ApiOperation({ summary: 'Estimate STX transfer fee' })
  async estimateTransferFee() {
    return this.feeOracleService.estimateTransferFee();
  }

  @Post('update-rate')
  @ApiOperation({
    summary: 'Update on-chain fee rate (requires Oracle authorization)',
  })
  async updateFeeRate(@Body() dto: UpdateFeeRateDto) {
    return this.feeOracleService.updateFeeRate(dto.feeRate, dto.congestion);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize the fee oracle (Owner only, once)' })
  async initialize(@Body() dto: InitializeOracleDto) {
    return this.feeOracleService.initialize(dto.initialFeeRate);
  }

  @Get('last-update-block')
  @ApiOperation({ summary: 'Get last update block height' })
  async getLastUpdateBlock() {
    return this.feeOracleService.getLastUpdateBlock();
  }

  @Get('total-updates')
  @ApiOperation({ summary: 'Get total number of updates' })
  async getTotalUpdates() {
    return this.feeOracleService.getTotalUpdates();
  }

  @Get('is-initialized')
  @ApiOperation({ summary: 'Check if oracle is initialized' })
  async isOracleInitialized() {
    return this.feeOracleService.isOracleInitialized();
  }

  @Get('is-authorized')
  @ApiOperation({ summary: 'Check if oracle address is authorized' })
  async isAuthorizedOracle(@Query() dto: IsAuthorizedOracleDto) {
    return this.feeOracleService.isAuthorizedOracle(dto.oracleAddress);
  }

  @Get('fee-at-block')
  @ApiOperation({ summary: 'Get fee at specific block height' })
  async getFeeAtBlock(@Query() dto: GetFeeAtBlockDto) {
    return this.feeOracleService.getFeeAtBlock(dto.blockHeight);
  }

  @Get('transaction-average')
  @ApiOperation({ summary: 'Get average fee for transaction type' })
  async getTransactionAverage(@Query() dto: GetTransactionAverageDto) {
    return this.feeOracleService.getTransactionAverage(dto.txType);
  }

  @Get('fee-summary')
  @ApiOperation({ summary: 'Get comprehensive fee summary' })
  async getFeeSummary() {
    return this.feeOracleService.getFeeSummary();
  }

  @Get('recommended-buffer')
  @ApiOperation({ summary: 'Get recommended fee buffer' })
  async getRecommendedBuffer() {
    return this.feeOracleService.getRecommendedBuffer();
  }

  @Get('estimate-swap')
  @ApiOperation({ summary: 'Estimate DEX swap fee' })
  async estimateSwapFee(@Query() dto: EstimateSwapFeeDto) {
    return this.feeOracleService.estimateSwapFee(dto.dexName);
  }

  @Post('update-transaction-average')
  @ApiOperation({ summary: 'Update transaction average fee' })
  async updateTransactionAverage(@Body() dto: UpdateTransactionAverageDto) {
    return this.feeOracleService.updateTransactionAverage(
      dto.txType,
      dto.observedFee,
    );
  }

  @Post('batch-update-averages')
  @ApiOperation({ summary: 'Batch update multiple transaction averages' })
  async batchUpdateAverages(@Body() dto: BatchUpdateAveragesDto) {
    return this.feeOracleService.batchUpdateAverages(dto.updates);
  }

  @Post('transfer-ownership')
  @ApiOperation({ summary: 'Transfer contract ownership' })
  async transferOwnership(@Body() dto: TransferOwnershipDto) {
    return this.feeOracleService.transferOwnership(dto.newOwner);
  }

  @Post('authorize-oracle')
  @ApiOperation({ summary: 'Authorize an oracle' })
  async authorizeOracle(@Body() dto: AuthorizeOracleDto) {
    return this.feeOracleService.authorizeOracle(dto.oracleAddress);
  }

  @Post('revoke-oracle')
  @ApiOperation({ summary: 'Revoke oracle authorization' })
  async revokeOracle(@Body() dto: RevokeOracleDto) {
    return this.feeOracleService.revokeOracle(dto.oracleAddress);
  }
}
