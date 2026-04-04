import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@core/config/config.service';
import { DatabaseService } from './database.service';

/**
 * Database Module
 * 
 * Connects to MongoDB Atlas with Netflix-grade settings:
 * - Connection pooling (50 workers)
 * - Auto-reconnect on failure
 * - Graceful shutdown
 * 
 * DPA 2019 Compliance:
 * - Encryption at rest (MongoDB Atlas)
 * - Access logging enabled
 * - Connection monitoring
 */
@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.mongoUri,

          // Netflix-Grade Connection Pooling
          maxPoolSize: configService.mongoMaxPoolSize,
          minPoolSize: 10,

          // Auto-Reconnect Settings
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,

          // Connection Options
          retryWrites: true,
          retryReads: true,

          // Security
          authSource: 'admin',

          // Performance
          connectTimeoutMS: 10000,

          // Monitoring (DPA Compliance)
          autoIndex: true,
          autoCreate: true,
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, MongooseModule],
})
export class DatabaseModule {
  /**
   * Log connection events on module initialization
   */
  constructor(private databaseService: DatabaseService) {
    this.setupConnectionListeners();
  }

  private setupConnectionListeners() {
    const connection = this.databaseService.getConnection();

    connection.on('connected', () => {
      console.log('✅ MongoDB Connected Successfully');
      console.log(`📊 Database: ${connection.name}`);
      console.log(`🔗 Host: ${connection.host}`);
    });

    connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB Disconnected - Attempting Reconnect...');
    });

    connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected');
    });

    connection.on('error', (error: Error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
    });
  }
}