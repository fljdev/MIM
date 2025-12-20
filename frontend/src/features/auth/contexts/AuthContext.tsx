import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../../../Config';

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  validateToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('[Auth] Validating token...');
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth] Token valid, user:', data.user.email);
        setUser(data.user);
      } else if (response.status === 401) {
        // Token expired or invalid, try to refresh
        console.log('[Auth] Token invalid (401), attempting refresh...');
        const refreshed = await refreshToken();
        if (!refreshed) {
          // Refresh failed, clear token
          console.log('[Auth] Token refresh failed, logging out');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        // Other error, clear token
        console.log('[Auth] Token validation failed, logging out');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Token validation error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[Auth Refresh] No token to refresh');
      return false;
    }

    try {
      console.log('[Auth Refresh] Attempting token refresh...');
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auth Refresh] Token refreshed successfully for user:', data.user.email);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return true;
      } else {
        console.log('[Auth Refresh] Refresh failed with status:', response.status);
        // Refresh failed, clear token
        localStorage.removeItem('token');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('[Auth Refresh] Error:', error);
      localStorage.removeItem('token');
      setUser(null);
      return false;
    }
  };

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    validateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
