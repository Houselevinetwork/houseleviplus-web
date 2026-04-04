// src/modules/content/playback.controller.ts - NETFLIX-GRADE
import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../user-and-monetization/auth/guards/subscription.guard';
import { SessionService } from '../../user-and-monetization/auth/services/session.service';

@Controller('api/playback')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
export class PlaybackController {
  private readonly logger = new Logger(PlaybackController.name);

  constructor(private sessionService: SessionService) {}

  /**
   * 🎬 START PLAYBACK - Enforces 3 concurrent stream limit
   */
  @Post('start')
  async startPlayback(@Request() req, @Body() body: { contentId: string }) {
    const { sessionId, userId } = req.user;
    
    this.logger.log(`🎬 Playback start requested: ${body.contentId} by user ${userId}`);
    
    // ✅ Netflix-style: Check concurrent stream limit (3 max)
    await this.sessionService.startStream(sessionId, body.contentId, 3);

    return {
      success: true,
      message: 'Playback started',
      contentId: body.contentId,
      maxConcurrentStreams: 3,
    };
  }

  /**
   * ⏹️ STOP PLAYBACK
   */
  @Post('stop')
  async stopPlayback(@Request() req) {
    const { sessionId } = req.user;
    
    await this.sessionService.stopStream(sessionId);

    return {
      success: true,
      message: 'Playback stopped',
    };
  }

  /**
   * 💓 HEARTBEAT - Keep stream alive (called every 30 seconds from frontend)
   */
  @Post('heartbeat')
  async playbackHeartbeat(@Request() req, @Body() body: { contentId: string; position: number }) {
    const { sessionId } = req.user;
    
    await this.sessionService.updateHeartbeat(sessionId);

    return { 
      success: true,
      position: body.position,
    };
  }

  /**
   * 📊 GET ACTIVE STREAM COUNT (for debugging/UI)
   */
  @Post('status')
  async getPlaybackStatus(@Request() req) {
    const { userId } = req.user;
    
    const activeStreams = await this.sessionService.getActiveStreamCount(userId);

    return {
      success: true,
      activeStreams,
      maxStreams: 3,
      canStartNewStream: activeStreams < 3,
    };
  }
}