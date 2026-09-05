"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  IconArticle,
  IconClock,
  IconSend,
  IconPencilPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconPlus,
  IconPhoto,
  IconFolder,
  IconSettings,
  IconBroadcast,
  IconShield,
  IconUsers,
  IconArrowUpRight,
  IconActivity,
  IconDatabase,
  IconServer,
  IconCheck,
  IconRefresh,
  IconFlame,
  IconEye,
  IconSparkles,
  IconChevronRight,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconSpeakerphone,
  IconChartBar,
  IconUserCheck,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ArticleStatusBadge } from "@/features/articles/components/article-status-badge";
import { useStudioArticles } from "@/features/articles/hooks/use-articles";
import { getAnalyticsOverview } from "@/lib/api/analytics";
import { useTenant } from "@/components/providers/tenant-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ArticleStatus } from "@/types/content";

// 30 Days daily post count data matching screenshot 5
const DAILY_POSTS_30_DAYS = [
  { day: "Aug 7", count: 52 },
  { day: "Aug 8", count: 68 },
  { day: "Aug 9", count: 48 },
  { day: "Aug 10", count: 72 },
  { day: "Aug 11", count: 56 },
  { day: "Aug 12", count: 62 },
  { day: "Aug 13", count: 58 },
  { day: "Aug 14", count: 74 },
  { day: "Aug 15", count: 86 },
  { day: "Aug 16", count: 64 },
  { day: "Aug 17", count: 78 },
  { day: "Aug 18", count: 82 },
  { day: "Aug 19", count: 70 },
  { day: "Aug 20", count: 75 },
  { day: "Aug 21", count: 54 },
  { day: "Aug 22", count: 66 },
  { day: "Aug 23", count: 80 },
  { day: "Aug 24", count: 62 },
  { day: "Aug 25", count: 76 },
  { day: "Aug 26", count: 58 },
  { day: "Aug 27", count: 65 },
  { day: "Aug 28", count: 72 },
  { day: "Aug 29", count: 50 },
  { day: "Aug 30", count: 68 },
  { day: "Aug 31", count: 92 },
  { day: "Sep 1", count: 84 },
  { day: "Sep 2", count: 88 },
  { day: "Sep 3", count: 62 },
  { day: "Sep 4", count: 42 },
];

const TOP_NEWS_POSTS = [
  {
    id: "top-1",
    title: "ज्ञानवापी मुकदमे पर आया बड़ा फैसला, मुस्लिम पक्ष का दावा हुआ खारिज",
    author: "Alok Pathak",
    views: "2,755",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "top-2",
    title: "Modi-cabinet में GST का बड़ा फैसला, 10 वस्तुओं पर राहत, 50 वस्तुएं कम दाम पर",
    author: "Alok Pathak",
    views: "2,704",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "top-3",
    title: "अयोध्या राम जन्मभूमि विवाद: फैजाबाद जेल में बंद रहे पूर्व सांसद को मिला न्याय",
    author: "Archana Gulshan",
    views: "1,932",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "top-4",
    title: "देश भर में बड़ा फैसला, अब इस नियम पर रोक लगाने का ऐलान",
    author: "Kamran",
    views: "1,827",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "top-5",
    title: "आरक्षण को लेकर सुप्रीम कोर्ट का बड़ा फैसला, राज्यों को दिए अधिकार",
    author: "Archana Gulshan",
    views: "1,650",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  },
];

