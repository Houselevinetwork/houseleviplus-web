// src/user-and-monetization/auth/services/session.service.ts - NETFLIX-GRADE COMPLETE
import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from '../schemas/session.schema';
import { v4 as uuidv4 } from 'uuid';

interface CreateSessionDto {
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent?: string;
  country?: string;
  city?: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectModel(Session.name)
    public sessionModel: Model<SessionDocument>,
  ) {}

  /**
   * Create new session on login
   */
  async create(dto: CreateSessionDto): Promise<SessionDocument> {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const session = await this.sessionModel.create({
      userId: new Types.ObjectId(dto.userId),
      deviceId: new Types.ObjectId(dto.deviceId),
      sessionId,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      country: dto.country,
      city: dto.city,
      expiresAt,
      lastSeenAt: new Date(),
      revoked: false,
      requestCount: 0,
      isStreaming: false,
    });

    this.logger.log(`✅ Session created: ${sessionId}`);
    return session;
  }

  /**
   * Find session by sessionId
   * ✅ Returns: SessionDocument | null (nullable for type safety)
   */
  async findById(sessionId: string): Promise<SessionDocument | null> {
    const session = await this.sessionModel.findOne({ sessionId }).exec();
    return session;
  }

  /**
   * Validate session (called on every authenticated request)
   */
  async validate(sessionId: string): Promise<SessionDocument> {
    const session = await this.sessionModel.findOne({ sessionId }).exec();

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.revoked) {
      this.logger.warn(`❌ Revoked session attempted: ${sessionId}`);
      throw new UnauthorizedException('Session has been revoked');
    }

    if (session.expiresAt < new Date()) {
      this.logger.warn(`❌ Expired session attempted: ${sessionId}`);
      throw new UnauthorizedException('Session expired');
    }

    // Update last seen + request count
    await this.sessionModel.updateOne(
      { sessionId },
      { 
        $set: { lastSeenAt: new Date() },
        $inc: { requestCount: 1 }
      }
    );

    return session;
  }

  /**
   * Update session last activity (resets 30-day timer)
   * ✅ Called on token refresh to extend session
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Reset to 30 days from now

    await this.sessionModel.updateOne(
      { sessionId },
      { 
        $set: { 
          lastSeenAt: new Date(),
          expiresAt, // ✅ Extend expiration date by 30 days
        },
      }
    );

    this.logger.log(`⏰ [REFRESH] Session activity updated: ${sessionId} (30-day timer reset)`);
  }

  /**
   * Revoke single session (logout)
   */
  async revoke(sessionId: string, reason: string): Promise<void> {
    await this.sessionModel.updateOne(
      { sessionId },
      { 
        revoked: true, 
        revokedAt: new Date(),
        revokedReason: reason,
        isStreaming: false,
      }
    );
    this.logger.log(`🚪 Session revoked: ${sessionId} - ${reason}`);
  }

  /**
   * Revoke ALL user sessions (password change, security)
   */
  async revokeAllUserSessions(userId: string, reason: string): Promise<number> {
    const result = await this.sessionModel.updateMany(
      { userId: new Types.ObjectId(userId), revoked: false },
      { 
        revoked: true, 
        revokedAt: new Date(),
        revokedReason: reason,
        isStreaming: false,
      }
    );
    this.logger.warn(`🔒 All sessions revoked for user ${userId} - ${reason}`);
    return result.modifiedCount;
  }

  /**
   * Revoke all sessions for a specific device
   */
  async revokeDeviceSessions(deviceId: string): Promise<number> {
    const result = await this.sessionModel.updateMany(
      { deviceId: new Types.ObjectId(deviceId), revoked: false },
      { 
        revoked: true, 
        revokedAt: new Date(),
        revokedReason: 'device_removed',
        isStreaming: false,
      }
    );
    
    this.logger.log(`🗑️ Revoked ${result.modifiedCount} sessions for device ${deviceId}`);
    return result.modifiedCount;
  }

  /**
   * Get all active sessions for user
   */
  async getActiveSessions(userId: string): Promise<SessionDocument[]> {
    return this.sessionModel
      .find({ 
        userId: new Types.ObjectId(userId), 
        revoked: false,
        expiresAt: { $gt: new Date() }
      })
      .populate('deviceId')
      .sort({ lastSeenAt: -1 })
      .exec();
  }

  /**
   * Check if session exists
   */
  async exists(sessionId: string): Promise<boolean> {
    const count = await this.sessionModel.countDocuments({ 
      sessionId, 
      revoked: false 
    });
    return count > 0;
  }

  /**
   * Count active sessions for user
   */
  async countActiveSessions(userId: string): Promise<number> {
    return this.sessionModel.countDocuments({ 
      userId: new Types.ObjectId(userId), 
      revoked: false,
      expiresAt: { $gt: new Date() }
    });
  }

  /**
   * Cleanup expired sessions (cron job)
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.sessionModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    this.logger.log(`🧹 Cleaned up ${result.deletedCount} expired sessions`);
    return result.deletedCount;
  }

  // ========================================
  // 🎬 NETFLIX-STYLE STREAMING METHODS
  // ========================================

  /**
   * Start streaming - Enforce concurrent stream limit
   */
  async startStream(
    sessionId: string,
    contentId: string,
    maxConcurrentStreams: number = 3,
  ): Promise<void> {
    const session = await this.sessionModel.findOne({ sessionId }).exec();
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    // Check active streams for this user
    const activeStreams = await this.sessionModel.countDocuments({
      userId: session.userId,
      isStreaming: true,
      revoked: false,
    });

    if (activeStreams >= maxConcurrentStreams) {
      this.logger.warn(`❌ Stream limit reached for user ${session.userId}`);
      throw new ForbiddenException(
        `Too many active streams. Your plan allows ${maxConcurrentStreams} concurrent stream(s).`,
      );
    }

    // Mark session as streaming
    await this.sessionModel.findOneAndUpdate(
      { sessionId },
      {
        isStreaming: true,
        currentContentId: contentId,
        streamStartedAt: new Date(),
        lastHeartbeat: new Date(),
      },
    );

    this.logger.log(`🎬 Stream started: ${contentId} (session: ${sessionId})`);
  }

  /**
   * Stop streaming
   */
  async stopStream(sessionId: string): Promise<void> {
    await this.sessionModel.findOneAndUpdate(
      { sessionId },
      {
        isStreaming: false,
        currentContentId: null,
        streamStartedAt: null,
        lastHeartbeat: null,
      },
    );

    this.logger.log(`⏹️ Stream stopped (session: ${sessionId})`);
  }

  /**
   * Update playback heartbeat (keep stream alive)
   */
  async updateHeartbeat(sessionId: string): Promise<void> {
    await this.sessionModel.findOneAndUpdate(
      { sessionId },
      { lastHeartbeat: new Date() },
    );
  }

  /**
   * Get active stream count for user
   */
  async getActiveStreamCount(userId: string): Promise<number> {
    return this.sessionModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isStreaming: true,
      revoked: false,
    });
  }

  /**
   * Auto-stop stale streams (no heartbeat for 5+ minutes)
   */
  async cleanupStaleStreams(): Promise<number> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const result = await this.sessionModel.updateMany(
      {
        isStreaming: true,
        lastHeartbeat: { $lt: fiveMinutesAgo },
      },
      {
        isStreaming: false,
        currentContentId: null,
        streamStartedAt: null,
        lastHeartbeat: null,
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`🧹 Auto-stopped ${result.modifiedCount} stale streams`);
    }

    return result.modifiedCount;
  }

  /**
   * End all sessions (alias for revokeAllUserSessions)
   * ✅ Used by: auth.service.ts logoutAllDevices()
   */
  async endAllSessions(userId: string): Promise<number> {
    return this.revokeAllUserSessions(userId, 'user_logout_all');
  }

  /**
   * End session (alias for revoke)
   * ✅ Used by: auth.controller.ts logout()
   */
  async endSession(sessionId: string): Promise<void> {
    return this.revoke(sessionId, 'user_logout');
  }
}