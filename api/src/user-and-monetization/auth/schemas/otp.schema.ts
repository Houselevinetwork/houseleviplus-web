/**
 * OTP Schema - Store verification codes
 * Location: api/src/user-and-monetization/auth/schemas/otp.schema.ts
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Otp extends Document {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: 'login' })
  purpose: string; // 'login' | 'signup' | 'verify_email'
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Index for automatic deletion of expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
