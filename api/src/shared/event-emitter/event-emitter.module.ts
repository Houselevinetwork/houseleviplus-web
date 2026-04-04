import { Module } from '@nestjs/common';
import { EventEmitterModule as NestEventEmitterModule } from '@nestjs/event-emitter';

/**
 * 🎯 Event Emitter Module
 * 
 * Provides event-driven architecture for the application.
 * Used by PesaPal to emit payment events that trigger subscription activation.
 * 
 * Location: src/shared/event-emitter/event-emitter.module.ts
 */
@Module({
  imports: [
    NestEventEmitterModule.forRoot({
      // Max listeners per event
      maxListeners: 10,
      // Whether to print warnings for async errors
      verboseMemoryLeak: true,
      // Ignore specific warnings
      ignoreErrors: false,
    }),
  ],
  exports: [NestEventEmitterModule],
})
export class EventEmitterModule {}