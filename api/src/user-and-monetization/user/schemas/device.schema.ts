// src/user-and-monetization/user/schemas/device.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceDocument = Device & Document;

/**
 * 📱 DEVICE SCHEMA - Anti-Account Sharing Core
 * 
 * WHY THIS EXISTS:
 * - Enforce device limits (3 devices per account: phone, laptop, TV)
 * - Detect account sharing (too many devices)
 * - Track device trust levels
 * - Enable "Remove Device" feature
 * 
 * NETFLIX STRATEGY:
 * - Each device gets persistent ID (survives browser refresh)
 * - New device login = check limits BEFORE allowing
 * - Exceeding limits = deny login OR kick oldest device
 * 
 * DEVICE FINGERPRINTING:
 * - deviceId is a stable hash of: User-Agent + Accept-Language + headers
 * - Same browser = same deviceId (even after logout/login)
 * - Different browser = different deviceId
 * 
 * ✅ CRITICAL FIX (2026-01-25):
 * - Changed from single deviceId unique index to COMPOUND (userId + deviceId)
 * - This prevents E11000 duplicate key errors during login
 * - Allows same deviceId for different users (shared computers in internet cafes)
 * - Still prevents duplicate devices for the same user
 */
@Schema({ timestamps: true })
export class Device {
  _id: Types.ObjectId;

  // 👤 USER RELATIONSHIP
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // 🔑 DEVICE IDENTIFICATION (Stable fingerprint)
  // ✅ REMOVED unique: true - we use compound index instead
  @Prop({ required: true })
  deviceId: string; // Hash of browser fingerprint

  @Prop({ 
    required: true, 
    enum: ['phone', 'laptop', 'tv', 'tablet', 'unknown'],
  })
  deviceType: string;

  // 🖥️ DEVICE FINGERPRINT DETAILS
  @Prop()
  deviceName?: string; // e.g., "Chrome 120 on Windows 11"

  @Prop()
  os?: string; // e.g., "Windows 11", "macOS 14", "Android 13"

  @Prop()
  browser?: string; // e.g., "Chrome 120", "Safari 17", "Firefox 115"

  @Prop()
  appVersion?: string; // For mobile apps

  // 🌍 REGISTRATION INFO (First time this device was seen)
  @Prop({ required: true })
  firstSeenIp: string;

  @Prop()
  firstSeenCountry?: string;

  @Prop({ type: Date, default: Date.now })
  firstSeenAt: Date; // ✅ This is what we use instead of createdAt

  // ⏰ ACTIVITY TRACKING (Last time this device was used)
  @Prop({ type: Date, default: Date.now })
  lastSeenAt: Date;

  @Prop()
  lastSeenIp?: string;

  // 🔐 TRUST & STATUS
  @Prop({ default: true })
  trusted: boolean; // Can be set to false if suspicious activity detected

  @Prop({ default: true })
  active: boolean; // Set to false when user removes device

  // 📊 USAGE STATS
  @Prop({ default: 0 })
  loginCount: number; // Incremented on each login from this device

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// 🔍 CRITICAL FIX: COMPOUND UNIQUE INDEX (userId + deviceId)
// This is the KEY to preventing E11000 duplicate key errors
// - Same deviceId CAN exist for different users (shared computers)
// - Same deviceId CANNOT exist twice for the same user (prevents duplicates)
DeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true, name: 'userId_deviceId_unique' });

// 🔍 PERFORMANCE INDEXES (for faster queries)
DeviceSchema.index({ userId: 1, active: 1 }); // Find active devices for user
DeviceSchema.index({ userId: 1, deviceType: 1 }); // Find devices by type
DeviceSchema.index({ lastSeenAt: -1 }); // Sort by last activity

// ❌ REMOVED: DeviceSchema.index({ deviceId: 1 }, { unique: true }); 
// This was causing the E11000 error - replaced with compound index above