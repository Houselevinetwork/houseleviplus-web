/**
 * useSession Hook - Manage user session (login/logout/refresh)
 * Location: packages/LAYER-3-SERVICES/auth/src/hooks/useSession.ts
 */

import { useState, useCallback, useEffect } from 'react';
import { UserData, RefreshTokenResponse } from '../types/auth.types';

export function useSession() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_data');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (err) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const saveSession = useCallback((token: string, refreshToken: string, userData: UserData) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const clearSession = useCallback(async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshSession = useCallback(async (): Promise<RefreshTokenResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    // TODO: Replace with actual API call
    // const response = await authClient.refreshToken(refreshToken);
    
    const response: RefreshTokenResponse = {
      success: true,
      token: 'new_access_token',
      refreshToken: 'new_refresh_token',
      expiresIn: 7200,
    };

    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    return response;
  }, []);

  return { user, isAuthenticated, loading, saveSession, clearSession, refreshSession };
}
