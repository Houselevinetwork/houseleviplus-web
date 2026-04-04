// src/user-and-monetization/auth/helpers/device-fingerprint.helper.ts
import * as crypto from 'crypto';

/**
 * 🔍 DEVICE FINGERPRINTING - Netflix-Style
 * 
 * Creates a STABLE device identifier based on:
 * - User-Agent (browser + OS + version)
 * - Accept headers (browser capabilities)
 * - Screen resolution (optional, passed from frontend)
 * 
 * ✅ SAME BROWSER = SAME FINGERPRINT (even after logout)
 * ✅ DIFFERENT BROWSERS = DIFFERENT FINGERPRINTS
 * ✅ DETECTS: Chrome vs Firefox, Windows vs Mac, Desktop vs Mobile
 */

export interface DeviceInfo {
  deviceId: string;           // Stable hash for device tracking
  deviceType: 'phone' | 'laptop' | 'tv' | 'tablet' | 'unknown';
  deviceName: string;         // e.g., "Chrome on Windows"
  os?: string;                // e.g., "Windows 11"
  browser?: string;           // e.g., "Chrome 120"
  appVersion?: string;
}

export class DeviceFingerprintHelper {
  
  /**
   * Generate stable device fingerprint from request headers
   * This is the MAIN method - call this from auth.controller.ts
   */
  static fromRequest(req: any): DeviceInfo {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const acceptLanguage = req.headers['accept-language'] || 'en-US';
    const acceptEncoding = req.headers['accept-encoding'] || 'gzip';
    
    return this.generateFingerprint(userAgent, acceptLanguage, acceptEncoding);
  }
  
  /**
   * Generate stable device fingerprint
   */
  static generateFingerprint(
    userAgent: string,
    acceptLanguage?: string,
    acceptEncoding?: string,
  ): DeviceInfo {
    
    // 1️⃣ Create stable hash from browser characteristics
    // This ensures SAME browser = SAME deviceId every time
    const fingerprintData = [
      userAgent || 'unknown',
      acceptLanguage || 'en-US',
      acceptEncoding || 'gzip',
    ].join('|');
    
    const deviceId = crypto
      .createHash('sha256')
      .update(fingerprintData)
      .digest('hex')
      .substring(0, 32); // First 32 chars = stable ID
    
    // 2️⃣ Parse device type, OS, browser from User-Agent
    const deviceInfo = this.parseUserAgent(userAgent || '');
    
    return {
      deviceId,
      ...deviceInfo,
    };
  }
  
  /**
   * Parse User-Agent to detect device type, OS, browser
   * Handles all major browsers and platforms
   */
  private static parseUserAgent(userAgent: string): Omit<DeviceInfo, 'deviceId'> {
    const ua = userAgent.toLowerCase();
    
    // ========================================
    // 📱 DETECT DEVICE TYPE
    // ========================================
    let deviceType: 'phone' | 'laptop' | 'tv' | 'tablet' | 'unknown' = 'unknown';
    
    if (ua.includes('mobile') || ua.includes('android') && !ua.includes('tablet')) {
      deviceType = 'phone';
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
      deviceType = 'tablet';
    } else if (ua.includes('iphone')) {
      deviceType = 'phone';
    } else if (ua.includes('smart-tv') || ua.includes('smarttv') || ua.includes('tv')) {
      deviceType = 'tv';
    } else if (ua.includes('windows') || ua.includes('mac') || ua.includes('linux') || ua.includes('x11')) {
      deviceType = 'laptop';
    }
    
    // ========================================
    // 💻 DETECT OPERATING SYSTEM
    // ========================================
    let os = 'Unknown';
    let osVersion = '';
    
    if (ua.includes('windows nt 10.0')) {
      os = 'Windows';
      osVersion = '10/11';
    } else if (ua.includes('windows nt 6.3')) {
      os = 'Windows';
      osVersion = '8.1';
    } else if (ua.includes('windows nt 6.2')) {
      os = 'Windows';
      osVersion = '8';
    } else if (ua.includes('windows nt 6.1')) {
      os = 'Windows';
      osVersion = '7';
    } else if (ua.includes('windows')) {
      os = 'Windows';
    } else if (ua.includes('mac os x')) {
      os = 'macOS';
      const match = ua.match(/mac os x (\d+)[._](\d+)/);
      if (match) {
        osVersion = `${match[1]}.${match[2]}`;
      }
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
      const match = ua.match(/android (\d+\.?\d*)/);
      if (match) {
        osVersion = match[1];
      }
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
      const match = ua.match(/os (\d+)[._](\d+)/);
      if (match) {
        osVersion = `${match[1]}.${match[2]}`;
      }
    } else if (ua.includes('cros')) {
      os = 'Chrome OS';
    }
    
    // ========================================
    // 🌐 DETECT BROWSER
    // ========================================
    let browser = 'Unknown';
    let browserVersion = '';
    
    // Check in specific order (most specific first)
    if (ua.includes('edg/')) {
      // Microsoft Edge (Chromium)
      browser = 'Edge';
      const match = ua.match(/edg\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('opr/') || ua.includes('opera')) {
      // Opera
      browser = 'Opera';
      const match = ua.match(/opr\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('chrome/') && !ua.includes('edg')) {
      // Chrome (must check after Edge since Edge also includes "chrome")
      browser = 'Chrome';
      const match = ua.match(/chrome\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('firefox/')) {
      // Firefox
      browser = 'Firefox';
      const match = ua.match(/firefox\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('safari/') && !ua.includes('chrome')) {
      // Safari (must check after Chrome since Chrome also includes "safari")
      browser = 'Safari';
      const match = ua.match(/version\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('msie') || ua.includes('trident/')) {
      // Internet Explorer
      browser = 'Internet Explorer';
    }
    
    // ========================================
    // 📝 GENERATE READABLE DEVICE NAME
    // ========================================
    const browserName = browserVersion ? `${browser} ${browserVersion}` : browser;
    const osName = osVersion ? `${os} ${osVersion}` : os;
    const deviceName = `${browserName} on ${osName}`;
    
    return {
      deviceType,
      deviceName,
      os: osName,
      browser: browserName,
      appVersion: undefined,
    };
  }
}