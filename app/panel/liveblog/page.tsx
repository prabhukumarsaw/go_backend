"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconFlame,
  IconPin,
  IconSend,
  IconRefresh,
  IconTrash,
  IconClock,
  IconArticle,
  IconBroadcast,
  IconLoader2,
  IconCheck,
  IconBolt,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useStudioArticles } from "@/features/articles/hooks/use-articles";
import {
  listLiveBlogEntries,
  addLiveBlogEntry,
  deleteLiveBlogEntry,
  togglePinLiveBlogEntry,
  type LiveBlogEntry,
} from "@/lib/api/liveblog";
import { toast } from "sonner";

export default function LiveBlogStudioPage() {
  const queryClient = useQueryClient();
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [headline, setHeadline] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);

  // 1. Fetch available articles for live blogging
  const { data: articlesData, isLoading: isArticlesLoading } = useStudioArticles({
    per_page: 50,
  });
  const articles = articlesData?.data || [];

  // Automatically select the first article if none selected
  const activeArticleId =
    selectedArticleId || (articles.length > 0 ? articles[0].id : "");

  const selectedArticle = articles.find((a) => a.id === activeArticleId);

  // Real-Time SSE Stream Subscription
  useEffect(() => {
    if (!activeArticleId || typeof window === "undefined") return;

    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/v1/stream/live-blogs/${activeArticleId}`);

      es.onopen = () => {
        setSseConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.id) {
            queryClient.setQueryData(
              ["live-blog-entries", activeArticleId],
              (old: any) => {
                const existing = old?.data || [];
                if (existing.some((e: any) => e.id === data.id)) return old;
                return { ...old, data: [data, ...existing] };
              }
            );
            toast.info(`⚡ Live Wire: ${data.headline || "New ground update published"}`);
          }
        } catch {
          // Keepalive or unparseable event
        }
      };

      es.onerror = () => {
        setSseConnected(false);
      };
    } catch {
      setSseConnected(false);
    }

    return () => {
      if (es) {
        es.close();
        setSseConnected(false);
      }
    };
  }, [activeArticleId, queryClient]);

  // 2. Fetch live blog entries with auto-polling backup
  const {
    data: entriesData,
    isLoading: isEntriesLoading,
    isRefetching,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["live-blog-entries", activeArticleId],
    queryFn: () => listLiveBlogEntries(activeArticleId),
    enabled: !!activeArticleId,
    refetchInterval: autoRefresh ? 8000 : false,
  });

  const entries: LiveBlogEntry[] = entriesData?.data || [];

  // 3. Dispatch new entry mutation
  const dispatchMutation = useMutation({
    mutationFn: (payload: {
      headline?: string;
      body: string;
      is_pinned?: boolean;
      is_breaking?: boolean;
    }) => addLiveBlogEntry(activeArticleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["live-blog-entries", activeArticleId],
      });
      setHeadline("");
      setBodyText("");
      setIsPinned(false);
      setIsBreaking(false);
      toast.success("⚡ Live dispatch published to readers stream!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to dispatch live update.");
    },
  });

  // 4. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLiveBlogEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["live-blog-entries", activeArticleId],
      });
      toast.success("Live entry removed.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete entry.");
    },
  });

  // 5. Pin toggle mutation
  const pinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: number; isPinned: boolean }) =>
      togglePinLiveBlogEntry(id, isPinned),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["live-blog-entries", activeArticleId],
      });
      toast.success("Entry pin status updated.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update pin.");
    },
  });

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArticleId) {
      toast.error("Please select an article for live coverage.");
      return;
    }
    if (!bodyText.trim()) {
      toast.error("Please enter update details.");
      return;
    }

    dispatchMutation.mutate({
      headline: headline.trim() || undefined,
      body: bodyText.trim(),
      is_pinned: isPinned,
      is_breaking: isBreaking,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Blog"
        description="Post real-time updates, breaking alerts, and pinned developments."
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs bg-muted/40 px-2.5 py-1 rounded-md border">
            <Switch
              id="autorefresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="autorefresh" className="cursor-pointer text-[11px]">
              Auto-sync
            </Label>
          </div>

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
        </div>
      </PageHeader>

      {/* Target Live Coverage Article Selector Bar */}
      <Card className="shadow-xs border-primary/30 bg-card/60">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Active Live Blog Story
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={activeArticleId}
                onValueChange={(val) => setSelectedArticleId(val || "")}
              >
                <SelectTrigger className="w-[320px] sm:w-[420px] h-9 text-xs font-medium">
                  <SelectValue placeholder="Select story for live blogging..." />
                </SelectTrigger>
                <SelectContent>
                  {articles.map((art) => (
                    <SelectItem key={art.id} value={art.id} className="text-xs">
                      {art.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedArticle && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-mono"
                render={
                  <Link href={`/news/${selectedArticle.slug}`} target="_blank" />
                }
              >
                <IconBroadcast className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
                Public Live View
              </Button>
              <Badge variant="outline" className="text-xs font-mono">
                {entries.length} Live Dispatches
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: Dispatch Terminal (Left) & Live Stream Feed (Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Dispatch Composer Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-xs border-primary/20 bg-card">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <IconBolt className="h-4 w-4 text-amber-500" />
                  Dispatch Instant Update
                </span>
                {sseConnected ? (
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] text-emerald-500 border-emerald-500/30 gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE SSE SYNC ACTIVE
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] text-muted-foreground border-border gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    READY TO TRANSMIT
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleDispatch} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="headline" className="text-xs font-semibold">
                      Dispatch Headline (Optional Key Cue)
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-mono">Quick Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {[
                      { tag: "⚡ BREAKING:", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
                      { tag: "📊 KEY STAT:", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
                      { tag: "💬 QUOTE:", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
                      { tag: "🔴 GROUND REPORT:", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
                      { tag: "🏛️ OFFICIAL:", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
                    ].map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() =>
                          setHeadline((prev) =>
                            prev ? `${t.tag} ${prev.replace(/^[⚡📊💬🔴🏛️].*?:\s*/, "")}` : `${t.tag} `
                          )
                        }
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border transition-colors hover:brightness-110 cursor-pointer ${t.color}`}
                      >
                        {t.tag}
                      </button>
                    ))}
                  </div>
                  <Input
                    id="headline"
                    placeholder="e.g. Round 4: Lead increases to 14,200 votes"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="body" className="text-xs font-semibold">
                    Minute-by-Minute Update Body *
                  </Label>
                  <Textarea
                    id="body"
                    required
                    rows={6}
                    placeholder="Provide breaking context, quotes, election booth counting numbers, or official statements…"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="text-xs resize-none leading-relaxed font-sans"
                  />
                </div>

                {/* Priority Flags */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="breaking" className="text-xs font-bold flex items-center gap-1">
                        <IconFlame className="h-3.5 w-3.5 text-rose-500" /> Breaking Alert
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Red animated pulse badge
                      </p>
                    </div>
                    <Switch
                      id="breaking"
                      checked={isBreaking}
                      onCheckedChange={setIsBreaking}
                    />
                  </div>

                  <div className="flex items-center justify-between border-l pl-3">
                    <div>
                      <Label htmlFor="pin" className="text-xs font-bold flex items-center gap-1">
                        <IconPin className="h-3.5 w-3.5 text-amber-500" /> Pinned Key Event
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Sticks to top of stream
                      </p>
                    </div>
                    <Switch
                      id="pin"
                      checked={isPinned}
                      onCheckedChange={setIsPinned}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-semibold text-xs bg-primary hover:bg-primary/90 shadow-xs"
                  disabled={dispatchMutation.isPending || !bodyText.trim()}
                >
                  {dispatchMutation.isPending ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <IconSend className="mr-2 h-4 w-4" />
                  )}
                  ⚡ Transmit Live Dispatch (Push to Readers)
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Stream Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                Live Stream Feed ({entries.length} Dispatches)
              </CardTitle>
              <div className="text-[11px] font-mono text-muted-foreground">
                Chronological Real-Time Wire
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {isEntriesLoading ? (
                <LoadingState message="Connecting to live stream entries…" />
              ) : isError ? (
                <ErrorState
                  title="Failed to load stream"
                  message="Could not load live blog entries."
                  onRetry={() => refetch()}
                />
              ) : entries.length === 0 ? (
                <EmptyState
                  icon={IconBroadcast}
                  title="No live updates posted yet"
                  description="Use the dispatch terminal on the left to transmit your first minute-by-minute update."
                />
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-xl border transition-all ${
                        entry.is_pinned
                          ? "bg-amber-500/5 border-amber-500/30 shadow-xs"
                          : entry.is_breaking
                          ? "bg-rose-500/5 border-rose-500/30"
                          : "bg-card hover:bg-muted/10"
                      }`}
                    >
                      {/* Entry Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-border/50 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary flex items-center gap-1">
                            <IconClock className="h-3.5 w-3.5" />
                            {new Date(entry.created_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>

                          {entry.is_breaking && (
                            <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-mono text-[10px] px-1.5 py-0 uppercase">
                              <IconFlame className="h-3 w-3 mr-0.5" /> Breaking
                            </Badge>
                          )}

                          {entry.is_pinned && (
                            <Badge
                              variant="outline"
                              className="border-amber-500 text-amber-500 font-mono text-[10px] px-1.5 py-0"
                            >
                              <IconPin className="h-3 w-3 mr-0.5" /> Key Event
                            </Badge>
                          )}

                          <span className="text-[11px] text-muted-foreground font-mono">
                            • {entry.author_name || "Newsroom Desk"}
                          </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 text-xs ${
                              entry.is_pinned
                                ? "text-amber-500 font-bold"
                                : "text-muted-foreground"
                            }`}
                            onClick={() =>
                              pinMutation.mutate({
                                id: entry.id,
                                isPinned: !entry.is_pinned,
                              })
                            }
                            title={entry.is_pinned ? "Unpin entry" : "Pin entry"}
                          >
                            <IconPin className="h-3.5 w-3.5 mr-1" />
                            {entry.is_pinned ? "Pinned" : "Pin"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm("Delete this live update?")) {
                                deleteMutation.mutate(entry.id);
                              }
                            }}
                            title="Delete entry"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Headline */}
                      {entry.headline && (
                        <h4 className="font-bold text-sm text-foreground mb-1 leading-snug">
                          {entry.headline}
                        </h4>
                      )}

                      {/* Content */}
                      <p className="text-xs text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
                        {typeof entry.body === "string"
                          ? entry.body
                          : typeof entry.body === "object" && entry.body?.text
                          ? entry.body.text
                          : JSON.stringify(entry.body)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
