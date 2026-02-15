import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SmartAlertsService } from './smart-alerts.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAlertDto } from './dto/create-alert.dto';
import { MarkTriggeredDto, InitializeSmartAlertsDto } from './dto/mark-triggered.dto';

@ApiTags('smart-alerts')
@Controller('smart-alerts')
export class SmartAlertsController {
  constructor(private readonly smartAlertsService: SmartAlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new smart alert' })
  async createAlert(@Body() dto: CreateAlertDto) {
    return this.smartAlertsService.createAlert(dto);
  }

  @Post('mark-triggered')
  @ApiOperation({ summary: 'Mark an alert as triggered on-chain' })
  async markTriggered(@Body() dto: MarkTriggeredDto) {
    return this.smartAlertsService.markTriggered(dto.userAddress, dto.alertId, dto.currentFee);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize smart alerts contract with fee oracle' })
  async initialize(@Body() dto: InitializeSmartAlertsDto) {
    return this.smartAlertsService.initialize(dto.oracleAddress);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get global alert statistics' })
  async getAlertStats() {
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
