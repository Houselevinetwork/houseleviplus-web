import { http } from '../utils/http-client';

export const authService = {
  /** Check if email has an account. Returns exists + firstName if yes. */
  checkEmail: (email: string) =>
    http.post<{ exists: boolean; firstName?: string }>('/auth/check-email', { email }),

  /** Send OTP to existing user */
  sendOTP: (email: string) =>
    http.post<{ message: string }>('/auth/otp/send', { email }),

  /** Verify OTP — returns token + user on success */
  verifyOTP: (email: string, otp: string) =>
    http.post<{ token: string; refreshToken: string; user: { id: string; email: string; firstName?: string } }>('/auth/otp/verify', { email, otp }),

  /** Resend OTP (has server-side cooldown) */
  resendOTP: (email: string) =>
    http.post<{ message: string }>('/auth/otp/resend', { email }),

  /** Send magic signup link to new user */
  sendVerificationLink: (email: string) =>
    http.post<{ message: string }>('/auth/register/send-link', { email }),

  /** Get full profile of authenticated user (requires token) */
  getProfile: () =>
    http.get<{
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      subscriptionStatus: 'guest' | 'free' | 'premium';
      subscriptionExpiresAt?: string;
      role: 'admin' | 'user' | 'moderator';
    }>('/auth/me'),

  /** Invalidate token server-side */
  signOut: () =>
    http.post<void>('/auth/sign-out'),

  /** Refresh access token */
  refreshToken: (refreshToken: string) =>
    http.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
};