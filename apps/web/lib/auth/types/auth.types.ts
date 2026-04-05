// packages/LAYER-3-SERVICES/auth/src/types/auth.types.ts

export type AuthStep = 'email' | 'otp' | 'signup' | 'verify-sent';

export type SubscriptionStatus = 'guest' | 'free' | 'premium';

export type UserRole = 'admin' | 'user' | 'moderator';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: string;
  role: UserRole;
}

export interface EmailCheckResult {
  exists: boolean;
  firstName?: string;
}

export interface OTPRequestResponse { success: boolean; message?: string; }
export interface OTPVerifyResponse { success: boolean; token?: string; user?: any; }
export interface UserData { id: string; email: string; firstName?: string; lastName?: string; isPremium?: boolean; subscriptionStatus?: string; [key: string]: any; }
export interface RefreshTokenResponse { token: string; }
export interface SignupRequest { email: string; password: string; firstName?: string; lastName?: string; }
export interface SignupResponse { success: boolean; token?: string; user?: any; }