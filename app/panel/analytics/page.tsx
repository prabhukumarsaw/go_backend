"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IconEye,
  IconArticle,
  IconFlame,
  IconUsers,
  IconTrendingUp,
  IconRefresh,
  IconAward,
  IconMapPin,
  IconCategory,
} from "@tabler/icons-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { getAnalyticsOverview, getAuthorLeaderboard } from "@/lib/api/analytics";

export default function AnalyticsPage() {
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isRefetching,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => getAnalyticsOverview(),
  });

  const { data: authorsData } = useQuery({
    queryKey: ["analytics-authors"],
    queryFn: () => getAuthorLeaderboard(),
  });

  const overview = overviewData?.data;
  const authors = authorsData?.data || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Track article views, readership trends, and author performance."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="h-8 text-xs"
        >
          <IconRefresh
            className={`h-3.5 w-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </PageHeader>

      {isOverviewLoading ? (
        <LoadingState message="Loading analytics…" />
      ) : isError || !overview ? (
        <ErrorState
          title="Failed to load analytics"
          message="Could not connect to the API. Ensure the backend is active."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Page Views
                </CardTitle>
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <IconEye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-4 pt-0 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold tracking-tight">
                  {overview.total_views.toLocaleString()}
                </div>
                <p className="mt-0.5 text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3" /> Total views
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Published
                </CardTitle>
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <IconArticle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-4 pt-0 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold tracking-tight">
                  {overview.total_published}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Active live stories
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Breaking News
                </CardTitle>
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                  <IconFlame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-4 pt-0 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-rose-500">
                  {overview.total_breaking}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Breaking alerts
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Readers
                </CardTitle>
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                  <IconUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-4 pt-0 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold tracking-tight">
                  {overview.total_subscribers.toLocaleString()}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Regional Editions & Categories Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Regional State Edition Readership */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <IconMapPin className="h-4 w-4 text-primary" />
                  State Edition Readership Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Regional Desk / State</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead className="text-right">Total Impressions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.state_distribution?.map((region, idx) => (
                      <TableRow key={region.region_id || idx}>
                        <TableCell className="font-semibold text-xs flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            #{idx + 1}
                          </Badge>
                          <span>{region.region_name || "National"}</span>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {region.articles}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-primary">
                          {region.views.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Category Taxonomy Breakdown */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <IconCategory className="h-4 w-4 text-emerald-500" />
                  Category Coverage Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {overview.category_breakdown?.map((cat) => {
                  const maxCount = Math.max(
                    ...overview.category_breakdown.map((c) => Number(c.count) || 1),
                    1
                  );
                  const pct = Math.round((Number(cat.count) / maxCount) * 100);

                  return (
                    <div key={cat.category_name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {cat.category_name}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {cat.count} articles
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Trending Articles & Author Leaderboard */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Trending Articles */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <IconFlame className="h-4 w-4 text-amber-500" />
                  Top Trending News Articles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Headline</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.top_trending_articles?.map((art, idx) => (
                      <TableRow key={art.id}>
                        <TableCell className="p-3">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-xs text-muted-foreground font-bold shrink-0 pt-0.5">
                              #{idx + 1}
                            </span>
                            <Link
                              href={`/news/${art.slug}`}
                              target="_blank"
                              className="text-xs font-medium text-foreground hover:text-primary hover:underline line-clamp-2"
                            >
                              {art.title}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-primary shrink-0">
                          {art.view_count.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Author KPI Leaderboard */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <IconAward className="h-4 w-4 text-primary" />
                  Top Journalist & Author KPI Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Journalist</TableHead>
                      <TableHead>Edition</TableHead>
                      <TableHead>Stories</TableHead>
                      <TableHead className="text-right">Impressions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authors.map((author, idx) => (
                      <TableRow key={author.author_id}>
                        <TableCell className="font-semibold text-xs flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            #{idx + 1}
                          </Badge>
                          <span>{author.display_name}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {author.bureau_name || author.tenant_name || "National Newsroom"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {author.articles}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-emerald-500">
                          {author.total_views.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
