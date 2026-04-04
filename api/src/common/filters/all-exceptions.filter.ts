import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        (exceptionResponse as any).message || exception.message || message;
      code = (exceptionResponse as any).code || 'HTTP_ERROR';
    } else if ((exception as any).statusCode) {
      status = (exception as any).statusCode;
      message = (exception as any).message || message;
      code = (exception as any).code || 'CUSTOM_ERROR';
      details = (exception as any).details || null;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Error: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unhandled Exception:`, exception);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      code,
      message,
      ...(details && { details }),
    };

    this.logger.error(
      `Exception caught: ${code} - ${message}`,
      errorResponse,
    );

    response.status(status).json(errorResponse);
  }
}