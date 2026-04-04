import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * GET /health
   * Health check endpoint
   */
  @Get()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * GET /health/ready
   * Readiness probe for Kubernetes
   */
  @Get('ready')
  ready() {
    return {
      status: 'ready',
    };
  }
}