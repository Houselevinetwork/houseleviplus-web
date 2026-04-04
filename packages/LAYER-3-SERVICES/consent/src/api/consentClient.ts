/**
 *  CONSENT API CLIENT
 * Location: packages/LAYER-3-SERVICES/consent/src/api/consentClient.ts
 * 
 * HTTP communication with NestJS backend
 */

export type ConsentType = 'terms_of_service' | 'privacy_policy' | 'cookie_policy';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const CONSENT_ENDPOINT = `${API_BASE_URL}/consent`;

// ============================================
// ERROR HANDLING
// ============================================

class ConsentApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ConsentApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ConsentApiError(
      response.status,
      data.message || 'API request failed',
      data
    );
  }

  return data;
}

// ============================================
// API CLIENT CLASS
// ============================================

export class ConsentClient {
  /**
   * GET /consent/status
   * Check what consents the current user has given
   */
  async getConsentStatus(): Promise<any> {
    const token = this.getAuthToken();

    const response = await fetch(`${CONSENT_ENDPOINT}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return handleResponse(response);
  }

  /**
   * POST /consent/accept
   * Accept a single consent
   */
  async acceptConsent(type: ConsentType): Promise<void> {
    const token = this.getAuthToken();

    if (!token) {
      throw new ConsentApiError(401, 'Not authenticated. Please login first.');
    }

    const response = await fetch(`${CONSENT_ENDPOINT}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        consent_type: type,
        version: '1.0',
      }),
    });

    await handleResponse<{ success: boolean }>(response);
  }

  /**
   * POST /consent/accept-all
   * Accept ALL 3 consents at once
   */
  async acceptAllConsents(): Promise<void> {
    const token = this.getAuthToken();

    if (!token) {
      throw new ConsentApiError(401, 'Not authenticated. Please login first.');
    }

    const response = await fetch(`${CONSENT_ENDPOINT}/accept-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        consents: [
          'terms_of_service',
          'privacy_policy',
          'cookie_policy',
        ],
        version: '1.0',
      }),
    });

    await handleResponse<{ success: boolean }>(response);
  }

  /**
   * POST /consent/revoke
   * Revoke (withdraw) a consent
   */
  async revokeConsent(type: ConsentType, reason?: string): Promise<void> {
    const token = this.getAuthToken();

    if (!token) {
      throw new ConsentApiError(401, 'Not authenticated. Please login first.');
    }

    const response = await fetch(`${CONSENT_ENDPOINT}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        consent_type: type,
        reason,
      }),
    });

    await handleResponse<{ success: boolean }>(response);
  }

  /**
   * GET /consent/policy/:type
   * Get the current version of a policy
   */
  async getPolicyText(type: ConsentType): Promise<any> {
    const response = await fetch(`${CONSENT_ENDPOINT}/policy/${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  }

  /**
   * Helper: Get JWT token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem('auth_token');
    } catch (e) {
      console.error('Failed to read auth token:', e);
      return null;
    }
  }
}

/**
 * Export singleton instance
 */
export const consentClient = new ConsentClient();

export default consentClient;
