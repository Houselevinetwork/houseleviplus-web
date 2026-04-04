/**
 * @houselevi/types/device
 * Device management and binding
 */

export interface Device {
  id: string;
  userId: string;
  type: 'phone' | 'laptop' | 'tv';
  manufacturer?: string;
  model?: string;
  osName: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'WebOS' | 'Tizen';
  osVersion: string;
  appVersion: string;
  fingerprint: string;
  fingerprintMatch: boolean;
  trusted: boolean;
  trustScore: number;
  firstSeen: Date;
  lastSeen: Date;
  createdAt: Date;
}

export interface DeviceFingerprint {
  deviceId: string;
  osName: string;
  osVersion: string;
  appVersion: string;
  hardwareId: string;
  screenResolution: string;
  timezone: string;
  locale: string;
}
