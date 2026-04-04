import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CloudflareException } from '../exceptions/cloudflare.exception';

@Catch(CloudflareException)
export class CloudflareExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CloudflareExceptionFilter.name);

  catch(exception: CloudflareException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(
      `Cloudflare Error [${exception.code}]: ${exception.message}`,
      exception.details,
    );

    const status = exception.statusCode || HttpStatus.BAD_GATEWAY;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      code: exception.code,
      message: exception.message,
      provider: 'cloudflare',
      ...(exception.details && { details: exception.details }),
    });
  }
}