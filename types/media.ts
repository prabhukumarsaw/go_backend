// ─── Media Types ────────────────────────────────
// Mirrors Go backend media models

export interface MediaItem {
  id: string;
  uploader_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  url?: string;
  alt_text?: string;
  caption?: string;
  category?: string;
  folder?: string;
  width?: number;
  height?: number;
  variants?: Record<string, string>;
  created_at: string;
}

export interface MediaFilter {
  category?: string;
  mime_type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface MediaUpdateInput {
  alt_text?: string;
  caption?: string;
  category?: string;
  folder?: string;
}
