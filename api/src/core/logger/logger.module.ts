import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@core/config/config.service';
import { LoggerService } from './logger.service';
import { createLogger } from './logger.config';

/**
 * Logger Module
 * 
 * Global module providing structured logging
 * 
 * Netflix-Grade: Centralized logging infrastructure
 * DPA 2019: Audit trail and breach notification logging
 */
@Global()
@Module({
  providers: [
    {
      provide: 'WINSTON_LOGGER',
      useFactory: (configService: ConfigService) => {
        return createLogger(
          configService.logLevel,
          configService.logFilePath,
        );
      },
      inject: [ConfigService],
    },
    LoggerService,
  ],
  exports: [LoggerService],
})
export class LoggerModule {}