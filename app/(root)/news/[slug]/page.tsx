import { notFound } from "next/navigation";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowLeft,
  IconClock,
  IconEye,
  IconBolt,
  IconStar,
  IconChevronRight,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArticleRenderer } from "@/features/editor/renderer/article-renderer";
import { LiveBlogFeed } from "@/components/liveblog/live-blog-feed";
import { NewsArticleJsonLd } from "@/components/seo/news-article-jsonld";
import { ArticleShareAndTracker } from "@/components/article/article-share-and-tracker";
import { getArticleBySlug, listArticles } from "@/lib/api/articles";
import { siteConfig } from "@/config/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await getArticleBySlug(slug);
    const article = response?.data;
    if (!article) return { title: "Article Not Found" };

    const title = article.meta_title || article.title;
    const description = article.meta_description || article.excerpt || siteConfig.description;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: article.published_at,
        modifiedTime: article.updated_at,
        images: article.featured_image ? [article.featured_image] : [`${siteConfig.url}/og-default.jpg`],
        url: `${siteConfig.url}/news/${slug}`,
        siteName: siteConfig.name,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: article.featured_image ? [article.featured_image] : [`${siteConfig.url}/og-default.jpg`],
      },
    };
  } catch {
    return { title: "News Article" };
  }
}

function estimateReadingTime(body: any): number {
  try {
    const text = typeof body === "string" ? body : JSON.stringify(body);
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  } catch {
    return 3;
  }
}

export default async function PublicArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let article = null;
  try {
    const res = await getArticleBySlug(slug);
    article = res?.data;
  } catch {
    // Backend offline / not found
  }

  if (!article) {
    notFound();
  }

  const primaryCategory = article.categories?.[0] || "News";
  const categorySlug = primaryCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Fetch related articles from same category
  let relatedArticles: any[] = [];
  try {
    const relRes = await listArticles({
      category: categorySlug,
      per_page: 4,
    });
    relatedArticles = (relRes?.data || []).filter(
      (a: any) => a.id !== article.id
    );
  } catch {
    // Fallback
  }

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), "MMMM d, yyyy · h:mm a")
    : format(new Date(article.created_at), "MMMM d, yyyy");

  const readingTime = estimateReadingTime(article.body);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in-up">
      <NewsArticleJsonLd article={article} />

      {/* ─── Breadcrumb Navigation ─── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <IconChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <Link href={`/${categorySlug}`} className="hover:text-foreground transition-colors capitalize">
          {primaryCategory}
        </Link>
        <IconChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <span className="truncate max-w-[200px] sm:max-w-xs text-foreground font-medium">
          {article.title}
        </span>
      </nav>

      {/* ─── Article Header ─── */}
      <header className="space-y-4 pb-6 border-b">
        <div className="flex flex-wrap items-center gap-2">
          {article.is_breaking && (
            <Badge variant="destructive" className="gap-1 text-[11px] font-mono uppercase bg-rose-600 font-bold">
              <IconBolt className="h-3 w-3" />
              Breaking Alert
            </Badge>
          )}
          {article.is_featured && (
            <Badge variant="secondary" className="gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              <IconStar className="h-3 w-3 fill-amber-500 text-amber-500" />
              Editorial Spotlight
            </Badge>
          )}
          <Link href={`/${categorySlug}`}>
            <Badge variant="outline" className="capitalize text-xs font-semibold hover:bg-muted transition-colors cursor-pointer">
              {primaryCategory}
            </Badge>
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight font-serif text-foreground">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-sans font-normal">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-muted-foreground border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              By {article.author_name || "Newsroom Bureau Staff"}
            </span>
            <span>·</span>
            <time dateTime={article.published_at || article.created_at}>
              {publishedDate}
            </time>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <IconClock className="h-3.5 w-3.5" />
              {readingTime} min read
            </span>
            {(article.view_count || 0) > 0 && (
              <span className="flex items-center gap-1">
                <IconEye className="h-3.5 w-3.5" />
                {article.view_count.toLocaleString()} reads
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Social Sharing & Device Affinity Tracker */}
        <ArticleShareAndTracker
          articleId={article.id}
          articleTitle={article.title}
          articleSlug={article.slug}
          categories={article.categories || [primaryCategory]}
        />
      </header>

      {/* ─── Featured Hero Image ─── */}
      {article.featured_image && (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full rounded-2xl object-cover aspect-video shadow-md border"
          />
          {article.caption && (
            <figcaption className="text-xs text-center text-muted-foreground mt-2 italic font-serif">
              {article.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* ─── Optimized Server-Rendered Article Body ─── */}
      <div className="py-4 article-content prose dark:prose-invert max-w-none">
        <ArticleRenderer content={article.body} />
      </div>

      {/* ─── Real-time Live Blog Coverage Timeline (Auto-polling) ─── */}
      <LiveBlogFeed articleId={article.id} />

      {/* ─── Related Stories in same category ─── */}
      {relatedArticles.length > 0 && (
        <section className="pt-10 border-t space-y-4">
          <h2 className="text-2xl font-bold tracking-tight font-serif">
            More in {primaryCategory}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((rel) => (
              <Card
                key={rel.id}
                className="group border bg-card hover:shadow-md transition-all overflow-hidden flex flex-col rounded-xl"
              >
                {rel.featured_image && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.featured_image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardContent className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <Link href={`/news/${rel.slug}`}>
                    <h3 className="font-bold text-sm line-clamp-2 hover:underline font-serif leading-snug">
                      {rel.title}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {rel.published_at
                      ? format(new Date(rel.published_at), "MMM d, yyyy")
                      : "Recent"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
