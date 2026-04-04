/**
 * Tests for device types
 */

import { describe, test, expect } from '@jest/globals';
import { Device, DeviceFingerprint } from './device';

describe('Device Types', () => {
  test('Device type should have all required fields', () => {
    const device: Device = {
      id: 'device_123',
      userId: 'user_123',
      type: 'phone',
      manufacturer: 'Apple',
      model: 'iPhone 14',
      osName: 'iOS',
      osVersion: '16.0',
      appVersion: '1.0.0',
      fingerprint: 'fingerprint_abc',
      fingerprintMatch: true,
      trusted: true,
      trustScore: 90,
      firstSeen: new Date(),
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    expect(device.type).toBe('phone');
    expect(device.trusted).toBe(true);
  });

  test('DeviceFingerprint type should work', () => {
    const fingerprint: DeviceFingerprint = {
      deviceId: 'device_123',
      osName: 'iOS',
      osVersion: '16.0',
      appVersion: '1.0.0',
      hardwareId: 'hw_123',
      screenResolution: '1170x2532',
      timezone: 'UTC',
      locale: 'en-US',
    };

    expect(fingerprint.osName).toBe('iOS');
  });
});
