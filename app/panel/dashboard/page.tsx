"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArticle,
  IconClock,
  IconSend,
  IconPencilPlus,
  IconTrendingUp,
  IconPlus,
  IconPhoto,
  IconFolder,
  IconSettings,
  IconBroadcast,
  IconShield,
  IconUsers,
  IconSearch,
  IconTag,
  IconMessageCircle,
  IconArrowUpRight,
  IconActivity,
  IconDatabase,
  IconServer,
  IconCheck,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ArticleStatusBadge } from "@/features/articles/components/article-status-badge";
import { useStudioArticles } from "@/features/articles/hooks/use-articles";
import { useTenant } from "@/components/providers/tenant-provider";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { siteName } = useTenant();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data, isLoading, isError, refetch } = useStudioArticles({
    per_page: 50,
  });

  const articles = data?.data || [];

  // Metrics
  const totalCount = data?.pagination?.total ?? articles.length;
  const publishedCount = articles.filter((a) => a.status === "published").length;
  const draftCount = articles.filter((a) => a.status === "draft").length;
  const reviewCount = articles.filter(
    (a) => a.status === "review" || a.status === "approved"
  ).length;
  const totalViews = articles.reduce(
    (sum, a) => sum + (Number(a.view_count) || 0),
    0
  );

  const stats = [
    {
      title: "Articles",
      value: totalCount.toLocaleString(),
      description: `${publishedCount} published`,
      icon: IconArticle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Drafts",
      value: draftCount.toLocaleString(),
      description: "In progress",
      icon: IconClock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "In Review",
      value: reviewCount.toLocaleString(),
      description: "Awaiting review",
      icon: IconSend,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      description: "Article reads",
      icon: IconTrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  // Quick Action Links
  const quickActions = [
    {
      title: "New Article",
      desc: "Write and publish news",
      href: "/studio/new",
      icon: IconPencilPlus,
      color: "text-primary",
      border: "hover:border-primary/50",
      tag: "Create",
    },
    {
      title: "Live Blog",
      desc: "Live coverage updates",
      href: "/panel/liveblog",
      icon: IconBroadcast,
      color: "text-rose-500",
      border: "hover:border-rose-500/50",
      tag: "Live",
    },
    {
      title: "Media",
      desc: "Images and uploads",
      href: "/panel/media",
      icon: IconPhoto,
      color: "text-emerald-500",
      border: "hover:border-emerald-500/50",
      tag: "Files",
    },
    {
      title: "Categories",
      desc: "Sections and topics",
      href: "/panel/categories",
      icon: IconFolder,
      color: "text-sky-500",
      border: "hover:border-sky-500/50",
      tag: "Sections",
    },
    {
      title: "Team & Staff",
      desc: "Manage reporters and editors",
      href: "/panel/users",
      icon: IconUsers,
      color: "text-violet-500",
      border: "hover:border-violet-500/50",
      tag: "Team",
    },
    {
      title: "Roles & Permissions",
      desc: "Access control and privileges",
      href: "/panel/roles",
      icon: IconShield,
      color: "text-indigo-500",
      border: "hover:border-indigo-500/50",
      tag: "Security",
    },
    {
      title: "Settings",
      desc: "Site details and backups",
      href: "/panel/settings",
      icon: IconSettings,
      color: "text-amber-500",
      border: "hover:border-amber-500/50",
      tag: "System",
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading dashboard…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="Could not connect to the API. Please ensure the backend is running."
        onRetry={() => refetch()}
      />
    );
  }

  // Filtered articles
  const filteredArticles = articles.filter((a) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "review") return a.status === "review" || a.status === "approved";
    return a.status === filterStatus;
  });

  const displayedArticles = filteredArticles.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Dashboard Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl border bg-card shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              {siteName || "Newsroom"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Welcome back, <strong className="text-foreground">{user?.display_name || "Staff Member"}</strong> ({user?.email || "staff"})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" render={<Link href="/studio/new" />} className="h-8 font-medium shadow-xs">
            <IconPencilPlus className="mr-1.5 h-3.5 w-3.5" />
            New Article
          </Button>
          <Button size="sm" variant="outline" render={<Link href="/panel/liveblog" />} className="h-8">
            <IconBroadcast className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
            Live Blog
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-xs hover:border-border/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 pt-0 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Quick Actions & Recent Articles */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Quick Actions (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="p-4 pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <IconActivity className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`group flex items-center justify-between p-2.5 rounded-lg border bg-card/60 transition-all ${action.border} hover:bg-muted/40`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-8 w-8 rounded-md bg-muted/40 flex items-center justify-center shrink-0 ${action.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {action.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {action.desc}
                        </div>
                      </div>
                    </div>
                    <IconArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-foreground shrink-0 ml-2" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="shadow-xs">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <IconServer className="h-3.5 w-3.5 text-emerald-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <IconDatabase className="h-3.5 w-3.5" /> Database
                </span>
                <span className="text-emerald-500 font-medium text-[11px] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <IconActivity className="h-3.5 w-3.5" /> Background Jobs
                </span>
                <span className="text-emerald-500 font-medium text-[11px] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Recent Articles Queue (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="p-4 pb-3 border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold">
                    Recent Articles
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Latest editorial updates
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {["all", "published", "review", "draft"].map((st) => (
                    <Button
                      key={st}
                      variant={filterStatus === st ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilterStatus(st)}
                      className="h-7 px-2.5 text-xs capitalize"
                    >
                      {st}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" render={<Link href="/panel/articles" />} className="h-7 px-2.5 text-xs">
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {displayedArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-xs">
                  <IconArticle className="mb-2 h-8 w-8 opacity-30" />
                  <p className="font-medium text-foreground">No articles matching this filter.</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    render={<Link href="/studio/new" />}
                  >
                    <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                    New Article
                  </Button>
                </div>
              ) : (
                displayedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <Link
                        href={`/studio/${article.id}`}
                        className="text-sm font-semibold hover:text-primary line-clamp-1 text-foreground transition-colors"
                      >
                        {article.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="truncate max-w-[150px]">/{article.slug}</span>
                        <span>·</span>
                        <span>{article.author_name || "Author"}</span>
                        <span>·</span>
                        <span>{Number(article.view_count || 0).toLocaleString()} views</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0">
                      <ArticleStatusBadge status={article.status} />
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
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
