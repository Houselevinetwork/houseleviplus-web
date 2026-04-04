/**
 * useSignup Hook - Create new account
 * Location: packages/LAYER-3-SERVICES/auth/src/hooks/useSignup.ts
 */

import { useState, useCallback } from 'react';
import { SignupRequest, SignupResponse } from '../types/auth.types';

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(async (data: SignupRequest): Promise<SignupResponse> => {
    try {
      setLoading(true);
      setError(null);

      if (!data.email || !data.email.includes('@')) {
        throw new Error('Invalid email address');
      }

      // TODO: Replace with actual API call
      // const response = await authClient.signup(data);
      
      const response: SignupResponse = {
        success: true,
        message: 'Account created successfully',
        user: {
          id: 'user_new_123',
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          emailVerified: false,
          isPremium: false,
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh_token_xyz',
        requiresEmailVerification: true,
      };

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { signup, loading, error };
}
