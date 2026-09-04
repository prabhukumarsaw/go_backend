// ─── Article Types ──────────────────────────────
// Mirrors Go backend content models

export type ArticleStatus =
  | "draft"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "archived";

export interface Article {
  id: string;
  story_id?: string;
  tenant_id?: number;
  district_id?: number;
  district_name?: string;
  language: string;
  title: string;
  slug: string;
  body: unknown; // TipTap JSON
  excerpt?: string;
  status: ArticleStatus;
  author_id: number;
  editor_id?: number;
  reviewer_id?: number;
  is_breaking: boolean;
  is_featured: boolean;
  is_national: boolean;
  published_at?: string;
  scheduled_at?: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  featured_image: string;
  caption?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  categories?: string[];
  category_names?: string[];
  category_slugs?: string[];
  category_ids?: number[];
  tags?: string[];
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: ArticleStatus;
  language: string;
  author_id: number;
  author_name: string;
  is_breaking: boolean;
  is_featured: boolean;
  is_national: boolean;
  featured_image: string;
  caption?: string;
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  categories?: string[];
  category_names?: string[];
  category_slugs?: string[];
  category_ids?: number[];
  tags?: string[];
}

export interface Category {
  id: number;
  tenant_id?: number;
  parent_id?: number | null;
  level?: number;
  name: string;
  slug: string;
  icon?: string;
  path?: string;
  sort_order: number;
  children?: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface ArticleVersion {
  id: number;
  article_id: string;
  edited_by: number;
  diff: unknown;
  version_num: number;
  created_at: string;
}

export interface LiveBlogEntry {
  id: number;
  article_id: string;
  body: unknown;
  author_id: number;
  is_pinned: boolean;
  created_at: string;
}

export interface CreateArticleInput {
  story_id?: string;
  title: string;
  language?: string;
  body?: unknown;
  excerpt?: string;
  district_id?: number;
  is_breaking?: boolean;
  is_featured?: boolean;
  is_national?: boolean;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  category_ids?: number[];
  tag_ids?: number[];
}

export interface ListArticlesFilter {
  status?: ArticleStatus;
  category?: string;
  language?: string;
  author_id?: number;
  search?: string;
  sort?: string;
  page?: number;
  per_page?: number;
  from?: string;
  to?: string;
  is_breaking?: boolean;
  is_featured?: boolean;
}

// ─── Home Feed ──────────────────────────────────

export interface HomeFeedData {
  breaking?: ArticleListItem[];
  featured?: ArticleListItem[];
  latest?: ArticleListItem[];
  trending?: ArticleListItem[];
  categories?: CategoryFeedBlock[];
}

export interface CategoryFeedBlock {
  category: Category;
  articles: ArticleListItem[];
}
