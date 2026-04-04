/**
 *  Storage Manager
 * Handles localStorage for consent data
 */

export class StorageManager {
  private static readonly CONSENT_KEY = 'houselevi_consents';
  private static readonly TOKEN_KEY = 'auth_token';

  /**
   * Get all consents from localStorage
   */
  static getConsents(): any | null {
    try {
      const data = localStorage.getItem(this.CONSENT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get consents:', e);
      return null;
    }
  }

  /**
   * Set a single consent
   */
  static setConsent(type: string, accepted: boolean): void {
    try {
      const current = this.getConsents() || {};
      const updated = { ...current, [type]: accepted };
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to set consent:', e);
    }
  }

  /**
   * Get auth token
   */
  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('Failed to get token:', e);
      return null;
    }
  }

  /**
   * Set auth token
   */
  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to set token:', e);
    }
  }

  /**
   * Clear all data
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.CONSENT_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  }
}
