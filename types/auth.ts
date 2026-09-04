// ─── Auth Types ─────────────────────────────────
// Mirrors Go backend auth models

export interface User {
  id: number;
  email?: string;
  phone?: string;
  display_name: string;
  avatar_url?: string;
  provider: string;
  is_staff: boolean;
  is_super_admin: boolean;
  totp_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email?: string;
  phone?: string;
  password: string;
  display_name: string;
  provider?: string;
}

export interface LoginResponse {
  tokens: TokenPair;
  user: User;
}

export interface AuthSession {
  user: User | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  isLoading: boolean;
}
