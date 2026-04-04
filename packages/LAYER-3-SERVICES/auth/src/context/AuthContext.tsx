'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// --- How long before expiry we proactively refresh (5 minutes) ---------------
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

// --- Fallback: refresh every 6 days if we can't calculate from token ---------
const DEFAULT_REFRESH_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000;

// -----------------------------------------------------------------------------
// ?? TYPES
// -----------------------------------------------------------------------------

interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  emailVerified: boolean;
  isPremium: boolean;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | null;
  isActive: boolean;
  role?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearAuth: () => void;
}

// -----------------------------------------------------------------------------
// ?? CONTEXT CREATION
// -----------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// ?? AUTH PROVIDER
// -----------------------------------------------------------------------------

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initializingRef = useRef(false);

  // --- Storage helpers --------------------------------------------------------

  const getAccessToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      sessionStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
    }
  }, []);

  const getRefreshToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }, []);

  const setRefreshToken = useCallback((token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }, []);

  // --- Decode JWT to read the real expiry -------------------------------------
  // No library needed — JWT payload is just base64.

  const getTokenExpiryMs = useCallback((token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return null;
      // exp is in seconds ? convert to ms
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }, []);

  // --- Schedule proactive refresh based on actual token expiry ----------------
  //
  // With JWT_EXPIRES_IN=7d the interval becomes ~6 days 23 hrs 55 min.
  // The old hardcoded 10-minute interval caused /auth/refresh to be called
  // ~1008 times per week instead of once.

  const scheduleTokenRefresh = useCallback(
    (refreshFn: () => Promise<boolean>) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      const token = getAccessToken();
      let delayMs = DEFAULT_REFRESH_INTERVAL_MS;

      if (token) {
        const expiryMs = getTokenExpiryMs(token);
        if (expiryMs) {
          const msUntilExpiry = expiryMs - Date.now();
          // Refresh 5 minutes before expiry, but never sooner than 1 minute
          delayMs = Math.max(msUntilExpiry - REFRESH_BUFFER_MS, 60_000);
        }
      }

      const days = Math.round(delayMs / 86_400_000);
      const hours = Math.round((delayMs % 86_400_000) / 3_600_000);
      console.log(
        `? Next token refresh scheduled in ~${days}d ${hours}h`,
      );

      refreshTimerRef.current = setTimeout(async () => {
        console.log('?? Proactive token refresh triggered');
        const ok = await refreshFn();
        if (ok) {
          // Re-schedule after successful refresh
          scheduleTokenRefresh(refreshFn);
        }
      }, delayMs);
    },
    [getAccessToken, getTokenExpiryMs],
  );

  // --- 1. Refresh access token via refresh token ------------------------------

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = getRefreshToken();

    if (!storedRefreshToken) {
      console.warn('?? No refresh token — user must log in again');
      return false;
    }

    try {
      console.log('?? Exchanging refresh token for new access token...');

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (response.status === 401) {
        console.warn('?? Refresh token expired — user must log in again');
        return false;
      }

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken;

        setAccessToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);

        console.log('? Access token refreshed successfully');
        return true;
      }

      console.error('? Token refresh failed:', response.status);
      return false;
    } catch (error) {
      console.error('? Token refresh network error:', error);
      return false;
    }
  }, [getRefreshToken, setAccessToken, setRefreshToken]);

  // --- 2. Load user profile from /auth/me -------------------------------------

  const refreshUserData = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      console.log('?? No access token — skipping profile fetch');
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('?? Fetching user profile (/auth/me)');

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Token expired ? try to refresh silently
      if (response.status === 401) {
        console.warn('?? Access token rejected (401) — attempting refresh');
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          const newToken = getAccessToken();
          if (newToken) {
            const retry = await fetch(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${newToken}` },
            });

            if (retry.ok) {
              const data = await retry.json();
              const userData = data.user || data;
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
              console.log('? Profile loaded after token refresh:', userData.email);
              setIsLoading(false);
              return;
            }
          }
        }

        // Refresh failed — clear everything
        await clearAuthData();
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('? Profile loaded:', userData.email);
      } else {
        console.error('? Profile fetch failed:', response.status);
        setUser(null);
      }
    } catch (error) {
      console.error('? Profile fetch error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, refreshAccessToken]);

  // --- 3. Logout --------------------------------------------------------------

  const logout = useCallback(async (): Promise<void> => {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();

    try {
      console.log('?? Logging out...');
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        }).catch((e) => console.warn('?? Backend logout failed:', e));
      }
    } finally {
      await clearAuthData();
      if (typeof window !== 'undefined') window.location.href = '/';
    }
  }, [getAccessToken, getRefreshToken]);

  // --- 4. Update user locally -------------------------------------------------

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, []);

  // --- 5. Clear all auth data -------------------------------------------------

  const clearAuthData = useCallback(async (): Promise<void> => {
    console.log('??? Clearing auth data');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
    }
  }, [setAccessToken, setRefreshToken]);

  // clearAuth is exposed in the context so it is identical to clearAuthData
  const clearAuth = clearAuthData;

  // --- 6. Initialize on app load ----------------------------------------------

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    console.log('?? AuthProvider initializing');

    const init = async () => {
      try {
        const hasAccessToken = getAccessToken();
        const hasRefreshToken = getRefreshToken();

        console.log('  - Access token :', hasAccessToken ? '?' : '?');
        console.log('  - Refresh token:', hasRefreshToken ? '?' : '?');

        if (hasAccessToken) {
          // Happy path: valid token in storage ? load user and schedule refresh
          await refreshUserData();
          scheduleTokenRefresh(refreshAccessToken);
          return;
        }

        if (hasRefreshToken) {
          // Token missing from storage but refresh token present ? silent re-login
          console.log('?? No access token — attempting silent login via refresh token');
          const ok = await refreshAccessToken();
          if (ok) {
            await refreshUserData();
            scheduleTokenRefresh(refreshAccessToken);
          } else {
            await clearAuthData();
            setIsLoading(false);
          }
          return;
        }

        // No tokens at all
        console.log('?? No tokens found — guest session');
        setIsLoading(false);
      } catch (error) {
        console.error('? Auth init error:', error);
        await clearAuthData();
        setIsLoading(false);
      }
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Restart refresh timer whenever user changes ----------------------------

  useEffect(() => {
    if (user) {
      scheduleTokenRefresh(refreshAccessToken);
    }
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // ?? CONTEXT VALUE
  // ---------------------------------------------------------------------------

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    refreshUserData,
    logout,
    updateUser,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------------------------------------------------------
// ?? HOOK
// -----------------------------------------------------------------------------

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      '? useAuthContext must be used inside <AuthProvider>. ' +
        'Wrap your app in <AuthProvider> in layout.tsx.',
    );
  }
  return context;
}
