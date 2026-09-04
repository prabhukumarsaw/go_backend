import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

export interface LiveBlogEntry {
  id: number;
  article_id: string;
  headline?: string;
  body: any;
  author_id: number;
  author_name?: string;
  is_pinned: boolean;
  is_breaking: boolean;
  created_at: string;
}

export function listLiveBlogEntries(articleId: string) {
  return apiClient.get<ApiResponse<LiveBlogEntry[]>>(`/live-blogs/${articleId}/entries`);
}

export function addLiveBlogEntry(
  articleId: string,
  payload: { headline?: string; body: string; is_pinned?: boolean; is_breaking?: boolean }
) {
  return apiClient.post<ApiResponse<LiveBlogEntry>>(`/studio/live-blogs/${articleId}/entries`, payload);
}

export function deleteLiveBlogEntry(id: number) {
  return apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/studio/live-blogs/entries/${id}`);
}

export function togglePinLiveBlogEntry(id: number, isPinned: boolean) {
  return apiClient.patch<ApiResponse<{ updated: boolean }>>(`/studio/live-blogs/entries/${id}/pin`, {
    is_pinned: isPinned,
  });
}
