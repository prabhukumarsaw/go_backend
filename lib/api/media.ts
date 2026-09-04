import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { MediaItem, MediaFilter, MediaUpdateInput } from "@/types/media";

export function listMedia(filter?: MediaFilter) {
  return apiClient.get<PaginatedResponse<MediaItem>>("/studio/media", {
    category: filter?.category,
    mime_type: filter?.mime_type,
    search: filter?.search,
    page: filter?.page,
    per_page: filter?.per_page,
  });
}

export function uploadMedia(
  file: File,
  category = "news",
  folder = "general",
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  formData.append("folder", folder);
  return apiClient.upload<ApiResponse<MediaItem>>(
    "/studio/media/upload",
    formData,
  );
}

export function updateMediaMetadata(id: string, input: MediaUpdateInput) {
  return apiClient.patch<ApiResponse<{ message: string }>>(
    `/studio/media/${id}`,
    input,
  );
}

export function deleteMedia(id: string) {
  return apiClient.delete<ApiResponse<{ message: string }>>(
    `/studio/media/${id}`,
  );
}
