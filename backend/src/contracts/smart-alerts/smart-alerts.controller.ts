import { Controller, Get, Param, Query } from '@nestjs/common';
import { SmartAlertsService } from './smart-alerts.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Smart Alerts')
@Controller('smart-alerts')
export class SmartAlertsController {
  constructor(private readonly smartAlertsService: SmartAlertsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get global alert stats' })
  async getStats() {
    return this.smartAlertsService.getAlertStats();
  }

  @Get('user-count/:address')
  @ApiOperation({ summary: 'Get alert count for user' })
  async getUserAlertCount(@Param('address') address: string) {
    return this.smartAlertsService.getUserAlertCount(address);
  }

  @Get('check-trigger')
  @ApiOperation({ summary: 'Check if an alert should trigger' })
  async checkTrigger(
    @Query('address') address: string,
    @Query('id') id: number,
    @Query('fee') fee: number
  ) {
    return this.smartAlertsService.checkAlertTrigger(address, Number(id), Number(fee));
  }
}
