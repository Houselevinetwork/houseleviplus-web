// src/user-and-monetization/auth/schemas/session.schema.ts - NETFLIX-GRADE
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

/**
 * 🔐 SESSION SCHEMA - Netflix-Grade Session + Streaming Tracking
 * 
 * WHY THIS EXISTS:
 * - Track every active login (which device, when, where)
 * - Revoke sessions on logout/password change/suspicious activity
 * - Detect account sharing (multiple IPs, countries)
 * - Enforce device limits + concurrent stream limits
 * 
 * SECURITY PRINCIPLES:
 * - Server-side truth (frontend cannot fake sessions)
 * - Revocable (logout actually works)
 * - Auditable (see all active sessions)
 */
@Schema({ timestamps: true })
export class Session {
  _id: Types.ObjectId;

  // 👤 USER RELATIONSHIP
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // 📱 DEVICE RELATIONSHIP
  @Prop({ type: Types.ObjectId, ref: 'Device', required: true, index: true })
  deviceId: Types.ObjectId;

  // 🔑 SESSION METADATA
  @Prop({ required: true, unique: true })
  sessionId: string; // UUID for this specific session

  // 🌍 SECURITY TRACKING
  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  country?: string;

  @Prop()
  city?: string;

  // ⏰ LIFECYCLE
  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date })
  lastSeenAt: Date;

  // 🚨 REVOCATION
  @Prop({ default: false })
  revoked: boolean;

  @Prop()
  revokedAt?: Date;

  @Prop()
  revokedReason?: string;

  // 📊 USAGE TRACKING
  @Prop({ default: 0 })
  requestCount: number;

  // 🎬 STREAMING TRACKING (Netflix-style concurrent stream limit)
  @Prop({ default: false })
  isStreaming: boolean; // Is this session currently playing content?

  @Prop()
  currentContentId?: string; // What content is being watched?

  @Prop({ type: Date })
  streamStartedAt?: Date; // When did playback start?

  @Prop({ type: Date })
  lastHeartbeat?: Date; // Last playback heartbeat (for auto-stop)
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// 🔍 COMPOUND INDEXES (no duplicates)
SessionSchema.index({ userId: 1, revoked: 1 });
SessionSchema.index({ userId: 1, isStreaming: 1 }); // ✅ NEW: For stream counting
SessionSchema.index({ expiresAt: 1 });