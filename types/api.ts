// ─── API Response Types ─────────────────────────
// Matches the Go backend's response format (pkg/response)

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ─── Query Params ────────────────────────────────

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface SortParams {
  sort?: string;
  order?: "asc" | "desc";
}

export type ListParams = PaginationParams & SortParams;
