import { apiClient, setAccessToken, clearTokens } from "./client";
import type { ApiResponse } from "@/types/api";
import type { User, LoginInput, RegisterInput, LoginResponse } from "@/types/auth";

export async function login(input: LoginInput) {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    input,
  );
  if (response.success && response.data.tokens) {
    setAccessToken(response.data.tokens.access_token);
    try {
      localStorage.setItem(
        "refresh_token",
        response.data.tokens.refresh_token,
      );
    } catch {
      // SSR
    }
  }
  return response;
}

export async function register(input: RegisterInput) {
  return apiClient.post<ApiResponse<User>>("/auth/register", input);
}

export async function refreshToken() {
  let refreshTokenValue: string | null = null;
  try {
    refreshTokenValue = localStorage.getItem("refresh_token");
  } catch {
    // SSR
  }

  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  const response = await apiClient.post<
    ApiResponse<{ access_token: string; refresh_token: string; expires_in: number }>
  >("/auth/refresh", {
    refresh_token: refreshTokenValue,
  });

  if (response.success && response.data.access_token) {
    setAccessToken(response.data.access_token);
    try {
      localStorage.setItem("refresh_token", response.data.refresh_token);
    } catch {
      // SSR
    }
  }

  return response;
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearTokens();
  }
}

export function getMe() {
  return apiClient.get<ApiResponse<{ user: User; session?: any } | User>>(
    "/auth/me",
  );
}
