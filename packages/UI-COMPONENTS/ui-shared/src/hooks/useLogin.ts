// Headless login hook - works on ALL platforms
import { useState } from 'react'; // or equivalent state management
import { authService } from '@houselevi/api-sdk';
import type { LoginCredentials } from '@houselevi/types';

export interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // DPA Section 32: Explicit consent required
      const result = await authService.login(credentials);
      
      // Netflix pattern: Device binding
      // Session created server-side
      
      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { login, isLoading, error, clearError };
}
