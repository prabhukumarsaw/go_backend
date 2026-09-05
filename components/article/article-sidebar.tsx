import Link from "next/link";
import { format } from "date-fns";
import {
  IconFlame,
  IconClock,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import { NewsletterBox } from "@/components/article/newsletter-box";

interface TrendingItem {
  id: string;
  slug: string;
  title: string;
  author_name?: string;
  published_at?: string;
  featured_image?: string;
}

interface LatestItem {
  id: string;
  slug: string;
  title: string;
  published_at?: string;
  featured_image?: string;
  categories?: string[];
}

interface ArticleSidebarProps {
  trendingArticles: TrendingItem[];
  latestArticles?: LatestItem[];
}

const FEATURED_TOPICS = [
  { name: "बोकारो", slug: "bokaro" },
  { name: "झारखंड", slug: "jharkhand" },
  { name: "बिहार", slug: "bihar" },
  { name: "राजनीति", slug: "politics" },
  { name: "अपराध", slug: "crime" },
  { name: "मौसम", slug: "weather" },
  { name: "व्यापार", slug: "business" },
  { name: "खेल", slug: "sports" },
  { name: "टेक्नोलॉजी", slug: "technology" },
  { name: "धनबाद", slug: "dhanbad" },
  { name: "रांची", slug: "ranchi" },
  { name: "पटना", slug: "patna" },
];

export function ArticleSidebar({
  trendingArticles,
  latestArticles = [],
}: ArticleSidebarProps) {
  const topFeatured = latestArticles[0] || trendingArticles[0];

  return (
    <aside className="w-full lg:w-80 xl:w-[340px] space-y-5 lg:sticky lg:top-20 self-start shrink-0">
      {/* ─── Top Featured / Sponsored Card (Reference Screenshot 2 & 3) ─── */}
      {topFeatured && (
        <div className="relative rounded-xl overflow-hidden border border-border/80 bg-card group shadow-xs">
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[10px] font-mono font-bold uppercase bg-black/60 text-white/90 px-2 py-0.5 rounded backdrop-blur-xs">
              Sponsored
            </span>
          </div>
          {topFeatured.featured_image ? (
            <div className="aspect-[4/3] w-full bg-muted overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={topFeatured.featured_image}
                alt={topFeatured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="aspect-[4/3] w-full bg-muted/60 flex items-center justify-center text-muted-foreground text-xs">
              Featured Story
            </div>
          )}
          <div className="p-3.5 space-y-1">
            <Link href={`/news/${topFeatured.slug}`}>
              <h4 className="font-semibold text-xs sm:text-[13px] text-foreground group-hover:text-red-600 transition-colors line-clamp-2 font-hindi leading-snug">
                {topFeatured.title}
              </h4>
            </Link>
          </div>
        </div>
      )}

      {/* ─── Featured Topics (Reference Screenshot 3) ─── */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
          <h3 className="font-bold text-sm text-foreground tracking-tight flex items-center gap-1">
            <span>Featured Topics</span>
          </h3>
          <IconArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FEATURED_TOPICS.map((topic) => (
            <Link key={topic.slug} href={`/${topic.slug}`}>
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-all font-hindi">
                {topic.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Trending Top Stories (Reference Screenshot 4) ─── */}
      {trendingArticles.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
            <h3 className="font-bold text-sm text-foreground tracking-tight flex items-center gap-1.5 font-hindi">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              <span>बड़ी खबरें / Trending</span>
            </h3>
          </div>

          <div className="divide-y divide-border/50">
            {trendingArticles.slice(0, 5).map((t, idx) => (
              <div key={t.id} className="group py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5">
                <span className="text-xl sm:text-2xl font-black text-red-600/80 group-hover:text-red-600 transition-colors leading-none shrink-0 w-6 font-mono pt-0.5">
                  {idx + 1}.
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link href={`/news/${t.slug}`}>
                    <h4 className="font-semibold text-xs sm:text-[13px] text-foreground group-hover:text-red-600 transition-colors line-clamp-2 font-hindi leading-snug">
                      {t.title}
                    </h4>
                  </Link>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="uppercase font-semibold truncate max-w-[110px]">
                      BY {t.author_name || "DIGITAL DESK"}
                    </span>
                    <span>—</span>
                    <time dateTime={t.published_at}>
                      {t.published_at
                        ? format(new Date(t.published_at), "MMM d, yyyy")
                        : "Recent"}
                    </time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Newsletter Box (Reference Screenshot 4) ─── */}
      <NewsletterBox />
    </aside>
  );
}
