import type { ApiResponse, PaginatedResponse, ApiError } from "@/types/api";

// ─── Token Management ───────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    try {
      localStorage.setItem("access_token", token);
      if (typeof document !== "undefined") {
        document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      }
    } catch {
      // SSR or storage unavailable
    }
  } else {
    try {
      localStorage.removeItem("access_token");
      if (typeof document !== "undefined") {
        document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    } catch {
      // SSR or storage unavailable
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  try {
    accessToken = localStorage.getItem("access_token");
  } catch {
    // SSR
  }
  return accessToken;
}

export function clearTokens() {
  accessToken = null;
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    if (typeof document !== "undefined") {
      document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } catch {
    // SSR
  }
}

// ─── API Client ─────────────────────────────────

/**
 * Base API URL — uses Next.js rewrite proxy in development to avoid CORS.
 * Requests to /api/v1/* are proxied to the Go backend via next.config.ts.
 */
function getBaseUrl(): string {
  // In the browser, use relative URL (proxied through Next.js)
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  // On the server, call the backend directly
  const apiUrl = process.env.API_URL || "http://localhost:8080";
  return `${apiUrl}/api/v1`;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public body: ApiError,
  ) {
    super(body.message || `API error: ${status}`);
    this.name = "ApiClientError";
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  // Build URL with query parameters
  let url = `${getBaseUrl()}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    if (!response.ok) {
      throw new ApiClientError(response.status, {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      });
    }
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    // Handle 401 — clear tokens and redirect
    if (response.status === 401) {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    throw new ApiClientError(response.status, data as ApiError);
  }

  return data as T;
}

// ─── Convenience Methods ────────────────────────

export const apiClient = {
  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ): Promise<T> {
    return request<T>(endpoint, { method: "GET", params });
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: "POST", body });
  },

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: "PUT", body });
  },

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: "PATCH", body });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "DELETE" });
  },

  /**
   * Upload a file via multipart/form-data.
   * Does NOT set Content-Type — the browser sets the boundary automatically.
   */
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${getBaseUrl()}${endpoint}`;
    const headers: Record<string, string> = {};
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiClientError(response.status, data as ApiError);
    }
    return data as T;
  },
};

// Re-export types for convenience
export type { ApiResponse, PaginatedResponse, ApiError };
