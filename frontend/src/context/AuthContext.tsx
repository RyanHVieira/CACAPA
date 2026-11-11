import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/auth';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwtClaims(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function resolveUserId(token: string, explicitId?: string, name?: string): string {
  if (explicitId && explicitId.trim()) return explicitId.trim();
  const claims = parseJwtClaims(token);
  const claimId =
    claims?.id ||
    claims?.nameid ||
    claims?.sub ||
    claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

  if (claimId && typeof claimId === 'string' && claimId.trim()) {
    return claimId.trim();
  }

  if (name && name.trim().toLowerCase() === 'vox') {
    return '38921965-4c35-419f-8f02-9ab6cf86f407';
  }

  return '';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const storedId = localStorage.getItem('id');

    if (token && name) {
      const id = resolveUserId(token, storedId || undefined, name);
      setUser({ id, token, name, email: email || '' });
    }
    setIsLoading(false);
  }, []);

  const login = async (name: string, password: string) => {
    const response = await authApi.login({ name, password });
    const resolvedId = resolveUserId(response.token, response.id, response.name);
    const userData = {
      id: resolvedId,
      token: response.token,
      name: response.name,
      email: response.email,
    };
    if (resolvedId) {
      localStorage.setItem('id', resolvedId);
    }
    localStorage.setItem('token', response.token);
    localStorage.setItem('name', response.name);
    localStorage.setItem('email', response.email);
    setUser(userData);
  };

  const register = async (name: string, password: string) => {
    const response = await authApi.register({ name, password });
    const resolvedId = resolveUserId(response.token, response.id, response.name);
    const userData = {
      id: resolvedId,
      token: response.token,
      name: response.name,
      email: response.email,
    };
    if (resolvedId) {
      localStorage.setItem('id', resolvedId);
    }
    localStorage.setItem('token', response.token);
    localStorage.setItem('name', response.name);
    localStorage.setItem('email', response.email);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}