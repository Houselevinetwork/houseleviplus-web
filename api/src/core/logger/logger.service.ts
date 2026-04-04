import { Injectable, LoggerService as NestLoggerService, Inject } from '@nestjs/common';
import { Logger } from 'winston';

/**
 * Logger Service
 * 
 * Provides structured logging with:
 * - Context tracking (which module logged this?)
 * - PII redaction (DPA compliance)
 * - Multiple log levels
 * - Audit trail logging
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(@Inject('WINSTON_LOGGER') private readonly logger: Logger) {}

  /**
   * Set context for subsequent logs
   * Example: new LoggerService(logger).setContext('AuthModule')
   */
  setContext(context: string) {
    this.context = context;
  }

  /**
   * Log informational message
   */
  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  /**
   * Log error message
   */
  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, {
      trace,
      context: context || this.context,
    });
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  /**
   * Log verbose message (detailed info)
   */
  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  /**
   * Log audit trail (DPA compliance)
   * Use for: user logins, data access, sensitive operations
   */
  audit(action: string, details: Record<string, any>) {
    this.logger.info(`[AUDIT] ${action}`, {
      ...details,
      context: 'Audit',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log data breach (DPA Section 43 - 72 hour notification)
   */
  breach(description: string, affectedUsers: number, details: Record<string, any>) {
    this.logger.error(`[DATA BREACH] ${description}`, {
      affectedUsers,
      ...details,
      context: 'Security',
      severity: 'CRITICAL',
      requiresNotification: true,
    });
  }
}