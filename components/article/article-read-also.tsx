import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

interface ArticleReadAlsoProps {
  title: string;
  slug: string;
  category?: string;
}

export function ArticleReadAlso({ title, slug, category }: ArticleReadAlsoProps) {
  if (!title || !slug) return null;

  return (
    <aside className="my-5 py-3 px-4 border-l-4 border-red-600 bg-red-500/[0.03] dark:bg-red-950/15 rounded-r-xl shadow-2xs border-y border-r border-border/70 transition-all hover:bg-red-500/[0.06]">
      <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1 font-hindi">
        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
        <span>यह भी पढ़ें</span>
        {category && (
          <span className="text-muted-foreground/70 font-normal">
            • {category}
          </span>
        )}
      </div>

      <Link
        href={`/news/${slug}`}
        className="group flex items-center justify-between gap-3 text-sm sm:text-base font-semibold text-foreground hover:text-red-600 transition-colors leading-snug font-hindi"
      >
        <span className="line-clamp-2">{title}</span>
        <IconChevronRight className="h-4 w-4 shrink-0 text-red-600 group-hover:translate-x-1 transition-transform" />
      </Link>
    </aside>
  );
}
