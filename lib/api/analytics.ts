import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";

export interface RegionalReadership {
  region_id?: number;
  region_name?: string;
  tenant_id?: number;
  tenant_name?: string;
  views: number;
  articles: number;
}

export type TenantReadership = RegionalReadership;

export interface CategoryReadership {
  category_name: string;
  count: number;
}

export interface TrendingStat {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  language: string;
}

export interface AuthorLeaderboard {
  author_id: number;
  display_name: string;
  bureau_name?: string;
  tenant_name?: string;
  total_views: number;
  articles: number;
}

export interface AnalyticsOverview {
  total_articles: number;
  total_published: number;
  total_views: number;
  total_breaking: number;
  total_subscribers: number;
  state_distribution: RegionalReadership[];
  category_breakdown: CategoryReadership[];
  top_trending_articles: TrendingStat[];
}

export function getAnalyticsOverview() {
  return apiClient.get<ApiResponse<AnalyticsOverview>>("/admin/analytics/overview");
}

export function getAuthorLeaderboard() {
  return apiClient.get<ApiResponse<AuthorLeaderboard[]>>("/admin/analytics/authors");
}
