// src/user-and-monetization/auth/services/device.service.ts - NETFLIX-GRADE FIXED
import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device, DeviceDocument } from '../../user/schemas/device.schema';

interface RegisterDeviceDto {
  userId: string;
  deviceId: string;  // ✅ This is now the FINGERPRINT HASH (stable)
  deviceType: 'phone' | 'laptop' | 'tv' | 'tablet' | 'unknown';
  deviceName?: string;
  os?: string;
  browser?: string;
  appVersion?: string;
  ipAddress: string;
  country?: string;
}

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private readonly MAX_DEVICES = 3;

  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {
    // ✅ TEMPORARY FIX: Drop old deviceId index on startup
    this.fixIndexes().catch(err => {
      this.logger.warn(`Index fix warning: ${err.message}`);
    });
  }

  /**
   * Fix duplicate index issue - runs once on startup
   * Remove this method after indexes are fixed in production
   */
  private async fixIndexes(): Promise<void> {
    try {
      // Drop the problematic deviceId_1 index if it exists
      await this.deviceModel.collection.dropIndex('deviceId_1');
      this.logger.log('✅ Dropped old deviceId_1 index');
    } catch (error: any) {
      // Index might not exist, that's fine
      if (error.code !== 27) { // 27 = IndexNotFound
        this.logger.debug(`Index drop info: ${error.message}`);
      }
    }

    // Ensure compound index exists
    try {
      await this.deviceModel.collection.createIndex(
        { userId: 1, deviceId: 1 },
        { unique: true, name: 'userId_deviceId_unique' }
      );
      this.logger.log('✅ Created compound userId + deviceId index');
    } catch (error: any) {
      // Index might already exist
      this.logger.debug(`Index creation info: ${error.message}`);
    }
  }

  /**
   * ✅ NETFLIX LOGIC: Find or Create Device (FIXED - No more E11000 errors)
   * 
   * - deviceId is now a STABLE FINGERPRINT (not random UUID)
   * - If fingerprint exists → UPDATE existing device (don't create new)
   * - If fingerprint is new → Check limit, then create
   * - Device persists even after logout
   * - Uses upsert to handle race conditions gracefully
   */
  async registerOrUpdate(dto: RegisterDeviceDto): Promise<DeviceDocument> {
    try {
      // 1️⃣ Try to find and update existing device using findOneAndUpdate with upsert
      // This handles race conditions and prevents E11000 duplicate key errors
      // Uses compound index (userId + deviceId) instead of just deviceId
      const device = await this.deviceModel.findOneAndUpdate(
        {
          userId: new Types.ObjectId(dto.userId),
          deviceId: dto.deviceId, // ✅ Compound key: both userId AND deviceId must match
        },
        {
          $set: {
            lastSeenAt: new Date(),
            lastSeenIp: dto.ipAddress,
            lastLoginAt: new Date(),
            active: true, // Reactivate if deactivated
            // Update device info in case browser/OS updated
            deviceName: dto.deviceName || 'Unknown device',
            os: dto.os,
            browser: dto.browser,
            appVersion: dto.appVersion,
          },
          $inc: {
            loginCount: 1, // Increment login counter
          },
          $setOnInsert: {
            // These fields only set on first creation (when upsert creates new doc)
            userId: new Types.ObjectId(dto.userId), // Must include userId for compound index
            deviceId: dto.deviceId,
            deviceType: dto.deviceType,
            firstSeenIp: dto.ipAddress,
            firstSeenCountry: dto.country,
            trusted: true,
          },
        },
        {
          upsert: true, // Create if doesn't exist
          new: true,    // Return the updated document
          runValidators: true,
        },
      ).exec();

      if (!device) {
        throw new Error('Failed to register/update device');
      }

      // Check if this was a new device creation by checking if loginCount is 1
      const isNewDevice = device.loginCount === 1;

      if (isNewDevice) {
        this.logger.log(`✅ New device registered: ${dto.deviceName} (fingerprint: ${dto.deviceId.substring(0, 8)}...)`);
        
        // 2️⃣ Check if user exceeded device limit (only for new devices)
        const activeDevices = await this.deviceModel.countDocuments({
          userId: new Types.ObjectId(dto.userId),
          active: true,
        });

        if (activeDevices > this.MAX_DEVICES) {
          // Remove the device we just created since it exceeds limit
          await this.deviceModel.deleteOne({ _id: device._id });
          
          this.logger.warn(`❌ Device limit reached for user ${dto.userId}`);
          this.logger.warn(`   Active devices: ${activeDevices}/${this.MAX_DEVICES}`);
          this.logger.warn(`   Attempted device: ${dto.deviceName} (${dto.deviceType})`);
          
          throw new ForbiddenException(
            `Maximum ${this.MAX_DEVICES} devices allowed. Please remove an old device from your account settings before adding a new one.`
          );
        }
      } else {
        this.logger.log(`✅ Recognized existing device: ${dto.deviceName} (fingerprint: ${dto.deviceId.substring(0, 8)}...)`);
      }

      return device;
    } catch (error) {
      // If it's already our ForbiddenException, re-throw it
      if (error instanceof ForbiddenException) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error(`❌ Device registration failed: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to register device');
    }
  }

  /**
   * Find device by deviceId (fingerprint)
   */
  async findByDeviceId(deviceId: string): Promise<DeviceDocument | null> {
    return this.deviceModel.findOne({ deviceId, active: true }).exec();
  }

  /**
   * Find device by ID
   */
  async findById(id: string): Promise<DeviceDocument | null> {
    return this.deviceModel.findById(id).exec();
  }

  /**
   * Get all user's active devices
   */
  async getUserDevices(userId: string): Promise<DeviceDocument[]> {
    return this.deviceModel
      .find({ userId: new Types.ObjectId(userId), active: true })
      .sort({ lastSeenAt: -1 })
      .exec();
  }

  /**
   * Get all devices for a user (alias for compatibility)
   */
  async findByUserId(userId: string): Promise<DeviceDocument[]> {
    return this.getUserDevices(userId);
  }

  /**
   * Remove device (deactivate)
   */
  async removeDevice(userId: string, deviceId: string): Promise<void> {
    const result = await this.deviceModel.updateOne(
      { userId: new Types.ObjectId(userId), deviceId },
      { active: false }
    );

    if (result.modifiedCount === 0) {
      throw new BadRequestException('Device not found or already removed');
    }

    this.logger.log(`🗑️ Device removed: ${deviceId.substring(0, 8)}...`);
  }

  /**
   * Deactivate a device (soft delete) - alias for compatibility
   */
  async deactivate(deviceId: string): Promise<void> {
    await this.deviceModel.updateOne(
      { _id: deviceId },
      { $set: { active: false } },
    ).exec();

    this.logger.log(`🚫 Device deactivated: ${deviceId}`);
  }

  /**
   * Mark device as untrusted (security)
   */
  async markUntrusted(deviceId: string): Promise<void> {
    await this.deviceModel.updateOne({ deviceId }, { trusted: false });
    this.logger.warn(`⚠️ Device marked untrusted: ${deviceId.substring(0, 8)}...`);
  }

  /**
   * Update device last used timestamp
   */
  async updateLastUsed(deviceId: string, ipAddress: string): Promise<void> {
    await this.deviceModel.updateOne(
      { _id: deviceId },
      {
        $set: {
          lastSeenAt: new Date(),
          lastSeenIp: ipAddress,
        },
      },
    ).exec();
  }

  /**
   * Count total active devices for user
   */
  async countActiveDevices(userId: string): Promise<number> {
    return this.deviceModel.countDocuments({
      userId: new Types.ObjectId(userId),
      active: true,
    });
  }

  /**
   * Count user devices (alias for compatibility)
   */
  async countUserDevices(userId: string): Promise<number> {
    return this.countActiveDevices(userId);
  }

  /**
   * Count devices by type (for analytics)
   */
  async countByType(userId: string, deviceType: string): Promise<number> {
    return this.deviceModel.countDocuments({
      userId: new Types.ObjectId(userId),
      deviceType,
      active: true,
    });
  }

  /**
   * Deactivate all devices for user (e.g., password change)
   */
  async deactivateAllDevices(userId: string): Promise<void> {
    await this.deviceModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { active: false }
    );
    this.logger.log(`🔒 All devices deactivated for user ${userId}`);
  }

  /**
   * Delete all devices for a user (for account deletion)
   */
  async deleteUserDevices(userId: string): Promise<void> {
    await this.deviceModel.deleteMany({ userId: new Types.ObjectId(userId) }).exec();
    this.logger.log(`🗑️ Deleted all devices for user: ${userId}`);
  }

  /**
   * Get device limit for user (can be expanded based on subscription)
   */
  getDeviceLimit(subscriptionTier: string): number {
    const limits = {
      free: 2,
      basic: 3,
      premium: 5,
      family: 10,
    };
    return limits[subscriptionTier] || limits.free;
  }

  /**
   * Check if user has reached device limit
   */
  async hasReachedDeviceLimit(
    userId: string,
    subscriptionTier: string = 'free',
  ): Promise<boolean> {
    const count = await this.countUserDevices(userId);
    const limit = this.getDeviceLimit(subscriptionTier);
    return count >= limit;
  }
}