import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthResponse, AuthState } from '../types/auth';
import { authApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (nick: string, password: string) => Promise<void>;
  register: (nick: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setAuthData = useCallback((data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setState({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const user = JSON.parse(userStr) as User;
      // Verify token is still valid by calling /me
      await authApi.getMe();
      setState({
        user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      // Token invalid, clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const login = useCallback(async (nick: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await authApi.login({ nick, password });
      setAuthData(data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const errorMessage = axiosError.response?.data?.error || 'Login failed. Please check your credentials.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [setAuthData]);

  const register = useCallback(async (nick: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await authApi.register({ nick, password });
      setAuthData(data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string; details?: string } } };
      const errorMessage = axiosError.response?.data?.error || 'Registration failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [setAuthData]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}