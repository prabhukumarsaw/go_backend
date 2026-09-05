import Link from "next/link";
import { format } from "date-fns";
import { IconChevronRight } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

interface RelatedArticleItem {
  id: string;
  title: string;
  slug: string;
  featured_image?: string;
  published_at?: string;
}

interface ArticleRelatedProps {
  articles: RelatedArticleItem[];
  primaryCategory: string;
  categorySlug: string;
}

export function ArticleRelated({
  articles,
  primaryCategory,
  categorySlug,
}: ArticleRelatedProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="pt-8 mt-8 border-t border-border/80 space-y-5">
      <div className="border-b border-border/80 pb-2">
        <h2 className="inline-block text-base sm:text-lg font-black tracking-wider uppercase text-[#FF6B35] border-b-2 border-[#FF6B35] pb-2 font-mono">
          RELATED POSTS
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {articles.slice(0, 3).map((rel) => (
          <div
            key={rel.id}
            className="group flex flex-col space-y-2.5 cursor-pointer"
          >
            {rel.featured_image ? (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted/40 border border-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rel.featured_image}
                  alt={rel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl bg-muted/40 border border-border/60 flex items-center justify-center text-xs text-muted-foreground">
                News Story
              </div>
            )}
            <div className="space-y-1">
              <Link href={`/news/${rel.slug}`}>
                <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 hover:text-[#FF6B35] transition-colors font-hindi leading-snug">
                  {rel.title}
                </h3>
              </Link>
              <p className="text-[11px] text-muted-foreground font-mono">
                {rel.published_at
                  ? format(new Date(rel.published_at), "MMM d, yyyy, hh:mm a 'IST'")
                  : "Recent"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
