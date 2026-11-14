import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  contact_number?: string;
  position?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // Add event listener for storage changes (handles logout in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
        setToken(null);
        window.location.href = '/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Prevent browser back button after logout
  useEffect(() => {
    const preventBack = () => {
      if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.history.pushState(null, '', window.location.href);
        window.location.replace('/login');
      }
    };

    window.addEventListener('popstate', preventBack);
    return () => window.removeEventListener('popstate', preventBack);
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/login', { email, password });
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);

      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Add timestamp for session management
      localStorage.setItem('login_time', new Date().toISOString());
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('login_time');
      
      // Clear session storage as well
      sessionStorage.clear();
      
      // Force clear browser cache for auth pages
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '/login');
        window.history.replaceState(null, '', '/login');
      }
      
      // Redirect to login
      window.location.replace('/login');
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
