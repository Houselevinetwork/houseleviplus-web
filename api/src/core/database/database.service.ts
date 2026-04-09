import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Db } from 'mongodb';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async isHealthy(): Promise<{
    connected: boolean;
    responseTime: number;
    database: string;
    collections: number;
  }> {
    const startTime = Date.now();

    try {
      if (!this.connection || !this.connection.db) {
        throw new Error('Database connection not initialized');
      }

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

  getConnectionStats() {
    return {
      readyState: this.getReadyStateText(),
      database: this.connection.name,
      host: this.connection.host,
      models: Object.keys(this.connection.models).length,
    };
  }

  private getReadyStateText(): string {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[this.connection.readyState] || 'unknown';
  }

  async gracefulShutdown(): Promise<void> {
    console.log('Closing database connections...');
    await this.connection.close();
    console.log('Database connections closed gracefully');
  }

  getDatabase(): Db {
    if (!this.connection.db) {
      throw new Error('Database not yet connected');
    }
    return this.connection.db as Db;
  }

  getConnection(): Connection {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection.readyState === 1;
  }
}