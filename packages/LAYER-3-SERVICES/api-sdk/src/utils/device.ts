//  Device Utilities 
// Used by auth and analytics to tag requests with device context.

export type DeviceType = 'web' | 'mobile-web' | 'android' | 'ios' | 'tv' | 'unknown';

export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/smart-tv|hbbtv|netcast|nettv/.test(ua)) return 'tv';
  if (/mobile|tablet/.test(ua)) return 'mobile-web';
  return 'web';
}

export function getDeviceInfo(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  return {
    deviceType: getDeviceType(),
    userAgent:  navigator.userAgent,
    language:   navigator.language,
    timezone:   Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
