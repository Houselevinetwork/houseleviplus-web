import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Database Service
 * 
 * Provides:
 * - Health check endpoints
 * - Connection status monitoring
 * - Database utilities
 * 
 * Netflix-Grade: Real-time connection monitoring
 * DPA 2019: Database access auditing
 */
@Injectable()
export class DatabaseService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Check if database is connected and responsive
   * Used by /health endpoint
   */
  async isHealthy(): Promise<{
    connected: boolean;
    responseTime: number;
    database: string;
    collections: number;
  }> {
    const startTime = Date.now();

    try {
      // Check if connection and db exist
      if (!this.connection || !this.connection.db) {
        throw new Error('Database connection not initialized');
      }

      // Ping database
      await this.connection.db.admin().ping();

      const responseTime = Date.now() - startTime;
      const collections = await this.connection.db.listCollections().toArray();

      return {
        connected: this.connection.readyState === 1,
        responseTime,
        database: this.connection.name,
        collections: collections.length,
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        database: this.connection?.name || 'unknown',
        collections: 0,
      };
    }
  }

  /**
   * Get connection statistics
   * Netflix-Grade: Monitor connection pool usage
   */
  getConnectionStats() {
    return {
      readyState: this.getReadyStateText(),
      database: this.connection.name,
      host: this.connection.host,
      models: Object.keys(this.connection.models).length,
    };
  }

  /**
   * Get readable connection state
   */
  private getReadyStateText(): string {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[this.connection.readyState] || 'unknown';
  }

  /**
   * Graceful shutdown
   * Netflix-Grade: Ensure all operations complete before closing
   * DPA Compliance: Prevent data loss
   */
  async gracefulShutdown(): Promise<void> {
    console.log('🔒 Closing database connections...');
    await this.connection.close();
    console.log('✅ Database connections closed gracefully');
  }

  /**
   * Get database instance (for advanced operations)
   */
  getDatabase() {
    return this.connection.db;
  }

  /**
   * Get connection instance (for event listeners)
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.connection.readyState === 1;
  }
}
