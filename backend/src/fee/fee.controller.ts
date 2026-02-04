import { Controller, Post, Body, Get } from '@nestjs/common';
import { FeeService } from './fee.service';

@Controller('api')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Post('estimate')
  async estimateFee(@Body() body: any) {
    return this.feeService.estimateFee(body);
  }

  @Get('network')
  async getNetworkStatus() {
    return this.feeService.getNetworkStatus();
  }

  @Get('history')
  async getHistory() {
    return this.feeService.getHistory();
  }
}
