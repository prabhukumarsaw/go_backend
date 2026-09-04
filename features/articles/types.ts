export type {
  Article,
  ArticleListItem,
  ArticleStatus,
  ArticleVersion,
  Category,
  CreateArticleInput,
  ListArticlesFilter,
  LiveBlogEntry,
} from "@/types/content";

export const ARTICLE_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }
> = {
  draft: {
    label: "Draft",
    variant: "secondary",
    color: "bg-muted text-muted-foreground border-border",
  },
  review: {
    label: "In Review",
    variant: "outline",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  approved: {
    label: "Approved",
    variant: "outline",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  scheduled: {
    label: "Scheduled",
    variant: "outline",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  published: {
    label: "Published",
    variant: "default",
    color: "bg-primary text-primary-foreground border-transparent",
  },
  archived: {
    label: "Archived",
    variant: "outline",
    color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
};
