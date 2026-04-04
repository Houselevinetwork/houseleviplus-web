/**
 * Tests for user types
 */

import { User, UserProfile, UserSettings } from './user';

describe('User Types', () => {
  test('User type should have all required fields', () => {
    const user: User = {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      status: 'active',
      emailVerified: true,
      preferredLanguage: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(user.id).toBe('123');
    expect(user.email).toBe('test@example.com');
  });

  test('UserProfile type should work correctly', () => {
    const profile: UserProfile = {
      id: '123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      followerCount: 10,
      followingCount: 5,
      totalReviews: 3,
      avgRating: 4.5,
    };

    expect(profile.followerCount).toBe(10);
  });

  test('UserSettings type should work correctly', () => {
    const settings: UserSettings = {
      userId: '123',
      privacyLevel: 'public',
      allowsMessaging: true,
      twoFactorEnabled: false,
      dataCollectionOptIn: true,
      updatedAt: new Date(),
    };

    expect(settings.privacyLevel).toBe('public');
  });
});

