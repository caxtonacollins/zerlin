import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SmartAlertsService } from './smart-alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { MarkTriggeredDto } from './dto/mark-triggered.dto';
import {
  GetAlertDto,
  CanCreateAlertDto,
  AlertIdDto,
  UpdateAlertThresholdDto,
  UpdateAlertTypeDto,
  BatchAlertCheckDto,
  CreateAlertBatchDto,
  GetTriggerHistoryDto,
  TransferOwnershipDto,
  InitializeSmartAlertsDto,
} from './dto/smart-alerts-extended.dto';

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
    return this.smartAlertsService.markTriggered(
      dto.userAddress,
      dto.alertId,
      dto.currentFee,
    );
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
    @Query('fee') fee: number,
  ) {
    return this.smartAlertsService.checkAlertTrigger(
      address,
      Number(id),
      Number(fee),
    );
  }

  @Get('alert')
  @ApiOperation({ summary: 'Get a specific alert' })
  async getAlert(@Query() dto: GetAlertDto) {
    return this.smartAlertsService.getAlert(dto.userAddress, dto.alertId);
  }

  @Get('can-create')
  @ApiOperation({ summary: 'Check if user can create more alerts' })
  async canCreateAlert(@Query() dto: CanCreateAlertDto) {
    return this.smartAlertsService.canCreateAlert(dto.userAddress);
  }

  @Post('deactivate')
  @ApiOperation({ summary: 'Deactivate an alert' })
  async deactivateAlert(@Body() dto: AlertIdDto) {
    return this.smartAlertsService.deactivateAlert(dto.alertId);
  }

  @Post('reactivate')
  @ApiOperation({ summary: 'Reactivate an alert' })
  async reactivateAlert(@Body() dto: AlertIdDto) {
    return this.smartAlertsService.reactivateAlert(dto.alertId);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Delete an alert permanently' })
  async deleteAlert(@Body() dto: AlertIdDto) {
    return this.smartAlertsService.deleteAlert(dto.alertId);
  }

  @Post('update-threshold')
  @ApiOperation({ summary: 'Update alert threshold' })
  async updateAlertThreshold(@Body() dto: UpdateAlertThresholdDto) {
    return this.smartAlertsService.updateAlertThreshold(
      dto.alertId,
      dto.newTargetFee,
    );
  }

  @Post('update-type')
  @ApiOperation({ summary: 'Update alert type' })
  async updateAlertType(@Body() dto: UpdateAlertTypeDto) {
    return this.smartAlertsService.updateAlertType(dto.alertId, dto.newType);
  }

  @Post('batch-check')
  @ApiOperation({ summary: 'Batch check multiple alerts' })
  async batchCheckAlerts(@Body() dto: BatchAlertCheckDto) {
    return this.smartAlertsService.batchCheckAlerts(dto.alerts, dto.fee);
  }

  @Post('batch-create')
  @ApiOperation({ summary: 'Create multiple alerts in batch' })
  async createAlertsBatch(@Body() dto: CreateAlertBatchDto) {
    return this.smartAlertsService.createAlertsBatch(dto.alerts);
  }

  @Get('is-paused')
  @ApiOperation({ summary: 'Check if contract is paused' })
  async isPaused() {
    return this.smartAlertsService.isPaused();
  }

  @Post('emergency-pause')
  @ApiOperation({ summary: 'Emergency pause contract' })
  async emergencyPause() {
    return this.smartAlertsService.emergencyPause();
  }

  @Post('emergency-resume')
  @ApiOperation({ summary: 'Emergency resume contract' })
  async emergencyResume() {
    return this.smartAlertsService.emergencyResume();
  }

  @Get('creation-cost')
  @ApiOperation({ summary: 'Get alert creation cost estimate' })
  async estimateCreationCost() {
    return this.smartAlertsService.estimateCreationCost();
  }

  @Get('trigger-history')
  @ApiOperation({ summary: 'Get trigger history for alert' })
  async getTriggerHistory(@Query() dto: GetTriggerHistoryDto) {
    return this.smartAlertsService.getTriggerHistory(
      dto.alertId,
      dto.triggerIndex,
    );
  }

  @Post('transfer-ownership')
  @ApiOperation({ summary: 'Transfer contract ownership' })
  async transferOwnership(@Body() dto: TransferOwnershipDto) {
    return this.smartAlertsService.transferOwnership(dto.newOwner);
  }
}
