import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SmartAlertsService } from './smart-alerts.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAlertDto } from './dto/create-alert.dto';

@ApiTags('Smart Alerts')
@Controller('smart-alerts')
export class SmartAlertsController {
  constructor(private readonly smartAlertsService: SmartAlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new fee alert' })
  @ApiResponse({ status: 201, description: 'The alert has been successfully created.' })
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    return this.smartAlertsService.createAlert(createAlertDto);
  }

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
