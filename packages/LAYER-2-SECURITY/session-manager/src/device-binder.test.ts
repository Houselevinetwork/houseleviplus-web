import { describe, test, expect } from '@jest/globals';
import { DeviceBinder } from './device-binder';

describe('Device Binder', () => {
  test('should bind device', () => {
    const binder = new DeviceBinder();
    const binding = binder.bindDevice('session_123', 'device_123', 'fingerprint_abc');

    expect(binding.deviceId).toBe('device_123');
    expect(binding.trustScore).toBe(50);
  });

  test('should verify device', () => {
    const binder = new DeviceBinder();
    binder.bindDevice('session_123', 'device_123', 'fingerprint_abc');

    const verified = binder.verifyDevice('session_123', 'device_123', 'fingerprint_abc');
    expect(verified).toBe(true);
  });

  test('should reject wrong device', () => {
    const binder = new DeviceBinder();
    binder.bindDevice('session_123', 'device_123', 'fingerprint_abc');

    const verified = binder.verifyDevice('session_123', 'device_999', 'fingerprint_abc');
    expect(verified).toBe(false);
  });
});
