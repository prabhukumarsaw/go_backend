"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/types/auth";
import { getMe, login as apiLogin, logout as apiLogout } from "@/lib/api/auth";
import { getAccessToken, clearTokens } from "@/lib/api/client";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getMe();
      if (response.success && response.data) {
        const rawData = response.data as any;
        const userObj: User = rawData.user || rawData;
        setUser(userObj);
      } else {
        setUser(null);
        clearTokens();
      }
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin({ email, password });
      if (response.success && response.data) {
        const rawData = response.data as any;
        const userObj: User = rawData.user || rawData;
        setUser(userObj);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isStaff: !!user?.is_staff,
    login,
    logout,
    refresh: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
