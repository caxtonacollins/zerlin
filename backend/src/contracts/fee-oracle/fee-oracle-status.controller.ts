import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeeOracleService } from './fee-oracle.service';

@ApiTags('Fee Oracle')
@Controller('fee-oracle')
export class FeeOracleStatusController {
  constructor(private readonly feeOracleService: FeeOracleService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get oracle status and configuration' })
  @ApiResponse({
    status: 200,
    description: 'Oracle status retrieved successfully',
  })
  async getStatus() {
    const feeRate = await this.feeOracleService.getFeeRate();
    
    // Mock data - implement actual contract reads
    return {
      currentFeeRate: feeRate.feeRate || 0,
      lastUpdate: new Date().toISOString(),
      authorizedOracles: [],
      owner: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', // Mock
      isInitialized: true,
    };
  }
}