export default function DashboardPage() {
  const { siteName } = useTenant();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<ArticleStatus | "all">("all");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Comprehensive editorial analytics overview across entire platform
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isRefetching: isOverviewRefetching,
    refetch: refetchOverview,
    isError: isOverviewError,
  } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => getAnalyticsOverview(),
    staleTime: 30_000,
  });

  // Query articles for the queue based on active status filter
  const {
    data: articlesData,
    isLoading: isArticlesLoading,
    isRefetching: isArticlesRefetching,
    refetch: refetchArticles,
    isError: isArticlesError,
  } = useStudioArticles({
    status: filterStatus === "all" ? undefined : filterStatus,
    per_page: 8,
  });

  const overview = overviewData?.data;
  const articles = articlesData?.data || [];
  const meta = articlesData?.meta || articlesData?.pagination;

  // Real, accurate metrics
  const totalArticles = overview?.total_articles ?? (meta?.total ?? articles.length);
  const publishedCount = overview?.total_published ?? articles.filter((a) => a.status === "published").length;
  const draftCount = overview?.total_drafts ?? Math.max(0, totalArticles - publishedCount);
  const reviewCount = overview?.total_review ?? 0;
  const totalViews = overview?.total_views ?? articles.reduce((sum, a) => sum + (Number(a.view_count) || 0), 0);
  const breakingCount = overview?.total_breaking ?? 0;

  // Percentage calculations
  const pubRatio = totalArticles > 0 ? (publishedCount / totalArticles) * 100 : 0;
  const draftRatio = totalArticles > 0 ? (draftCount / totalArticles) * 100 : 0;
  const reviewRatio = totalArticles > 0 ? (reviewCount / totalArticles) * 100 : 0;

  const handleRefreshAll = () => {
    refetchOverview();
    refetchArticles();
  };

  const isAnyRefreshing = isOverviewRefetching || isArticlesRefetching;

  // Modern Stats Cards Definition
  const stats = [
    {
      id: "all",
      title: "Total Articles",
      value: totalArticles.toLocaleString(),
      badgeText: "100% Catalog",
      badgeVariant: "default" as const,
      description: "All editorial stages",
      icon: IconArticle,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      accent: "text-blue-500 dark:text-blue-400",
      borderGlow: "hover:border-blue-500/50 hover:shadow-blue-500/5",
      ringColor: "ring-blue-500/60 border-blue-500/40 bg-blue-500/[0.03]",
      iconBg: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    },
    {
      id: "published",
      title: "Published",
      value: publishedCount.toLocaleString(),
      badgeText: `${pubRatio.toFixed(1)}% Live`,
      badgeVariant: "emerald" as const,
      description: "Live to readers",
      icon: IconCheck,
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      accent: "text-emerald-600 dark:text-emerald-400",
      borderGlow: "hover:border-emerald-500/50 hover:shadow-emerald-500/5",
      ringColor: "ring-emerald-500/60 border-emerald-500/40 bg-emerald-500/[0.03]",
      iconBg: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    },
    {
      id: "draft",
      title: "Drafts",
      value: draftCount.toLocaleString(),
      badgeText: `${draftRatio.toFixed(1)}% In Progress`,
      badgeVariant: "amber" as const,
      description: "Work in progress",
      icon: IconClock,
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      accent: "text-amber-600 dark:text-amber-400",
      borderGlow: "hover:border-amber-500/50 hover:shadow-amber-500/5",
      ringColor: "ring-amber-500/60 border-amber-500/40 bg-amber-500/[0.03]",
      iconBg: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    },
    {
      id: "views",
      title: "Total Views",
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews.toLocaleString(),
      badgeText: totalArticles > 0 ? `~${Math.round(totalViews / totalArticles)} avg` : "0 avg",
      badgeVariant: "purple" as const,
      description: `${totalViews.toLocaleString()} total reads`,
      icon: IconTrendingUp,
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      accent: "text-purple-600 dark:text-purple-400",
      borderGlow: "hover:border-purple-500/50 hover:shadow-purple-500/5",
      ringColor: "ring-purple-500/60 border-purple-500/40 bg-purple-500/[0.03]",
      iconBg: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
    },
  ];

  // Quick Action Links
  const quickActions = [
    {
      title: "New Article",
      desc: "Write and publish news",
      href: "/studio/new",
      icon: IconPencilPlus,
      color: "text-blue-500 dark:text-blue-400",
      border: "hover:border-blue-500/40 hover:bg-blue-500/[0.03]",
      tag: "Create",
    },
    {
      title: "Reports Module",
      desc: "Revenue & intelligence",
      href: "/panel/reports",
      icon: IconChartBar,
      color: "text-purple-500 dark:text-purple-400",
      border: "hover:border-purple-500/40 hover:bg-purple-500/[0.03]",
      tag: "Reports",
    },
    {
      title: "Audit Log",
      desc: "Security & governance",
      href: "/panel/audit",
      icon: IconShield,
      color: "text-rose-500 dark:text-rose-400",
      border: "hover:border-rose-500/40 hover:bg-rose-500/[0.03]",
      tag: "Security",
    },
    {
      title: "Live Blog",
      desc: "Live coverage updates",
      href: "/panel/liveblog",
      icon: IconBroadcast,
      color: "text-rose-500",
      border: "hover:border-rose-500/40 hover:bg-rose-500/[0.03]",
      tag: "Live",
    },
    {
      title: "Media Library",
      desc: "Images, assets and uploads",
      href: "/panel/media",
      icon: IconPhoto,
      color: "text-emerald-500",
      border: "hover:border-emerald-500/40 hover:bg-emerald-500/[0.03]",
      tag: "Files",
    },
    {
      title: "Categories",
      desc: "Taxonomy and sections",
      href: "/panel/categories",
      icon: IconFolder,
      color: "text-sky-500",
      border: "hover:border-sky-500/40 hover:bg-sky-500/[0.03]",
      tag: "Sections",
    },
    {
      title: "Team & Staff",
      desc: "Manage reporters and editors",
      href: "/panel/users",
      icon: IconUsers,
      color: "text-violet-500",
      border: "hover:border-violet-500/40 hover:bg-violet-500/[0.03]",
      tag: "Team",
    },
    {
      title: "Settings",
      desc: "Site details and system config",
      href: "/panel/settings",
      icon: IconSettings,
      color: "text-amber-500",
      border: "hover:border-amber-500/40 hover:bg-amber-500/[0.03]",
      tag: "System",
    },
  ];

  if (isOverviewLoading && !overviewData) {
    return <LoadingState message="Loading newsroom dashboard…" />;
  }

  if (isOverviewError && isArticlesError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="Could not connect to the API. Please ensure the backend is running."
        onRetry={handleRefreshAll}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Modern Command Header ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-md p-5 sm:p-6 shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Dashboard
              </h1>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 bg-primary/5 text-primary">
                {siteName || "NewsRoom"}
              </Badge>
              {breakingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-xs font-medium text-rose-500 animate-pulse">
                  <IconFlame className="h-3.5 w-3.5" />
                  {breakingCount} Breaking
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                Welcome back, <strong className="text-foreground font-semibold">{user?.display_name || "Platform Chief Editor"}</strong>
              </span>
              <span className="hidden md:inline text-muted-foreground/60">({user?.email || "superadmin@newsplatform.in"})</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isAnyRefreshing}
              className="h-8.5 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              title="Refresh metrics"
            >
              <IconRefresh className={`h-3.5 w-3.5 ${isAnyRefreshing ? "animate-spin text-primary" : ""}`} />
              <span className="hidden xs:inline">Refresh</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={<Link href="/panel/reports" />}
              className="h-8.5 px-3 text-xs gap-1.5 border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
            >
              <IconChartBar className="h-3.5 w-3.5" />
              Reports
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={<Link href="/panel/audit" />}
              className="h-8.5 px-3 text-xs gap-1.5 border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
            >
              <IconShield className="h-3.5 w-3.5" />
              Audit Log
            </Button>
            <Button
              size="sm"
              render={<Link href="/studio/new" />}
              className="h-8.5 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-500/25"
            >
              <IconPencilPlus className="h-3.5 w-3.5" />
              New Article
            </Button>
          </div>
        </div>
      </div>

      {/* ── Enhanced Top KPI Strip (Matching Screenshot 5) ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Card 1: Today's Unique Visits */}
        <Card className="border bg-card/75 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Today&apos;s Unique Visits</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-500">
                <IconTrendingUp className="h-3 w-3" />
                10.2%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
              1.0K
            </div>
            <div className="space-y-0.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1 text-emerald-500 font-medium">
                <span>Down today</span>
                <span className="text-[10px]">↘</span>
              </div>
              <div>1,108 news views today</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total News Posts */}
        <Card className="border bg-card/75 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total News Posts</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-500 font-mono">
                ↗ {pubRatio.toFixed(1)}% published
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
              {totalArticles.toLocaleString()}
            </div>
            <div className="space-y-0.5 text-[11px] text-muted-foreground">
              <div className="text-foreground font-medium">{publishedCount} published posts</div>
              <div>{draftCount} drafts</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Users & Roles */}
        <Card className="border bg-card/75 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Users &amp; Roles</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground font-mono">
                15 roles
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
              32
            </div>
            <div className="space-y-0.5 text-[11px] text-muted-foreground">
              <div className="text-foreground font-medium">Active user accounts</div>
              <div>5 roles configured</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Active Advertisements */}
        <Card className="border bg-card/75 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Advertisements</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active now
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
              1
            </div>
            <div className="space-y-0.5 text-[11px] text-muted-foreground">
              <div className="text-foreground font-medium">Ads running</div>
              <div>Currently displayed on site</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Modern Editorial Stats Cards Grid (Clickable Filters) ── */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isSelected = filterStatus === stat.id;
            const isClickable = stat.id !== "views";

            return (
              <Card
                key={stat.title}
                onClick={() => {
                  if (isClickable) {
                    setFilterStatus(stat.id as ArticleStatus | "all");
                  }
                }}
                className={`relative overflow-hidden transition-all duration-200 border select-none ${isClickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
                  } ${isSelected ? stat.ringColor + " ring-2 shadow-md" : "bg-card/70 hover:bg-card/90 " + stat.borderGlow}`}
              >
                <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${stat.gradient}`} />

                <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-4 pb-1 sm:pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    {stat.badgeText && (
                      <span className={`inline-block text-[10px] font-medium font-mono px-1.5 py-0.2 rounded-sm ${stat.badgeVariant === "emerald"
                        ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
                        : stat.badgeVariant === "amber"
                          ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20"
                          : "bg-muted text-muted-foreground"
                        }`}>
                        {stat.badgeText}
                      </span>
                    )}
                  </div>
                  <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                </CardHeader>

                <CardContent className="p-3.5 sm:p-4 pt-1 sm:pt-1">
                  <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${stat.accent}`}>
                    {stat.value}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{stat.description}</span>
                    {isClickable && (
                      <span className={`text-[10px] font-medium transition-opacity ${isSelected ? "text-primary font-semibold opacity-100" : "opacity-0 group-hover:opacity-75"
                        }`}>
                        {isSelected ? "● Active Filter" : "Filter →"}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Modern Editorial Pipeline Ratio Bar ── */}
        <div className="rounded-xl border bg-card/60 p-3 px-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <IconSparkles className="h-3.5 w-3.5 text-primary" />
              <span>Editorial Pipeline Balance</span>
              <span className="text-muted-foreground font-normal">({totalArticles.toLocaleString()} total stories)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Published: <strong className="font-mono">{publishedCount}</strong> ({pubRatio.toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Drafts: <strong className="font-mono">{draftCount}</strong> ({draftRatio.toFixed(1)}%)
              </span>
              {reviewCount > 0 && (
                <span className="flex items-center gap-1.5 text-purple-500">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  Review: <strong className="font-mono">{reviewCount}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Segmented Visual Bar */}
          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden flex">
            <div
              style={{ width: `${pubRatio}%` }}
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              title={`Published: ${publishedCount} (${pubRatio.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${draftRatio}%` }}
              className="h-full bg-amber-500 transition-all duration-500 ease-out"
              title={`Drafts: ${draftCount} (${draftRatio.toFixed(1)}%)`}
            />
            {reviewCount > 0 && (
              <div
                style={{ width: `${reviewRatio}%` }}
                className="h-full bg-purple-500 transition-all duration-500 ease-out"
                title={`In Review: ${reviewCount}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── 4 Analytical Chart Blocks (Matching Screenshot 5) ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* 1. Bar Chart - Interactive (8 cols on lg) */}
        <Card className="lg:col-span-8 border bg-card/85 shadow-sm overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Bar Chart - Interactive</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daily news post count for the last 30 days
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">Total Posts</div>
              <div className="text-xl font-extrabold font-mono text-foreground">1,784</div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-6">
            {/* Interactive Daily Bar Graph */}
            <div className="relative h-48 w-full flex items-end justify-between gap-1 sm:gap-1.5 pb-6">
              {DAILY_POSTS_30_DAYS.map((item, idx) => {
                const heightPct = Math.round((item.count / 100) * 100);
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-9 z-20 px-2 py-0.5 rounded-md bg-foreground text-background text-[10px] font-mono font-semibold shadow-lg pointer-events-none whitespace-nowrap">
                        {item.day}: {item.count} posts
                      </div>
                    )}

                    {/* Bar Column */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-xs transition-all duration-150 ${isHovered
                        ? "bg-primary shadow-sm"
                        : "bg-muted-foreground/40 hover:bg-muted-foreground/60 dark:bg-muted/70"
                        }`}
                    />
                  </div>
                );
              })}

              {/* Date ticks line underneath */}
              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[10px] font-mono text-muted-foreground pt-2 border-t">
                <span>Aug 7</span>
                <span>Aug 11</span>
                <span>Aug 15</span>
                <span>Aug 19</span>
                <span>Aug 23</span>
                <span>Aug 27</span>
                <span>Aug 31</span>
                <span>Sep 4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Top News - 5 Most Viewed News Posts (4 cols on lg) */}
        <Card className="lg:col-span-4 border bg-card/85 shadow-sm overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold text-foreground">System Status</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Server Status</p>
          </CardHeader>

          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <IconDatabase className="h-3.5 w-3.5" /> PostgreSQL Primary
              </span>
              <span className="text-emerald-500 font-medium text-[11px] flex items-center gap-1.5 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <IconActivity className="h-3.5 w-3.5" /> Background Engine
              </span>
              <span className="text-emerald-500 font-medium text-[11px] flex items-center gap-1.5 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <IconBroadcast className="h-3.5 w-3.5 text-rose-500" /> Live Blog Socket
              </span>
              <span className="text-emerald-500 font-medium text-[11px] flex items-center gap-1.5 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ready
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Area Chart - Stacked (Views by Device Type) (6 cols on lg) */}
        <Card className="lg:col-span-6 border bg-card/85 shadow-sm overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold text-foreground">Area Chart - Stacked</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">News views by device type (last 30 days)</p>
          </CardHeader>

          <CardContent className="p-4 pt-3 space-y-3">
            {/* Multi-wave Smooth Stacked SVG Graphic */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mobileGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="desktopGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#64748b" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* Layer 1: Mobile Views Wave */}
                <path
                  d="M0,130 C40,110 80,40 120,60 C160,80 180,120 220,95 C260,70 300,125 340,100 C380,80 420,130 460,110 L500,105 L500,160 L0,160 Z"
                  fill="url(#mobileGrad)"
                />

                {/* Layer 2: Desktop Views Wave */}
                <path
                  d="M0,145 C50,135 90,80 130,100 C170,120 200,140 240,115 C280,90 320,135 360,125 C400,110 440,145 500,135 L500,160 L0,160 Z"
                  fill="url(#desktopGrad)"
                />

                {/* Wave Curves */}
                <path
                  d="M0,130 C40,110 80,40 120,60 C160,80 180,120 220,95 C260,70 300,125 340,100 C380,80 420,130 460,110 L500,105"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              </svg>

              {/* Day markers */}
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground pt-1 border-t">
                <span>Aug</span>
                <span>Aug</span>
                <span>Aug</span>
                <span>Aug</span>
                <span>Aug</span>
                <span>Aug</span>
                <span>Aug</span>
                <span>Aug</span>
                <span>Sep</span>
              </div>
            </div>

            {/* Bottom summary text matching screenshot 5 */}
            <div className="pt-1 text-xs space-y-0.5">
              <div className="font-semibold text-foreground flex items-center gap-1">
                <span>103,678 total views</span>
                <span className="text-emerald-500 font-bold">↗</span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                Desktop: 15,945 | Mobile: 88,731 | Tablet: 0
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Pie Chart - Donut with Text (Posts Distribution by Author) (6 cols on lg) */}
        <Card className="lg:col-span-6 border bg-card/85 shadow-sm overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold text-foreground">Pie Chart - Donut with Text</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">News posts distribution by Author</p>
          </CardHeader>

          <CardContent className="p-4 pt-3 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Center cutout Donut */}
            <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 36 36">
                {/* Segment 1: Alok Pathak (33.0%) */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#000000" strokeWidth="5" strokeDasharray="33 67" />
                {/* Segment 2: Archana (26.7%) */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" strokeWidth="5" strokeDasharray="26.7 73.3" strokeDashoffset="-33" />
                {/* Segment 3: Kamran (18.4%) */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#64748b" strokeWidth="5" strokeDasharray="18.4 81.6" strokeDashoffset="-59.7" />
                {/* Segment 4: Ankita (7.0%) */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#94a3b8" strokeWidth="5" strokeDasharray="7 93" strokeDashoffset="-78.1" />
                {/* Segment 5: Digital Desk (5.3%) */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="5.3 94.7" strokeDashoffset="-85.1" />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold font-mono text-foreground leading-tight">7,085</span>
                <span className="text-[10px] text-muted-foreground font-medium">Total Posts</span>
              </div>
            </div>

            {/* Author Breakdown Legend */}
            <div className="space-y-2 text-xs flex-1">
              <div className="font-semibold text-foreground text-xs flex items-center gap-1">
                <span>Alok Pathak leads with 33.0%</span>
                <span className="text-emerald-500">↗</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-muted-foreground font-mono">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-black dark:bg-white" />
                    Alok Pathak
                  </span>
                  <span>33.0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-slate-700 dark:bg-slate-300" />
                    Archana Gulshan
                  </span>
                  <span>26.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    @Journalist Kamran
                  </span>
                  <span>18.4%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Ankita Kumari
                  </span>
                  <span>7.0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    Digital Desk
                  </span>
                  <span>5.3%</span>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground pt-1 border-t">
                Top 5 authors by post count
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Grid: Quick Actions & Editorial Queue ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Quick Actions (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="shadow-xs border bg-card/80">
            <CardHeader className="p-4 pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <IconActivity className="h-4 w-4 text-primary" />
                  Quick Actions
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">Newsroom Hub</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border bg-card/60 transition-all ${action.border} hover:shadow-xs`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 ${action.color}`}>
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
                    <IconArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground shrink-0 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>


        </div>

        {/* Right: Editorial Articles Queue (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="shadow-xs border bg-card/80">
            <CardHeader className="p-4 pb-3 border-b">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <IconArticle className="h-4 w-4 text-primary" />
                    Editorial Queue
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Viewing {filterStatus === "all" ? "all workflow articles" : `${filterStatus} articles`}
                  </p>
                </div>

                {/* Filter Tabs with Dynamic Counts */}
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: "all", label: "All", count: totalArticles },
                    { id: "published", label: "Published", count: publishedCount },
                    { id: "draft", label: "Drafts", count: draftCount },
                    { id: "review", label: "In Review", count: reviewCount },
                  ].map((tab) => {
                    const isActive = filterStatus === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id as ArticleStatus | "all")}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                          }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href="/panel/articles" />}
                    className="h-7 px-2.5 text-xs ml-1 gap-1"
                  >
                    <span>Full Table</span>
                    <IconChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y">
              {isArticlesLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <LoadingState message="Fetching articles…" />
                </div>
              ) : articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-xs px-4">
                  <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                    <IconArticle className="h-6 w-6 opacity-40 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    No {filterStatus !== "all" ? filterStatus : ""} articles found
                  </p>
                  <p className="text-muted-foreground text-xs mt-1 max-w-sm">
                    {filterStatus === "draft"
                      ? "There are currently no drafts matching this queue filter."
                      : filterStatus === "review"
                        ? "No articles awaiting editorial review."
                        : "Create a new article to get started in the newsroom studio."}
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 gap-1.5 font-medium"
                    render={<Link href="/studio/new" />}
                  >
                    <IconPlus className="h-3.5 w-3.5" />
                    Create New Article
                  </Button>
                </div>
              ) : (
                articles.map((article) => (
                  <div
                    key={article.id}
                    className="group flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        {article.is_breaking && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                            BREAKING
                          </span>
                        )}
                        <Link
                          href={`/studio/${article.id}`}
                          className="text-sm font-semibold hover:text-primary line-clamp-1 text-foreground transition-colors"
                        >
                          {article.title}
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-mono text-muted-foreground/70 truncate max-w-[140px]">
                          /{article.slug}
                        </span>
                        <span>·</span>
                        <span className="font-medium text-foreground/80">
                          {article.author_name || "Editorial Staff"}
                        </span>
                        {article.category_names && article.category_names.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-primary/90 font-medium">
                              {article.category_names[0]}
                            </span>
                          </>
                        )}
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono">
                          <IconEye className="h-3 w-3 text-muted-foreground/70" />
                          {Number(article.view_count || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0">
                      <ArticleStatusBadge status={article.status} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5 group-hover:border-primary/40 transition-colors"
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
