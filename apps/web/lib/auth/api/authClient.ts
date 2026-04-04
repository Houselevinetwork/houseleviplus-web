const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;

class AuthApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new AuthApiError(response.status, data.message || 'API request failed', data);
  }
  return data;
}

export class AuthClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  async emailDiscovery(email: string): Promise<any> {
    const response = await fetch(`${AUTH_ENDPOINT}/email-discovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  }

  async requestOTP(email: string): Promise<any> {
    const response = await fetch(`${AUTH_ENDPOINT}/otp-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'login' }),
    });
    return handleResponse(response);
  }

  async verifyOTP(email: string, otp: string): Promise<any> {
    const response = await fetch(`${AUTH_ENDPOINT}/otp-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return handleResponse(response);
  }

  async loginWithPassword(email: string, password: string): Promise<any> {
    const response = await fetch(`${AUTH_ENDPOINT}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  }

  async signup(data: any): Promise<any> {
    const response = await fetch(`${AUTH_ENDPOINT}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  async logout(): Promise<any> {
    const token = this.getAuthToken();
    const response = await fetch(`${AUTH_ENDPOINT}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  }
}

export const authClient = new AuthClient();
export default authClient;
