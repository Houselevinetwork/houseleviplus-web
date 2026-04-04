import { describe, test, expect } from '@jest/globals';
import { DeviceLimiter } from './device-limiter';

describe('Device Limiter', () => {
  test('should register device', () => {
    const limiter = new DeviceLimiter();
    const device = limiter.registerDevice('user_123', 'phone', 'iPhone');

    expect(device?.type).toBe('phone');
    expect(device?.name).toBe('iPhone');
  });

  test('should enforce 3 device limit', () => {
    const limiter = new DeviceLimiter();
    limiter.registerDevice('user_123', 'phone', 'iPhone');
    limiter.registerDevice('user_123', 'laptop', 'MacBook');
    limiter.registerDevice('user_123', 'tv', 'Samsung TV');

    const fourth = limiter.registerDevice('user_123', 'other', 'Tablet');
    expect(fourth).toBeNull();
  });

  test('should get user devices', () => {
    const limiter = new DeviceLimiter();
    limiter.registerDevice('user_123', 'phone', 'iPhone');
    limiter.registerDevice('user_123', 'laptop', 'MacBook');

    const devices = limiter.getUserDevices('user_123');
    expect(devices.length).toBe(2);
  });
});
