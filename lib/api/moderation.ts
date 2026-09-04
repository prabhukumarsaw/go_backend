import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

export interface CommentItem {
  id: number;
  article_id: string;
  article_title?: string;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  body: string;
  status: "pending" | "approved" | "rejected" | "spam";
  created_at: string;
}

export function listPendingComments(page = 1, perPage = 20) {
  return apiClient.get<ApiResponse<CommentItem[]>>("/moderation/comments/pending", {
    page,
    per_page: perPage,
  });
}

export function moderateComment(id: number, action: "approve" | "reject" | "spam") {
  return apiClient.post<ApiResponse<{ message: string }>>(`/moderation/comments/${id}/action`, {
    action,
  });
}
