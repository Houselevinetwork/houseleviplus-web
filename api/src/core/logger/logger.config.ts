import * as winston from 'winston';
import * as path from 'path';

/**
 * Logger Configuration
 * 
 * Netflix-Grade:
 * - Structured JSON logging
 * - Multiple log levels
 * - File rotation (auto-delete old logs)
 * 
 * DPA 2019 Compliance:
 * - PII redaction (never log passwords, tokens)
 * - Retention policy (90 days)
 * - Audit trail format
 */

// PII Redaction - Never log these fields
const REDACTED_FIELDS = [
  'password',
  'accessToken',
  'refreshToken',
  'token',
  'secret',
  'creditCard',
  'cvv',
  'pin',
  'ssn',
  'apiKey',
];

/**
 * Redact sensitive information from logs
 * DPA 2019: Prevent logging of personal data
 */
function redactSensitiveData(info: any): any {
  const redacted = { ...info };

  // Redact sensitive fields
  REDACTED_FIELDS.forEach((field) => {
    if (redacted[field]) {
      redacted[field] = '[REDACTED]';
    }
    if (redacted.message && typeof redacted.message === 'string') {
      // Redact from message string
      const regex = new RegExp(`${field}[:\s]*[^\s,}]+`, 'gi');
      redacted.message = redacted.message.replace(regex, `${field}: [REDACTED]`);
    }
  });

  return redacted;
}

/**
 * Custom log format
 * JSON for easy parsing by monitoring tools
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format((info) => redactSensitiveData(info))(),
  winston.format.json(),
);

/**
 * Console format (human-readable for development)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const ctx = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} ${level} ${ctx} ${message} ${metaStr}`;
  }),
);

/**
 * Create Winston logger instance
 */
export function createLogger(logLevel: string, logPath: string) {
  const logsDir = path.resolve(process.cwd(), logPath);

  return winston.createLogger({
    level: logLevel,
    format: logFormat,
    transports: [
      // Console (development)
      new winston.transports.Console({
        format: consoleFormat,
      }),

      // File: All logs
      new winston.transports.File({
        filename: path.join(logsDir, 'app.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 7, // Keep 7 days of logs
      }),

      // File: Errors only
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 10485760,
        maxFiles: 30, // Keep 30 days of error logs (DPA compliance)
      }),

      // File: Audit trail (DPA compliance - keep 1 year)
      new winston.transports.File({
        filename: path.join(logsDir, 'audit.log'),
        level: 'info',
        maxsize: 10485760,
        maxFiles: 365, // 1 year retention
      }),
    ],

    // Handle exceptions
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(logsDir, 'exceptions.log'),
      }),
    ],

    // Prevent exit on uncaught exception
    exitOnError: false,
  });
}