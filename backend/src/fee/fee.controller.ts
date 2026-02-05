import { Controller, Post, Body, Get, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FeeService } from './fee.service';
import { EstimateFeeDto, FeeEstimateResponseDto, NetworkStatusResponseDto } from './dto/fee.dto';

@ApiTags('Fee Estimation')
@Controller('api')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Post('estimate')
  @ApiOperation({
    summary: 'Estimate transaction fee',
    description: 'Calculate estimated STX fee for various transaction types on Stacks blockchain'
  })
  @ApiBody({ type: EstimateFeeDto })
  @ApiResponse({
    status: 200,
    description: 'Fee estimate calculated successfully',
    type: FeeEstimateResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async estimateFee(@Body(ValidationPipe) dto: EstimateFeeDto): Promise<FeeEstimateResponseDto> {
    return this.feeService.estimateFee(dto);
  }

  @Get('network')
  @ApiOperation({
    summary: 'Get network status',
    description: 'Retrieve current Stacks network status including congestion level and fee rates'
  })
  @ApiResponse({
    status: 200,
    description: 'Network status retrieved successfully',
    type: NetworkStatusResponseDto
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNetworkStatus(): Promise<NetworkStatusResponseDto> {
    return this.feeService.getNetworkStatus();
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get fee estimation history',
    description: 'Retrieve recent fee estimates (last 50)'
  })
  @ApiResponse({
    status: 200,
    description: 'Fee history retrieved successfully',
    type: [FeeEstimateResponseDto]
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getHistory(): Promise<FeeEstimateResponseDto[]> {
    return this.feeService.getHistory();
  }
}
