/**
 * @houselevi/types/session
 * Authentication session and tokens
 * 
 * DPA 2019: Sessions include device binding for security
 */

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  ipAddress: string;
  userAgent: string;
  deviceType: 'phone' | 'laptop' | 'tv';
  trustScore: number;
  isVerified: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  revokedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
