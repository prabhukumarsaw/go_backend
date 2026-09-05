import Link from "next/link";
import { format } from "date-fns";
import { ArticleBackButton } from "./article-back-button";
import { ArticleShareAndTracker } from "./article-share-and-tracker";
import type { ArticleData } from "./types";

interface ArticleHeaderProps {
  article: ArticleData;
  primaryCategory: string;
  categorySlug: string;
  readingTime: number;
}

export function ArticleHeader({
  article,
  primaryCategory,
  categorySlug,
  readingTime,
}: ArticleHeaderProps) {
  const publishedDate = article.published_at
    ? format(new Date(article.published_at), "MMM d, yyyy · h:mm a")
    : format(new Date(article.created_at || Date.now()), "MMM d, yyyy");

  const authorName = article.author_name || "Digital Desk Bureau";
  const authorInitial = authorName.charAt(0).toUpperCase();

  const authorDisplay = authorName.startsWith("@")
    ? authorName.toUpperCase()
    : `@${authorName.toUpperCase()}`;

  return (
    <header className="space-y-3 pb-2">
      {/* ─── Breadcrumb Navigation & Back Link ─── */}
      <div className="flex items-center justify-between gap-3 text-xs sm:text-[13px] text-muted-foreground pb-2 border-b border-border/60 font-sans">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5"
        >
          <Link
            href="/"
            className="hover:text-foreground transition-colors font-medium shrink-0"
          >
            Home
          </Link>
          <span className="text-muted-foreground/50 shrink-0">»</span>
          <Link
            href={`/${categorySlug}`}
            className="hover:text-foreground transition-colors capitalize font-medium shrink-0"
          >
            {primaryCategory}
          </Link>
          <span className="text-muted-foreground/50 shrink-0">»</span>
          <span className="text-muted-foreground/80 truncate max-w-[200px] xs:max-w-[280px] sm:max-w-md font-normal">
            {article.title}
          </span>
        </nav>

        <ArticleBackButton />
      </div>

      {/* ─── Main Headline ─── */}
      <h1 className="text-2xl sm:text-3xl lg:text-[2.15rem] font-bold text-foreground leading-[1.32] sm:leading-[1.28] font-hindi tracking-normal pt-1">
        {article.title}
      </h1>

      {/* ─── Lead Excerpt (Clean natural editorial lead) ─── */}
      {article.excerpt && (
        <p className="text-sm sm:text-base text-muted-foreground font-hindi leading-relaxed pt-1">
          {article.excerpt}
        </p>
      )}

      {/* ─── Byline & Meta Bar (Exact Naxatra News Reference) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-border/70 py-3 mt-4 gap-3 text-xs font-sans">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted/80 text-foreground font-bold flex items-center justify-center text-xs border border-border shrink-0 font-mono shadow-2xs">
            {authorInitial}
          </div>
          <div>
            <div className="font-bold text-foreground tracking-wide text-xs sm:text-[13px]">
              BY {authorDisplay}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              <time dateTime={article.published_at || article.created_at}>
                {publishedDate}
              </time>
              {article.updated_at && article.updated_at !== article.published_at && (
                <span> • Updated: {format(new Date(article.updated_at), "MMM d, yyyy")}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono shrink-0">
          <span className="flex items-center gap-1.5">
            <span>💬</span> 0 Comments
          </span>
          <span className="flex items-center gap-1.5">
            <span>⏱</span> {readingTime} Mins Read
          </span>
        </div>
      </div>

      {/* ─── Mobile-Only Horizontal Share & Font Controls ─── */}
      <div className="lg:hidden pt-1">
        <ArticleShareAndTracker
          articleId={article.id}
          articleTitle={article.title}
          articleSlug={article.slug}
          categories={article.categories || [primaryCategory]}
        />
      </div>
    </header>
  );
}
