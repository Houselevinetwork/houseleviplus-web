/**
 * Tests for session types
 */

import { Session, LoginRequest, LoginResponse } from './session';

describe('Session Types', () => {
  test('Session type should have all required fields', () => {
    const session: Session = {
      id: 'sess_123',
      userId: 'user_123',
      deviceId: 'device_123',
      accessToken: 'token_abc',
      refreshToken: 'refresh_xyz',
      accessTokenExpiresAt: new Date(),
      refreshTokenExpiresAt: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      deviceType: 'phone',
      trustScore: 85,
      isVerified: true,
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };

    expect(session.id).toBe('sess_123');
    expect(session.trustScore).toBe(85);
  });

  test('LoginRequest type should work', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    expect(request.email).toBe('test@example.com');
  });

  test('LoginResponse type should work', () => {
    const response: LoginResponse = {
      accessToken: 'token_abc',
      refreshToken: 'refresh_xyz',
      expiresIn: 300,
    };

    expect(response.expiresIn).toBe(300);
  });
});
