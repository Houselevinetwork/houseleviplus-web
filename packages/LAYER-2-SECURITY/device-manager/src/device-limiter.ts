/**
 * @houselevi/security/device-manager/device-limiter
 * Enforce device limits (3 devices per account)
 */

export interface DeviceRecord {
  id: string;
  userId: string;
  type: 'phone' | 'laptop' | 'tv' | 'other';
  name: string;
  registeredAt: Date;
  lastUsedAt: Date;
}

export class DeviceLimiter {
  private maxDevices = 3;
  private devices: Map<string, DeviceRecord> = new Map();

  /**
   * Register a device
   */
  registerDevice(userId: string, type: string, name: string): DeviceRecord | null {
    const userDevices = Array.from(this.devices.values()).filter((d) => d.userId === userId);

    if (userDevices.length >= this.maxDevices) {
      return null; // Max devices reached
    }

    const device: DeviceRecord = {
      id: `device_${Date.now()}_${Math.random()}`,
      userId,
      type: (type as any) || 'other',
      name,
      registeredAt: new Date(),
      lastUsedAt: new Date(),
    };

    this.devices.set(device.id, device);
    return device;
  }

  /**
   * Get user's devices
   */
  getUserDevices(userId: string): DeviceRecord[] {
    return Array.from(this.devices.values()).filter((d) => d.userId === userId);
  }

  /**
   * Remove a device
   */
  removeDevice(deviceId: string): boolean {
    return this.devices.delete(deviceId);
  }

  /**
   * Check if user can add more devices
   */
  canAddDevice(userId: string): boolean {
    const userDevices = this.getUserDevices(userId);
    return userDevices.length < this.maxDevices;
  }

  /**
   * Get device count for user
   */
  getDeviceCount(userId: string): number {
    return this.getUserDevices(userId).length;
  }
}
