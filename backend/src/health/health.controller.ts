import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if all services are running properly',
  })
  @ApiResponse({
    status: 200,
    description: 'All services are healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'One or more services are unhealthy',
  })
  async check() {
    return this.healthService.check();
  }
}
