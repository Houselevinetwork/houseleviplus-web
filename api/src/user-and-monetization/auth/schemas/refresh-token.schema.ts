// src/user-and-monetization/auth/schemas/refresh-token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as crypto from 'crypto';

export type RefreshTokenDocument = RefreshToken & Document;

/**
 * 🔄 REFRESH TOKEN SCHEMA - Secure Token Rotation
 * 
 * WHY THIS EXISTS:
 * - Access tokens are short-lived (10 min) for security
 * - Refresh tokens allow getting new access tokens without re-login
 * - ONE-TIME USE: Each refresh invalidates old token, creates new one
 * - REUSE DETECTION: Using old token = compromise = revoke ALL sessions
 * 
 * NETFLIX SECURITY MODEL:
 * - Refresh token stored HASHED (like passwords)
 * - Bound to specific session + device
 * - Automatic rotation on every use
 * - Immediate revocation on suspicious activity
 */
@Schema({ timestamps: true })
export class RefreshToken {
  _id: Types.ObjectId;

  // 🔗 RELATIONSHIPS
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Device', required: true })
  deviceId: Types.ObjectId;

  // 🔑 TOKEN DATA (SECURITY CRITICAL)
  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  tokenFamily: string;

  // ⏰ LIFECYCLE
  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date })
  lastUsedAt?: Date;

  // 🚨 REVOCATION & SECURITY
  @Prop({ default: false })
  revoked: boolean;

  @Prop()
  revokedAt?: Date;

  @Prop()
  revokedReason?: string;

  // 🔄 ROTATION TRACKING
  @Prop({ default: false })
  used: boolean;

  @Prop({ type: Types.ObjectId, ref: 'RefreshToken' })
  replacedBy?: Types.ObjectId;

  // 📊 SECURITY METADATA
  @Prop()
  issuedIp?: string;

  @Prop({ default: 0 })
  rotationCount: number;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// 🔍 COMPOUND INDEXES (no duplicates)
RefreshTokenSchema.index({ userId: 1, revoked: 1 });
RefreshTokenSchema.index({ tokenFamily: 1 });
RefreshTokenSchema.index({ expiresAt: 1 });

// 🛠️ HELPER METHODS
RefreshTokenSchema.statics.hashToken = function(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
};

RefreshTokenSchema.statics.generateToken = function(): string {
  return crypto.randomBytes(64).toString('hex');
};