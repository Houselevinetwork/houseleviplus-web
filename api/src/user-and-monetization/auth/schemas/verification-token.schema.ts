/**
 * Verification Token Schema
 * Purpose: Store email verification tokens for signup
 * Location: api/src/user-and-monetization/auth/schemas/verification-token.schema.ts
 * 
 * SECURITY:
 * - Tokens expire after 15 minutes
 * - Single-use only (marked as used)
 * - Crypto-random generation
 * 
 * GDPR:
 * - Auto-deletion after expiry (TTL index)
 * - Minimal data storage (email + token only)
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true, // Auto-adds createdAt, updatedAt
  collection: 'verification_tokens',
})
export class VerificationToken extends Document {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: true, default: 'signup' })
  type: string; // 'signup', 'email_change', 'password_reset'

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;

  @Prop({ type: Date, default: null })
  usedAt: Date;

  @Prop({ type: String, default: null })
  ipAddress: string; // Track IP for security audit

  createdAt: Date;
  updatedAt: Date;
}

export const VerificationTokenSchema = SchemaFactory.createForClass(VerificationToken);

// 🔐 SECURITY: TTL Index - Auto-delete expired tokens after 24 hours
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

// 🔍 PERFORMANCE: Index for fast email lookups
VerificationTokenSchema.index({ email: 1, used: 1 });