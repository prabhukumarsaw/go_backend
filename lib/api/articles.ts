import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Article,
  ArticleListItem,
  ArticleVersion,
  Category,
  CreateArticleInput,
  HomeFeedData,
  ListArticlesFilter,
} from "@/types/content";

// ─── Public Article Endpoints ───────────────────

export function listArticles(filter?: ListArticlesFilter) {
  return apiClient.get<PaginatedResponse<ArticleListItem>>("/articles", {
    status: filter?.status,
    category: filter?.category,
    language: filter?.language,
    author_id: filter?.author_id,
    sort: filter?.sort,
    page: filter?.page,
    per_page: filter?.per_page,
    from: filter?.from,
    to: filter?.to,
    is_breaking: filter?.is_breaking,
    is_featured: filter?.is_featured,
  });
}

export function getArticleBySlug(slug: string, language?: string) {
  const params: Record<string, string> = {};
  if (language) params.language = language;
  return apiClient.get<ApiResponse<Article>>(`/articles/${slug}`, params);
}

export function listBreakingNews(limit = 10) {
  return apiClient.get<ApiResponse<ArticleListItem[]>>("/articles/breaking", {
    limit,
  });
}

export function listFeaturedNews(limit = 6) {
  return apiClient.get<ApiResponse<ArticleListItem[]>>("/articles/featured", {
    limit,
  });
}

export function listTrendingNews(limit = 10) {
  return apiClient.get<ApiResponse<ArticleListItem[]>>("/articles/trending", {
    limit,
  });
}

export function getHomeFeed(language = "en", district?: string) {
  return apiClient.get<ApiResponse<HomeFeedData>>("/home", {
    language,
    district,
  });
}

export function searchArticles(q: string, page = 1, limit = 20) {
  return apiClient.get<ApiResponse<ArticleListItem[]>>("/search", {
    q,
    page,
    limit,
  });
}

// ─── Categories ─────────────────────────────────

export function listCategories() {
  return apiClient.get<ApiResponse<Category[]>>("/categories");
}

export function listCategoriesTree() {
  return apiClient.get<ApiResponse<Category[]>>("/categories/tree");
}

// ─── Studio Article Endpoints ───────────────────

export function studioListArticles(filter?: ListArticlesFilter) {
  return apiClient.get<PaginatedResponse<ArticleListItem>>(
    "/studio/articles",
    {
      status: filter?.status && (filter.status as string) !== "all" ? filter.status : undefined,
      category: filter?.category && filter.category !== "all" ? filter.category : undefined,
      language: filter?.language,
      page: filter?.page,
      per_page: filter?.per_page,
    },
  );
}

export function getArticle(id: string) {
  return apiClient.get<ApiResponse<Article>>(`/studio/articles/${id}`);
}

export function createArticle(input: CreateArticleInput) {
  return apiClient.post<ApiResponse<Article>>("/studio/articles", input);
}

export function updateArticle(id: string, input: Partial<CreateArticleInput>) {
  return apiClient.put<ApiResponse<Article>>(`/studio/articles/${id}`, input);
}

export function transitionArticleStatus(id: string, status: string) {
  return apiClient.post<ApiResponse<{ message: string; status: string }>>(
    `/studio/articles/${id}/transition`,
    { status },
  );
}

export function scheduleArticle(id: string, scheduledAt: string) {
  return apiClient.post<ApiResponse<{ message: string; status: string; scheduled_at: string }>>(
    `/studio/articles/${id}/schedule`,
    { scheduled_at: scheduledAt },
  );
}

export function getArticleVersions(id: string) {
  return apiClient.get<ApiResponse<ArticleVersion[]>>(
    `/studio/articles/${id}/versions`,
  );
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parent_id?: number | null;
  sort_order?: number;
  icon?: string;
}

export function createCategory(data: CreateCategoryPayload) {
  return apiClient.post<ApiResponse<Category>>("/studio/categories", data);
}

export function updateCategory(id: number, data: CreateCategoryPayload) {
  return apiClient.put<ApiResponse<Category>>(`/studio/categories/${id}`, data);
}

export function deleteCategory(id: number) {
  return apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/studio/categories/${id}`);
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count?: number;
}

export function listTags() {
  return apiClient.get<ApiResponse<Tag[]>>("/tags");
}

/** Fetch top N tags sorted by usage_count (most used = trending topics) */
export function listTrendingTags(limit = 8) {
  return apiClient.get<ApiResponse<Tag[]>>("/tags", { sort: "usage_count", limit });
}

export function createTag(data: { name: string; slug?: string }) {
  return apiClient.post<ApiResponse<Tag>>("/studio/tags", data);
}

export function deleteTag(id: number) {
  return apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/studio/tags/${id}`);
}
