import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import type { Metadata } from "next";
import {
  IconArrowLeft,
  IconBolt,
  IconStar,
  IconArticle,
  IconClock,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { listArticles, listCategories } from "@/lib/api/articles";
import { siteConfig } from "@/config/site";

// Reserved route names that must never be treated as category slugs
const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "dashboard",
  "panel",
  "studio",
  "search",
  "api",
  "settings",
  "news",
  "media",
  "analytics",
  "users",
  "roles",
  "comments",
  "tags",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
  "feed",
  "trending",
  "breaking",
]);

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

async function getCategoryData(rawSlug: string) {
  const normalizedSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

  if (RESERVED_SLUGS.has(normalizedSlug)) {
    return { isReserved: true, categoryName: null, articles: [], isValidCategory: false };
  }

  let categories: any[] = [];
  try {
    const catRes = await listCategories();
    categories = catRes?.data || [];
  } catch {
    // Backend offline fallback
  }

  // Match against live DB categories
  const matched = categories.find(
    (c) =>
      c.slug.toLowerCase() === normalizedSlug ||
      c.name.toLowerCase() === normalizedSlug
  );

  // If backend returned categories and slug is not found, reject as invalid category
  if (categories.length > 0 && !matched) {
    return { isReserved: false, categoryName: null, articles: [], isValidCategory: false };
  }

  const categorySlug = matched ? matched.slug : normalizedSlug;
  const categoryName = matched
    ? matched.name
    : normalizedSlug.charAt(0).toUpperCase() + normalizedSlug.slice(1);

  let articles: any[] = [];
  try {
    const res = await listArticles({ category: categorySlug, per_page: 24 });
    articles = res?.data || [];
  } catch {
    // Fallback
  }

  return {
    isReserved: false,
    categoryName,
    articles,
    isValidCategory: true,
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const normalized = decodeURIComponent(category).trim().toLowerCase();
  if (RESERVED_SLUGS.has(normalized)) {
    return {};
  }
  const formatted = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return {
    title: `${formatted} News`,
    description: `Latest ${formatted} news, breaking updates, and in-depth reporting from ${siteConfig.name}.`,
    openGraph: {
      title: `${formatted} News | ${siteConfig.name}`,
      description: `Latest ${formatted} reporting from ${siteConfig.name}.`,
      url: `${siteConfig.url}/${normalized}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${formatted} News | ${siteConfig.name}`,
      description: `Latest ${formatted} reporting from ${siteConfig.name}.`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const { isReserved, categoryName, articles, isValidCategory } =
    await getCategoryData(category);

  if (isReserved || !isValidCategory) {
    notFound();
  }

  const heroArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Category Header */}
      <div className="border-b pb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2 text-xs"
          render={<Link href="/" />}
        >
          <IconArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          All Sections
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl capitalize font-serif">
              {categoryName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest stories, reporting, and analysis in {categoryName}.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {articles.length} {articles.length === 1 ? "article" : "articles"}
          </Badge>
        </div>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          icon={IconArticle}
          title={`No articles in ${categoryName} yet`}
          description="Stories published under this category will appear here. Check back soon or browse other news categories."
        >
          <Button variant="outline" size="sm" render={<Link href="/" />}>
            Back to Homepage
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {/* Category Hero Article */}
          {heroArticle && (
            <Card className="overflow-hidden border bg-card hover:shadow-md transition-shadow">
              <div className="grid gap-6 lg:grid-cols-2">
                {heroArticle.featured_image && (
                  <div className="relative aspect-video lg:aspect-auto overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroArticle.featured_image}
                      alt={heroArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    {heroArticle.is_breaking && (
                      <Badge
                        variant="destructive"
                        className="gap-1 text-[10px]"
                      >
                        <IconBolt className="h-3 w-3" />
                        Breaking
                      </Badge>
                    )}
                    {heroArticle.is_featured && (
                      <Badge
                        variant="secondary"
                        className="gap-1 text-[10px]"
                      >
                        <IconStar className="h-3 w-3 text-amber-500" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <Link href={`/news/${heroArticle.slug}`}>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight hover:underline leading-snug font-serif">
                      {heroArticle.title}
                    </h2>
                  </Link>

                  {heroArticle.excerpt && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {heroArticle.excerpt}
                    </p>
                  )}

                  <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground border-t pt-4">
                    <span className="font-medium text-foreground">
                      {heroArticle.author_name || "Newsroom Staff"}
                    </span>
                    <span>·</span>
                    <time
                      dateTime={
                        heroArticle.published_at || heroArticle.created_at
                      }
                    >
                      {heroArticle.published_at
                        ? format(
                            new Date(heroArticle.published_at),
                            "MMM d, yyyy"
                          )
                        : format(
                            new Date(heroArticle.created_at),
                            "MMM d, yyyy"
                          )}
                    </time>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          {/* Grid of remaining articles */}
          {remainingArticles.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {remainingArticles.map((article) => (
                <Card
                  key={article.id}
                  className="group overflow-hidden border bg-card hover:shadow-md transition-shadow flex flex-col"
                >
                  {article.featured_image ? (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted/40 border-b flex items-center justify-center">
                      <span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-mono">
                        {categoryName}
                      </span>
                    </div>
                  )}

                  <CardContent className="flex flex-1 flex-col justify-between p-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        {article.is_breaking && (
                          <Badge
                            variant="destructive"
                            className="h-4 px-1 text-[10px]"
                          >
                            Breaking
                          </Badge>
                        )}
                      </div>
                      <Link href={`/news/${article.slug}`}>
                        <h3 className="font-semibold leading-snug line-clamp-2 hover:underline">
                          {article.title}
                        </h3>
                      </Link>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t pt-3">
                      <span>{article.author_name || "Staff"}</span>
                      <time>
                        {article.published_at
                          ? format(new Date(article.published_at), "MMM d")
                          : format(new Date(article.created_at), "MMM d")}
                      </time>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
