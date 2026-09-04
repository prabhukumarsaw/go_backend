import { Suspense } from "react";
import Link from "next/link";
import { IconPencilPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ArticleTable } from "@/features/articles/components/article-table";
import { LoadingState } from "@/components/shared/loading-state";

export default function ArticlesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Articles"
        description="Write, review drafts, and manage published news."
      >
        <Button size="sm" className="h-8 shadow-xs font-medium" render={<Link href="/studio/new" />}>
          <IconPencilPlus className="mr-1.5 h-3.5 w-3.5" />
          New Article
        </Button>
      </PageHeader>

      <Suspense fallback={<LoadingState message="Loading articles…" />}>
        <ArticleTable />
      </Suspense>
    </div>
  );
}
