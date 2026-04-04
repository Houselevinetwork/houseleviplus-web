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
