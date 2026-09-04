"use client";

import { useQuery } from "@tanstack/react-query";
import {
  IconClock,
  IconFlame,
  IconPin,
  IconBroadcast,
  IconRefresh,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listLiveBlogEntries, type LiveBlogEntry } from "@/lib/api/liveblog";

interface LiveBlogFeedProps {
  articleId: string;
}

export function LiveBlogFeed({ articleId }: LiveBlogFeedProps) {
  const { data, isRefetching, refetch } = useQuery({
    queryKey: ["public-live-blog", articleId],
    queryFn: () => listLiveBlogEntries(articleId),
    refetchInterval: 6000, // Auto-poll every 6 seconds
    enabled: !!articleId,
  });

  const entries: LiveBlogEntry[] = data?.data || [];
  const pinnedEntries = entries.filter((e) => e.is_pinned);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 my-8 not-prose">
      {/* Live Coverage Top Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <div>
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              Live Breaking Updates
            </span>
            <p className="text-[11px] text-muted-foreground">
              Minute-by-minute coverage • Auto-refreshing every 6s
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs font-mono"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <IconRefresh
            className={`h-3 w-3 mr-1 ${isRefetching ? "animate-spin" : ""}`}
          />
          Sync
        </Button>
      </div>

      {/* Pinned Key Events Box */}
      {pinnedEntries.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-xs">
          <CardHeader className="py-2.5 px-4 border-b border-amber-500/20">
            <CardTitle className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
              <IconPin className="h-3.5 w-3.5" />
              Key Developments & Official Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {pinnedEntries.map((pin) => (
              <div key={pin.id} className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="font-bold text-amber-500">
                    {new Date(pin.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                  <span>•</span>
                  <span>{pin.headline || "Key Milestone"}</span>
                </div>
                <p className="text-xs text-foreground font-medium leading-relaxed">
                  {typeof pin.body === "string"
                    ? pin.body
                    : JSON.stringify(pin.body)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Chronological Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {entries.map((entry) => (
          <div key={entry.id} className="relative group">
            {/* Timeline Pin Dot */}
            <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary shadow-xs" />

            <div
              className={`p-4 rounded-xl border transition-all ${
                entry.is_breaking
                  ? "bg-rose-500/5 border-rose-500/40"
                  : "bg-card border-border/80 shadow-xs"
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border/40 text-xs">
                <span className="font-mono font-bold text-primary flex items-center gap-1">
                  <IconClock className="h-3 w-3" />
                  {new Date(entry.created_at).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>

                {entry.is_breaking && (
                  <Badge className="bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0 uppercase">
                    <IconFlame className="h-2.5 w-2.5 mr-0.5" /> Breaking
                  </Badge>
                )}

                <span className="text-[11px] text-muted-foreground font-mono ml-auto">
                  {entry.author_name || "Editorial Desk"}
                </span>
              </div>

              {/* Headline */}
              {entry.headline && (
                <h4 className="font-bold text-sm text-foreground mb-1 leading-snug">
                  {entry.headline}
                </h4>
              )}

              {/* Body */}
              <p className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
                {typeof entry.body === "string"
                  ? entry.body
                  : JSON.stringify(entry.body)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
