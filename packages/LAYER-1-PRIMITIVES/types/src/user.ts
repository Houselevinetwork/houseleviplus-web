/**
 * @houselevi/types/user
 * User account and profile types
 * 
 * DPA 2019: User data includes audit timestamps
 */

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'deleted' | 'unverified';
  emailVerified: boolean;
  currentSubscriptionTier?: 'free' | 'basic' | 'premium' | 'vip';
  preferredLanguage: 'en' | 'sw' | 'fr';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  lastLogin?: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  totalReviews: number;
  avgRating: number;
}

export interface UserSettings {
  userId: string;
  privacyLevel: 'public' | 'friends' | 'private';
  allowsMessaging: boolean;
  twoFactorEnabled: boolean;
  dataCollectionOptIn: boolean;
  updatedAt: Date;
}
