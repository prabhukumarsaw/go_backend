import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { IconTag } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { ArticleRenderer } from "@/features/editor/renderer";
import { LiveBlogFeed } from "@/components/liveblog/live-blog-feed";
import { NewsArticleJsonLd } from "@/components/seo/news-article-jsonld";
import {
  ArticleHeader,
  ArticleHero,
  ArticleToc,
  ArticleAuthorCard,
  ArticleReadAlso,
  ArticleSidebar,
  ArticleRelated,
  DesktopVerticalShare,
} from "@/components/article";
import {
  getArticleBySlug,
  listArticles,
  listTrendingNews,
} from "@/lib/api/articles";
import { siteConfig } from "@/config/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await getArticleBySlug(slug);
    const article = response?.data;
    if (!article) return { title: "Article Not Found" };

    const title = article.meta_title || article.title;
    const description =
      article.meta_description || article.excerpt || siteConfig.description;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: article.published_at,
        modifiedTime: article.updated_at,
        images: article.featured_image
          ? [article.featured_image]
          : [`${siteConfig.url}/og-default.jpg`],
        url: `${siteConfig.url}/news/${slug}`,
        siteName: siteConfig.name,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: article.featured_image
          ? [article.featured_image]
          : [`${siteConfig.url}/og-default.jpg`],
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

function extractHeadings(
  content: any
): Array<{ id: string; text: string; level: number }> {
  try {
    const doc = typeof content === "string" ? JSON.parse(content) : content;
    if (!doc?.content || !Array.isArray(doc.content)) return [];
    const headings: Array<{ id: string; text: string; level: number }> = [];
    for (const node of doc.content) {
      if (node.type === "heading" && node.content) {
        const text = node.content.map((c: any) => c.text || "").join("").trim();
        if (text) {
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          headings.push({ id, text, level: node.attrs?.level || 2 });
        }
      }
    }
    return headings;
  } catch {
    return [];
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
  const categorySlug = primaryCategory
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  // Fetch related, trending, and latest stories in parallel
  const [relResult, trendResult, latResult] = await Promise.allSettled([
    listArticles({ category: categorySlug, per_page: 6 }),
    listTrendingNews(5),
    listArticles({ per_page: 6 }),
  ]);

  const relatedArticles = (
    relResult.status === "fulfilled" ? relResult.value?.data || [] : []
  ).filter((a: any) => a.id !== article.id);

  let trendingArticles =
    trendResult.status === "fulfilled" ? trendResult.value?.data || [] : [];
  if (trendingArticles.length === 0 && latResult.status === "fulfilled") {
    trendingArticles = latResult.value?.data || [];
  }

  const latestArticles = (
    latResult.status === "fulfilled" ? latResult.value?.data || [] : []
  ).filter((a: any) => a.id !== article.id);

  const readAlsoArticle = relatedArticles[0] || trendingArticles[0];
  const readingTime = estimateReadingTime(article.body);
  const headings = extractHeadings(article.body);
  const authorName = article.author_name || "Digital Desk Bureau";

  return (
    <div className="w-full max-w-[1360px] xl:max-w-[1400px] 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-8 animate-fade-in-up font-hindi">
      <NewsArticleJsonLd article={article} />

      {/* ─── Main Responsive Newsroom Layout ─── */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start justify-center">
        {/* ─── Left Sticky Share Column ─── */}
        <div className="hidden lg:flex flex-col items-center sticky top-24 shrink-0 w-11 pt-1 z-20">
          <DesktopVerticalShare
            articleTitle={article.title}
            articleSlug={article.slug}
          />
        </div>

        {/* ─── Center / Main Content Column (Clean Left Alignment & Optimal Reading Width) ─── */}
        <main
          id="article-reading-container"
          data-font-size="normal"
          className="w-full lg:flex-1 max-w-[820px] xl:max-w-[860px] min-w-0 space-y-5"
        >
          <article className="relative space-y-4">
            {/* Header: Breadcrumb, Kicker, Headline, Excerpt, Byline & Share Bar */}
            <ArticleHeader
              article={article}
              primaryCategory={primaryCategory}
              categorySlug={categorySlug}
              readingTime={readingTime}
            />

            {/* Featured Hero Image with Credit */}
            <ArticleHero
              featuredImage={article.featured_image}
              title={article.title}
              caption={article.caption}
            />

            {/* Content Stream with Wikipedia Readability */}
            <div className="space-y-5 pt-1 text-left">
              {/* Story Outline (if headings exist) */}
              <ArticleToc headings={headings} />

              {/* Server-Rendered Article Body */}
              <div className="reading-stream w-full text-left">
                <ArticleRenderer content={article.body} />
              </div>

              {/* In-Article "Read Also" Callout Box */}
              {readAlsoArticle && (
                <ArticleReadAlso
                  title={readAlsoArticle.title}
                  slug={readAlsoArticle.slug}
                  category={primaryCategory}
                />
              )}

              {/* Article Tags Cloud */}
              {article.categories && article.categories.length > 0 && (
                <div className="pt-4 border-t border-border/70">
                  <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-muted-foreground font-hindi">
                    <IconTag className="h-3.5 w-3.5 text-red-600" />
                    <span>संबंधित विषय / Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.categories.map((cat, i) => (
                      <Link
                        key={i}
                        href={`/${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-500/10 hover:text-red-600 transition-colors px-3 py-1 text-xs font-medium font-hindi"
                        >
                          #{cat}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio Box */}
              <ArticleAuthorCard authorName={authorName} />

              {/* Real-time Live Blog Coverage Timeline */}
              <LiveBlogFeed articleId={article.id} />

              {/* ─── Bottom Section: Related Stories in Same Category (Reference Screenshot 4) ─── */}
              <ArticleRelated
                articles={relatedArticles}
                primaryCategory={primaryCategory}
                categorySlug={categorySlug}
              />
            </div>
          </article>
        </main>

        {/* ─── Right Column: Sticky Newsroom Sidebar (Reference Screenshot 2, 3, 4) ─── */}
        <ArticleSidebar
          trendingArticles={trendingArticles}
          latestArticles={latestArticles}
        />
      </div>
    </div>
  );
}
