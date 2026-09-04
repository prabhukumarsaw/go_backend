"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ResponsiveDataView } from "@/components/shared/responsive-data-view";
import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options";
import { FloatingActionBar } from "@/components/shared/data-table/floating-action-bar";
import { useStudioArticles } from "../hooks/use-articles";
import { useArticleFilters } from "../hooks/use-article-filters";
import { articleColumns } from "./article-columns";
import { ArticleFilters } from "./article-filters";
import { ArticleStatusBadge } from "./article-status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconArticle, IconCheck, IconClock, IconEye } from "@tabler/icons-react";
import { getAnalyticsOverview } from "@/lib/api/analytics";
import { transitionArticleStatus } from "@/lib/api/articles";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import type { Category } from "@/types/content";

interface ArticleTableProps {
  categories?: Category[];
}

export function ArticleTable({ categories = [] }: ArticleTableProps) {
  const { search, status, setStatus, category, page, perPage, setPage, setPerPage } = useArticleFilters();

  const filterParam = {
    search: search || undefined,
    status: status !== "all" ? (status as any) : undefined,
    category: category !== "all" ? category : undefined,
    page,
    per_page: perPage,
  };

  const { data, isLoading, isError, refetch } = useStudioArticles(filterParam);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const queryClient = useQueryClient();
  const [isBatchUpdating, setIsBatchUpdating] = React.useState(false);

  const articles = data?.data || [];
  const meta = data?.meta || data?.pagination;
  const total = meta?.total ?? articles.length;
  const pageCount = meta?.total_pages ?? Math.max(1, Math.ceil(total / perPage));

  const { data: analyticsData } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => getAnalyticsOverview(),
    staleTime: 30_000,
  });
  const overview = analyticsData?.data;

  const totalArticles = overview?.total_articles ?? total;
  const publishedArticles = overview?.total_published ?? articles.filter((a) => a.status === "published").length;
  const draftArticles = Math.max(0, totalArticles - publishedArticles);
  const totalViews = overview?.total_views ?? articles.reduce((sum, a) => sum + (Number(a.view_count) || 0), 0);

  const table = useReactTable({
    data: articles,
    columns: articleColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: Math.max(0, page - 1),
        pageSize: perPage,
      },
    },
    manualPagination: true,
    pageCount,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: Math.max(0, page - 1), pageSize: perPage })
          : updater;
      if (next.pageIndex + 1 !== page) {
        setPage(next.pageIndex + 1);
      }
      if (next.pageSize !== perPage) {
        setPerPage(next.pageSize);
        setPage(1);
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBatchStatusChange = async (targetStatus: "published" | "draft" | "archived") => {
    if (selectedCount === 0) return;
    setIsBatchUpdating(true);
    try {
      await Promise.all(
        selectedRows.map((r) => transitionArticleStatus(r.original.id, targetStatus))
      );
      toast.success(`Updated ${selectedCount} article(s) to ${targetStatus}`);
      setRowSelection({});
      queryClient.invalidateQueries({ queryKey: ["studio-articles"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update selected articles");
    } finally {
      setIsBatchUpdating(false);
    }
  };

  const handleBatchExport = () => {
    if (selectedCount === 0) return;
    const headers = ["ID", "Title", "Status", "Author", "Language", "Views", "Published At"];
    const rows = selectedRows.map((r) => [
      r.original.id,
      `"${r.original.title.replace(/"/g, '""')}"`,
      r.original.status,
      `"${r.original.author_name || ""}"`,
      r.original.language,
      r.original.view_count || 0,
      r.original.published_at || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `articles-export-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${selectedCount} article(s) to CSV`);
  };

  if (isError) {
    return (
      <ErrorState
        title="Failed to load articles"
        message="Could not retrieve the article list. Ensure the backend is active."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Article Stats KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          onClick={() => setStatus("all")}
          className={`cursor-pointer transition-all hover:shadow-xs select-none ${
            status === "all" ? "ring-2 ring-primary/40 bg-primary/5" : "bg-card"
          }`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Total Articles
              </p>
              <div className="text-xl font-bold text-foreground mt-0.5 font-mono">
                {totalArticles.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                All workflow stages
              </p>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <IconArticle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatus("published")}
          className={`cursor-pointer transition-all hover:shadow-xs select-none ${
            status === "published" ? "ring-2 ring-emerald-500/40 bg-emerald-500/5" : "bg-card"
          }`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Published
              </p>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                {publishedArticles.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Live to readers
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <IconCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatus("draft")}
          className={`cursor-pointer transition-all hover:shadow-xs select-none ${
            status === "draft" ? "ring-2 ring-amber-500/40 bg-amber-500/5" : "bg-card"
          }`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Drafts & Review
              </p>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                {draftArticles.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                In progress / review
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <IconClock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Total Views
              </p>
              <div className="text-xl font-bold text-primary mt-0.5 font-mono">
                {totalViews.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Cumulative readership
              </p>
            </div>
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <IconEye className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <ArticleFilters categories={categories} />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {total} article(s) found
          </p>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <ResponsiveDataView
        table={table}
        columnsLength={articleColumns.length}
        isLoading={isLoading}
        renderMobileCard={(row) => {
          const article = row.original;
          return (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/studio/${article.id}`}
                  className="font-semibold text-sm hover:text-primary line-clamp-2 text-foreground transition-colors"
                >
                  {article.title}
                </Link>
                <ArticleStatusBadge status={article.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">{article.category_names?.[0] || "Uncategorized"}</span>
                <span>·</span>
                <span>{article.author_name || "Staff"}</span>
                <span>·</span>
                <span className="font-mono">{Number(article.view_count || 0).toLocaleString()} views</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="text-muted-foreground">
                  {article.published_at
                    ? format(new Date(article.published_at), "MMM d, yyyy")
                    : "Not published"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  render={<Link href={`/studio/${article.id}`} />}
                >
                  Edit
                </Button>
              </div>
            </div>
          );
        }}
      />

      <FloatingActionBar
        selectedCount={selectedCount}
        onClearSelection={() => setRowSelection({})}
        onBatchStatusChange={handleBatchStatusChange}
        onBatchExport={handleBatchExport}
        isLoading={isBatchUpdating}
      />
    </div>
  );
}
