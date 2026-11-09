export interface User {
  id: string;
  nick: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  nick: string;
  password: string;
}

export interface LoginRequest {
  nick: string;
  password: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}