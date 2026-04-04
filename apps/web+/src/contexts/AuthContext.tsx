// frontend/admin/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  _id?: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  emailVerified?: boolean;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    console.log('🔐 Verifying authentication...');
    
    const token = apiClient.getToken();
    
    if (!token) {
      console.log('❌ No token found');
      setIsLoading(false);
      return;
    }

    console.log('✅ Token found, verifying with backend...');
    
    try {
      const response = await apiClient.verifyToken();
      
      console.log('📦 Verify response:', response);
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        console.log('✅ User authenticated:', userData);
      } else {
        console.log('❌ Token verification failed');
        apiClient.clearToken();
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth verification error:', error);
      apiClient.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Attempting login for:', email);
    
    try {
      const response = await apiClient.login(email, password);
      
      console.log('📦 Login response:', response);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        
        // Validate user has admin role
        if (userData.role !== 'admin' && userData.role !== 'superadmin') {
          console.error('❌ User is not an admin:', userData.role);
          toast({
            title: 'Access Denied',
            description: 'You do not have admin privileges',
            variant: 'destructive',
          });
          return false;
        }
        
        setUser(userData);
        console.log('✅ Login successful:', userData);
        
        toast({
          title: 'Welcome back',
          description: `Logged in as ${userData.firstName || userData.email}`,
        });
        
        return true;
      } else {
        // FIXED: Changed response.message to response.error
        console.error('❌ Login failed:', response.error);
        
        toast({
          title: 'Login failed',
          description: response.error || 'Invalid credentials',
          variant: 'destructive',
        });
        
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      toast({
        title: 'Login error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    apiClient.clearToken();
    setUser(null);
    
    toast({
      title: 'Logged out',
      description: 'See you next time',
    });
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};