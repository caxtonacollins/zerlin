import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System stats retrieved' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user and all their alerts' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get all alerts with pagination' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved' })
  async getAllAlerts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.getAllAlerts(page, limit);
  }

  @Patch('alerts/:id/toggle')
  @ApiOperation({ summary: 'Toggle alert active status' })
  @ApiResponse({ status: 200, description: 'Alert toggled' })
  async toggleAlert(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.toggleAlert(id, body.isActive);
  }

  @Delete('alerts/:id')
  @ApiOperation({ summary: 'Delete alert' })
  @ApiResponse({ status: 200, description: 'Alert deleted' })
  async deleteAlert(@Param('id') id: string) {
    return this.adminService.deleteAlert(id);
  }
}
