import Link from "next/link";
import {
  IconSearch,
  IconHome,
  IconArrowRight,
  IconCompass,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listCategories, listTrendingNews } from "@/lib/api/articles";
import { siteConfig } from "@/config/site";

export default async function NotFound() {
  let categories: any[] = [];
  let trending: any[] = [];

  try {
    const [catRes, trendRes] = await Promise.allSettled([
      listCategories(),
      listTrendingNews(4),
    ]);
    if (catRes.status === "fulfilled" && catRes.value?.data) {
      categories = catRes.value.data;
    }
    if (trendRes.status === "fulfilled" && trendRes.value?.data) {
      trending = trendRes.value.data;
    }
  } catch {
    // Graceful offline fallback
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-12">
      {/* 404 Hero */}
      <div className="space-y-4">
        <span className="text-6xl sm:text-8xl font-black font-serif text-muted-foreground/30">
          404
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-foreground">
          Page or Section Not Found
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
          The page or news section you requested does not exist or may have been
          moved. Explore popular news categories or trending stories below.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button render={<Link href="/" />}>
            <IconHome className="mr-1.5 h-4 w-4" />
            Go to Homepage
          </Button>
          <Button variant="outline" render={<Link href="/search" />}>
            <IconSearch className="mr-1.5 h-4 w-4" />
            Search Newsroom
          </Button>
        </div>
      </div>

      {/* Explore Active Categories */}
      {categories.length > 0 && (
        <div className="rounded-xl border bg-card p-6 sm:p-8 space-y-4 text-left">
          <div className="flex items-center gap-2">
            <IconCompass className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold font-serif">
              Explore Active News Sections
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${cat.slug}`}>
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer capitalize"
                >
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Stories */}
      {trending.length > 0 && (
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2 border-b pb-2">
            <IconTrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold font-serif">Trending Stories</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {trending.map((article, i) => (
              <Card
                key={article.id}
                className="group border bg-card hover:shadow-md transition-all"
              >
                <CardContent className="p-4 flex gap-3 items-start">
                  <span className="text-2xl font-bold font-serif text-muted-foreground/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-1">
                    <Link href={`/news/${article.slug}`}>
                      <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 hover:underline">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {(article.view_count || 0).toLocaleString()} views
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
