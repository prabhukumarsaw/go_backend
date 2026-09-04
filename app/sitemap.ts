import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listArticles, listCategories } from "@/lib/api/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await listArticles({ per_page: 100 });
    const articles = res?.data || [];
    articleRoutes = articles.map((article) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: new Date(article.updated_at || article.created_at),
      changeFrequency: "hourly",
      priority: 0.9,
    }));
  } catch {
    // Fallback if backend API is not responding during static generation
  }

  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await listCategories();
    const categories = res?.data || [];
    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch {
    // Fallback
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
