// src/user-and-monetization/auth/services/refresh-token.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefreshToken, RefreshTokenDocument } from '../schemas/refresh-token.schema';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  /**
   * Generate new refresh token on login
   * ✅ Used by: login.service.ts, registration.service.ts
   * Returns: { token: string, tokenDocument: RefreshTokenDocument }
   */
  async generate(
    userId: string,
    sessionId: string,
    deviceId: string,
    ipAddress: string,
  ): Promise<{ token: string; tokenDocument: RefreshTokenDocument }> {
    // Generate random token
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(token);
    const tokenFamily = uuidv4(); // All rotations share same family

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const refreshToken = new this.refreshTokenModel({
      userId: new Types.ObjectId(userId),
      sessionId: new Types.ObjectId(sessionId),
      deviceId: new Types.ObjectId(deviceId),
      tokenHash,
      tokenFamily,
      expiresAt,
      issuedIp: ipAddress,
      rotationCount: 0,
      revoked: false,
      used: false,
    });

    const saved = await refreshToken.save();
    this.logger.log(`✅ Refresh token created for session: ${sessionId}`);

    return { token, tokenDocument: saved };
  }

  /**
   * Validate refresh token (check if exists and not expired/revoked)
   * ✅ Used by: rotate() for validation
   */
  async validate(token: string): Promise<RefreshTokenDocument> {
    const tokenHash = this.hashToken(token);

    const refreshToken = await this.refreshTokenModel.findOne({ tokenHash }).exec();

    if (!refreshToken) {
      this.logger.error('❌ Invalid or revoked refresh token used');
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.revoked) {
      this.logger.warn('⚠️ Revoked refresh token attempted');
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (refreshToken.expiresAt < new Date()) {
      this.logger.warn('⚠️ Expired refresh token used');
      throw new UnauthorizedException('Refresh token expired');
    }

    return refreshToken;
  }

  /**
   * Rotate refresh token (called when access token expires)
   * ✅ Used by: auth.service.ts refreshToken()
   * CRITICAL: One-time use + reuse detection for security
   */
  async rotate(
    oldToken: string,
    ipAddress: string,
  ): Promise<{ token: string; userId: string; sessionId: string; deviceId: string }> {
    const tokenHash = this.hashToken(oldToken);

    // Find token
    const oldRefreshToken = await this.refreshTokenModel
      .findOne({ tokenHash, revoked: false })
      .exec();

    if (!oldRefreshToken) {
      this.logger.error('❌ Invalid or revoked refresh token used');
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check expiry
    if (oldRefreshToken.expiresAt < new Date()) {
      this.logger.warn('⚠️ Expired refresh token used');
      throw new UnauthorizedException('Refresh token expired');
    }

    // 🚨 CRITICAL: Check if already used (REUSE DETECTION)
    if (oldRefreshToken.used) {
      this.logger.error(
        `🚨 REUSE DETECTED: Token family ${oldRefreshToken.tokenFamily} - Revoking ALL tokens in family`
      );
      await this.revokeTokenFamily(oldRefreshToken.tokenFamily, 'reuse_detected');
      throw new UnauthorizedException('Token reuse detected. All sessions revoked for security.');
    }

    // Mark old token as used
    oldRefreshToken.used = true;
    oldRefreshToken.lastUsedAt = new Date();
    await oldRefreshToken.save();
    this.logger.log(`✅ Old token marked as used`);

    // Generate new token (same family)
    const newToken = crypto.randomBytes(64).toString('hex');
    const newTokenHash = this.hashToken(newToken);

    const newRefreshToken = new this.refreshTokenModel({
      userId: oldRefreshToken.userId,
      sessionId: oldRefreshToken.sessionId,
      deviceId: oldRefreshToken.deviceId,
      tokenHash: newTokenHash,
      tokenFamily: oldRefreshToken.tokenFamily, // Same family
      expiresAt: oldRefreshToken.expiresAt,
      issuedIp: ipAddress,
      rotationCount: oldRefreshToken.rotationCount + 1,
      revoked: false,
      used: false,
    });

    const savedNewToken = await newRefreshToken.save();
    this.logger.log(`✅ New token created in family: ${oldRefreshToken.tokenFamily}`);

    // Link old token to new one
    oldRefreshToken.replacedBy = savedNewToken._id;
    await oldRefreshToken.save();
    this.logger.log(`🔄 Token rotated: Family ${oldRefreshToken.tokenFamily}, Count: ${savedNewToken.rotationCount}`);

    return {
      token: newToken,
      userId: oldRefreshToken.userId.toString(),
      sessionId: oldRefreshToken.sessionId.toString(),
      deviceId: oldRefreshToken.deviceId.toString(),
    };
  }

  /**
   * Revoke single refresh token
   * ✅ Used by: auth.service.ts logout()
   */
  async revoke(token: string, reason: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    
    await this.refreshTokenModel.updateOne(
      { tokenHash },
      { 
        revoked: true, 
        revokedAt: new Date(),
        revokedReason: reason 
      }
    );

    this.logger.log(`🔄 Refresh token revoked - ${reason}`);
  }

  /**
   * Revoke all tokens in a family (reuse detection)
   * ✅ Used by: rotate() when token reuse detected
   */
  async revokeTokenFamily(tokenFamily: string, reason: string): Promise<void> {
    const result = await this.refreshTokenModel.updateMany(
      { tokenFamily },
      { 
        revoked: true, 
        revokedAt: new Date(),
        revokedReason: reason 
      }
    );

    this.logger.warn(`🚨 Token family revoked: ${tokenFamily} - ${reason} (${result.modifiedCount} tokens)`);
  }

  /**
   * Revoke all user's refresh tokens (password change, logout all)
   * ✅ Used by: password.service.ts resetPassword(), auth.service.ts logoutAllDevices()
   * Returns: number of tokens revoked
   */
  async revokeAllUserTokens(userId: string, reason: string): Promise<number> {
    const result = await this.refreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), revoked: false },
      { 
        revoked: true, 
        revokedAt: new Date(),
        revokedReason: reason 
      }
    );

    this.logger.warn(`🔄 All ${result.modifiedCount} refresh tokens revoked for user ${userId} - ${reason}`);
    return result.modifiedCount;
  }

  /**
   * Find refresh token by token string
   * ✅ Returns: RefreshTokenDocument | null (nullable for type safety)
   */
  async findByToken(token: string): Promise<RefreshTokenDocument | null> {
    const tokenHash = this.hashToken(token);
    return this.refreshTokenModel.findOne({ tokenHash }).exec();
  }

  /**
   * Find all refresh tokens for a user
   * ✅ Used by: auth.service.ts logoutAllDevices() for monitoring
   */
  async findByUserId(userId: string): Promise<RefreshTokenDocument[]> {
    return this.refreshTokenModel
      .find({
        userId: new Types.ObjectId(userId),
        revoked: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  /**
   * Count active refresh tokens for user
   */
  async countActiveForUser(userId: string): Promise<number> {
    return this.refreshTokenModel.countDocuments({
      userId: new Types.ObjectId(userId),
      revoked: false,
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Cleanup expired tokens (cron job)
   * Run this periodically to clean up old tokens
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.refreshTokenModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    this.logger.log(`🧹 Cleaned up ${result.deletedCount} expired refresh tokens`);
    return result.deletedCount;
  }

  /**
   * Hash token using SHA-256
   * Private method for internal use
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}