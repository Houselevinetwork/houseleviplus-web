/**
 * @houselevi/security/session-manager/device-binder
 * Bind sessions to specific devices
 */

export interface DeviceBinding {
  sessionId: string;
  deviceId: string;
  fingerprint: string;
  trustScore: number;
  boundAt: Date;
}

export class DeviceBinder {
  private bindings: Map<string, DeviceBinding> = new Map();

  /**
   * Bind a session to a device
   */
  bindDevice(sessionId: string, deviceId: string, fingerprint: string): DeviceBinding {
    const binding: DeviceBinding = {
      sessionId,
      deviceId,
      fingerprint,
      trustScore: 50, // Start at medium trust
      boundAt: new Date(),
    };

    this.bindings.set(sessionId, binding);
    return binding;
  }

  /**
   * Verify device matches binding
   */
  verifyDevice(sessionId: string, deviceId: string, fingerprint: string): boolean {
    const binding = this.bindings.get(sessionId);
    if (!binding) return false;

    const deviceMatch = binding.deviceId === deviceId;
    const fingerprintMatch = binding.fingerprint === fingerprint;

    return deviceMatch && fingerprintMatch;
  }

  /**
   * Update trust score
   */
  updateTrustScore(sessionId: string, score: number): boolean {
    const binding = this.bindings.get(sessionId);
    if (!binding) return false;

    binding.trustScore = Math.max(0, Math.min(100, score));
    return true;
  }

  /**
   * Get device binding
   */
  getBinding(sessionId: string): DeviceBinding | null {
    return this.bindings.get(sessionId) || null;
  }
}
