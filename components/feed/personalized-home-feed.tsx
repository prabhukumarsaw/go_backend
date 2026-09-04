"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  IconBolt,
  IconStar,
  IconTrendingUp,
  IconSparkles,
  IconMapPin,
  IconClock,
  IconArrowRight,
  IconFlame,
  IconUserCheck,
  IconBroadcast,
  IconNews,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useFeedPersonalization } from "@/lib/hooks/use-feed-personalization";
import type { ArticleListItem } from "@/types/content";

interface PersonalizedHomeFeedProps {
  initialBreaking: ArticleListItem[];
  initialFeatured: ArticleListItem[];
  initialTrending: ArticleListItem[];
  initialLatest: ArticleListItem[];
  initialStateNews?: ArticleListItem[];
}

export function PersonalizedHomeFeed({
  initialBreaking,
  initialFeatured,
  initialTrending,
  initialLatest,
  initialStateNews = [],
}: PersonalizedHomeFeedProps) {
  const { rankPersonalizedArticles, trackArticleRead } = useFeedPersonalization();
  const [activeTab, setActiveTab] = useState<string>("spotlight");

  const breakingHeadline = initialBreaking.length > 0 ? initialBreaking[0] : null;
  const primaryFeatured = initialFeatured.length > 0 ? initialFeatured[0] : initialLatest[0] || null;
  const secondaryFeatured = initialFeatured.slice(1, 3);

  // Compute YouTube-style algorithmic personalized feed
  const personalizedArticles = useMemo(() => {
    const allPool = [...initialFeatured, ...initialLatest, ...initialTrending, ...initialStateNews];
    // Deduplicate pool
    const uniqueMap = new Map<string, ArticleListItem>();
    allPool.forEach((item) => {
      if (item && item.id) uniqueMap.set(item.id, item);
    });
    return rankPersonalizedArticles(Array.from(uniqueMap.values())).slice(0, 9);
  }, [initialFeatured, initialLatest, initialTrending, initialStateNews, rankPersonalizedArticles]);

  return (
    <div className="space-y-10">
      {/* ─── 1. Live Breaking News Marquee Ticker ─── */}
      <section className="animate-fade-in-up">
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2.5 shadow-xs">
          <Badge
            variant="destructive"
            className="shrink-0 animate-pulse gap-1 text-[11px] font-mono uppercase bg-rose-600 font-bold"
          >
            <IconBolt className="h-3 w-3" />
            Breaking
          </Badge>

          {breakingHeadline ? (
            <Link
              href={`/news/${breakingHeadline.slug}`}
              onClick={() => trackArticleRead(breakingHeadline.id, breakingHeadline.category_names)}
              className="truncate text-sm font-medium hover:underline text-foreground flex-1 flex items-center gap-2"
            >
              <span>{breakingHeadline.title}</span>
              {breakingHeadline.category_names?.[0] && (
                <Badge variant="outline" className="text-[10px] hidden sm:inline-flex font-mono py-0">
                  {breakingHeadline.category_names[0]}
                </Badge>
              )}
            </Link>
          ) : (
            <p className="truncate text-xs sm:text-sm text-muted-foreground flex-1">
              National Editorial Wire is active. Verified breaking updates will flash here instantly.
            </p>
          )}

          <span className="text-[11px] font-mono text-muted-foreground hidden md:inline shrink-0">
            Live Stream
          </span>
        </div>
      </section>

      {/* ─── 2. Personalized Feed Navigation Tabs & State Ribbon ─── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto h-9 bg-muted/60 p-1">
            <TabsTrigger value="spotlight" className="text-xs font-semibold gap-1.5 px-3">
              <IconFlame className="h-3.5 w-3.5 text-amber-500" />
              Top Stories
            </TabsTrigger>
            <TabsTrigger value="state" className="text-xs font-semibold gap-1.5 px-3">
              <IconMapPin className="h-3.5 w-3.5 text-rose-500" />
              State Wire
            </TabsTrigger>
            <TabsTrigger value="foryou" className="text-xs font-semibold gap-1.5 px-3">
              <IconSparkles className="h-3.5 w-3.5 text-primary" />
              For You
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Edition Indicator Chip */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-auto bg-card border rounded-lg px-3 py-1.5 shadow-xs">
          <IconMapPin className="h-3.5 w-3.5 text-rose-500" />
          <span className="font-mono text-[11px]">Region:</span>
          <span className="font-bold text-foreground text-xs">National & All States</span>
        </div>
      </section>

      {/* ─── 3. TAB CONTENT: Spotlight & Top Stories ─── */}
      {activeTab === "spotlight" && (
        <section className="grid gap-6 lg:grid-cols-3 animate-fade-in-up">
          {/* Main Hero Spotlight Article */}
          <div className="lg:col-span-2">
            {primaryFeatured ? (
              <Card className="group relative overflow-hidden border bg-card hover:shadow-xl transition-all flex flex-col justify-end min-h-[440px] rounded-2xl">
                {primaryFeatured.featured_image && (
                  <div className="absolute inset-0 z-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryFeatured.featured_image}
                      alt={primaryFeatured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
                  </div>
                )}
                <CardContent className="relative z-10 p-6 sm:p-8 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1 bg-white/20 text-white backdrop-blur-md border-0 text-xs font-bold">
                      <IconStar className="h-3 w-3 text-amber-400 fill-amber-400" />
                      Lead Story
                    </Badge>
                    {primaryFeatured.category_names?.[0] && (
                      <Badge variant="outline" className="text-white/90 border-white/40 text-xs font-medium">
                        {primaryFeatured.category_names[0]}
                      </Badge>
                    )}
                  </div>

                  <Link
                    href={`/news/${primaryFeatured.slug}`}
                    onClick={() => trackArticleRead(primaryFeatured.id, primaryFeatured.category_names)}
                  >
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white hover:underline leading-tight font-serif">
                      {primaryFeatured.title}
                    </h2>
                  </Link>

                  {primaryFeatured.excerpt && (
                    <p className="max-w-xl text-sm text-white/80 line-clamp-2 leading-relaxed">
                      {primaryFeatured.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-white/70 pt-2 font-mono">
                    <span>{primaryFeatured.author_name || "Bureau Chief"}</span>
                    <span>·</span>
                    <time>
                      {primaryFeatured.published_at
                        ? format(new Date(primaryFeatured.published_at), "MMMM d, yyyy")
                        : "Just now"}
                    </time>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex min-h-[440px] flex-col justify-end p-8 border bg-muted/40 rounded-2xl">
                <Badge variant="secondary" className="mb-3 w-fit">
                  Lead Story
                </Badge>
                <h2 className="text-display max-w-xl text-foreground font-serif">
                  Welcome to NewsRoom Editorial
                </h2>
                <p className="mt-2 max-w-lg text-body text-muted-foreground">
                  Stories published and flagged as &apos;Featured&apos; in the Studio will be spotlighted here.
                </p>
              </Card>
            )}
          </div>

          {/* Secondary Spotlight Stack */}
          <div className="flex flex-col gap-4">
            {secondaryFeatured.map((article, idx) => (
              <Card
                key={article.id || idx}
                className="group border bg-card hover:shadow-md transition-all rounded-xl flex-1 flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {article.category_names?.[0] || "National"}
                    </Badge>
                    <span className="font-mono text-[11px]">
                      {article.published_at ? format(new Date(article.published_at), "MMM d") : "Today"}
                    </span>
                  </div>
                  <Link
                    href={`/news/${article.slug}`}
                    onClick={() => trackArticleRead(article.id, article.category_names)}
                  >
                    <h3 className="font-bold leading-snug line-clamp-2 hover:underline text-sm font-serif">
                      {article.title}
                    </h3>
                  </Link>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {secondaryFeatured.length === 0 &&
              initialLatest.slice(0, 2).map((article, idx) => (
                <Card
                  key={article.id || idx}
                  className="group border bg-card hover:shadow-md transition-all rounded-xl flex-1 flex flex-col justify-between"
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {article.category_names?.[0] || "News"}
                      </Badge>
                      <span className="font-mono text-[11px]">
                        {article.published_at ? format(new Date(article.published_at), "MMM d") : "Recent"}
                      </span>
                    </div>
                    <Link
                      href={`/news/${article.slug}`}
                      onClick={() => trackArticleRead(article.id, article.category_names)}
                    >
                      <h3 className="font-bold leading-snug line-clamp-2 hover:underline text-sm font-serif">
                        {article.title}
                      </h3>
                    </Link>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      )}

      {/* ─── 3B. TAB CONTENT: State Wire Edition ─── */}
      {activeTab === "state" && (
        <section className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                <IconMapPin className="h-5 w-5 text-rose-500" />
                National & Regional Bureau
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hyperlocal reporting, state governance, and district dispatches.
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {initialStateNews.length || initialLatest.length} stories
            </Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(initialStateNews.length > 0 ? initialStateNews : initialLatest.slice(0, 6)).map((article) => (
              <Card key={article.id} className="group overflow-hidden border bg-card hover:shadow-md transition-all flex flex-col rounded-xl">
                {article.featured_image && (
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col justify-between p-5 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {article.category_names?.[0] || "State"}
                      </Badge>
                      <span>·</span>
                      <time className="font-mono text-[11px]">
                        {article.published_at ? format(new Date(article.published_at), "MMM d") : "Recent"}
                      </time>
                    </div>
                    <Link
                      href={`/news/${article.slug}`}
                      onClick={() => trackArticleRead(article.id, article.category_names)}
                    >
                      <h3 className="font-bold leading-snug line-clamp-2 hover:underline text-sm font-serif">
                        {article.title}
                      </h3>
                    </Link>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-3 font-mono">
                    <span>{article.author_name || "Bureau Reporter"}</span>
                    <span>{(article.view_count || 0).toLocaleString()} reads</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ─── 3C. TAB CONTENT: For You (YouTube-Style Algorithmic Stream) ─── */}
      {activeTab === "foryou" && (
        <section className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                <IconSparkles className="h-5 w-5 text-primary" />
                Personalized Feed For You
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tailored dynamically based on your reading interests and topic affinity.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs font-mono gap-1">
              <IconUserCheck className="h-3 w-3" />
              Smart Ranked
            </Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {personalizedArticles.map((article) => (
              <Card key={article.id} className="group overflow-hidden border bg-card hover:shadow-md transition-all flex flex-col rounded-xl">
                {article.featured_image && (
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col justify-between p-5 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {article.category_names?.[0] || "Recommended"}
                      </Badge>
                      <span>·</span>
                      <time className="font-mono text-[11px]">
                        {article.published_at ? format(new Date(article.published_at), "MMM d") : "Recent"}
                      </time>
                    </div>
                    <Link
                      href={`/news/${article.slug}`}
                      onClick={() => trackArticleRead(article.id, article.category_names)}
                    >
                      <h3 className="font-bold leading-snug line-clamp-2 hover:underline text-sm font-serif">
                        {article.title}
                      </h3>
                    </Link>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-3 font-mono">
                    <span>{article.author_name || "Special Correspondent"}</span>
                    <span>{(article.view_count || 0).toLocaleString()} reads</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ─── 4. Trending Stories (Numbered 01 to 04) ─── */}
      {initialTrending.length > 0 && (
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold font-serif">Trending Nationwide</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Top 4 Reads</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {initialTrending.slice(0, 4).map((article, i) => (
              <Card
                key={article.id}
                className="group border bg-card hover:shadow-md transition-all rounded-xl"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-3xl font-extrabold font-serif text-muted-foreground/25 group-hover:text-primary transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/news/${article.slug}`}
                      onClick={() => trackArticleRead(article.id, article.category_names)}
                    >
                      <h3 className="mt-2 text-sm font-bold line-clamp-2 hover:underline font-serif leading-snug">
                        {article.title}
                      </h3>
                    </Link>
                  </div>
                  <p className="mt-4 text-[11px] text-muted-foreground font-mono flex items-center justify-between border-t pt-2">
                    <span>{article.category_names?.[0] || "Trending"}</span>
                    <span>{(article.view_count || 0).toLocaleString()} views</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ─── 5. Latest Editorial Wire ─── */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <IconNews className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold font-serif">Latest Editorial Wire</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-semibold" render={<Link href="/politics" />}>
            All Categories <IconArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialLatest.map((article) => (
            <Card
              key={article.id}
              className="group overflow-hidden border bg-card hover:shadow-md transition-all flex flex-col rounded-xl"
            >
              {article.featured_image ? (
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted/40 border-b flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/50 uppercase tracking-widest font-mono">
                    {article.category_names?.[0] || "NewsRoom"}
                  </span>
                </div>
              )}
              <CardContent className="flex flex-1 flex-col justify-between p-5 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {article.category_names?.[0] || "General"}
                    </Badge>
                    <span>·</span>
                    <time className="font-mono text-[11px]">
                      {article.published_at ? format(new Date(article.published_at), "MMM d") : "Recent"}
                    </time>
                  </div>
                  <Link
                    href={`/news/${article.slug}`}
                    onClick={() => trackArticleRead(article.id, article.category_names)}
                  >
                    <h3 className="font-bold leading-snug line-clamp-2 hover:underline text-sm font-serif">
                      {article.title}
                    </h3>
                  </Link>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-3 font-mono">
                  <span>{article.author_name || "Bureau"}</span>
                  <span>{(article.view_count || 0).toLocaleString()} reads</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
