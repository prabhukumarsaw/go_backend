export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: any;
  featured_image?: string;
  caption?: string;
  categories?: string[];
  author_name?: string;
  author_avatar?: string;
  author_bio?: string;
  is_breaking?: boolean;
  is_featured?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  view_count?: number;
  meta_title?: string;
  meta_description?: string;
}

export interface SidebarArticleItem {
  id: string;
  slug: string;
  title: string;
  author_name?: string;
  published_at?: string;
  featured_image?: string;
  categories?: string[];
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}
