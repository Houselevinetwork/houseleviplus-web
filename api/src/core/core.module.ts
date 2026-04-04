// src/core/core.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// ========================================
// 🧠 CORE SUBMODULES
// ========================================
import { ConfigService as CoreConfigService } from './config/config.service';
import { CacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { MailModule } from './mail/mail.module';

/**
 * CoreModule - Central module that aggregates all core functionality
 * 
 * Exports:
 * - Cache operations (via CacheModule)
 * - Configuration management (via ConfigModule)
 * - Database connections (via DatabaseModule)
 * - Logging (via LoggerModule)
 * - Email services (via MailModule)
 * 
 * This module should be imported early in AppModule, after ConfigModule.forRoot()
 */
@Module({
  imports: [
    // Import all core submodules
    ConfigModule,
    CacheModule,
    DatabaseModule,
    LoggerModule,
    MailModule,
  ],
  providers: [
    CoreConfigService,
  ],
  exports: [
    // Export all core modules so they're available to the rest of the application
    CacheModule,
    DatabaseModule,
    LoggerModule,
    MailModule,
    CoreConfigService,
  ],
})
export class CoreModule {}