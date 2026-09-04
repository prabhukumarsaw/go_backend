"use client";

import * as React from "react";
import { IconBrandGoogle, IconShare, IconWorld } from "@tabler/icons-react";

interface SerpSocialPreviewProps {
  title: string;
  metaTitle?: string;
  excerpt?: string;
  metaDescription?: string;
  slug?: string;
  featuredImage?: string;
  siteName?: string;
  className?: string;
}

export function SerpSocialPreview({
  title,
  metaTitle,
  excerpt,
  metaDescription,
  slug = "breaking-news-dispatch",
  featuredImage,
  siteName = "NewsRoom",
  className = "",
}: SerpSocialPreviewProps) {
  const [activeTab, setActiveTab] = React.useState<"google" | "social">("google");

  const displayTitle = metaTitle || title || "Breaking Headline Title | " + siteName;
  const displayDescription =
    metaDescription ||
    excerpt ||
    "Read the full comprehensive news coverage and breaking developments on " + siteName + ".";
  const displaySlug = slug || "story-headline";

  const domain = siteName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".in";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* ─── Segmented Control Tab Bar (50/50 Grid - Never Overflows) ─── */}
      <div className="grid grid-cols-2 p-1 rounded-lg bg-muted/80 border border-border/50 gap-1 text-xs select-none shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("google")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all font-medium text-xs ${
            activeTab === "google"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconBrandGoogle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>Google SERP</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all font-medium text-xs ${
            activeTab === "social"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconShare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Social Card</span>
        </button>
      </div>

      {/* ─── Google SERP Preview ─── */}
      {activeTab === "google" ? (
        <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1.5 font-sans shadow-2xs">
          {/* URL & Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
              {siteName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex items-center gap-1 text-[11px] truncate">
              <span className="font-semibold text-foreground truncate">{siteName}</span>
              <span className="text-muted-foreground">›</span>
              <span className="text-muted-foreground/80 truncate">news › {displaySlug}</span>
            </div>
          </div>

          {/* Search Result Headline */}
          <p className="text-[13px] font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-2 leading-snug pt-0.5">
            {displayTitle}
          </p>

          {/* Search Snippet */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            <span className="text-[11px] text-muted-foreground/60 mr-1 font-mono">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} —
            </span>
            {displayDescription}
          </p>
        </div>
      ) : (
        /* ─── Social Media Open Graph Share Card Preview ─── */
        <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
          {/* Card Media Preview */}
          {featuredImage ? (
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredImage}
                alt="Social Card Preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-muted/40 text-muted-foreground text-xs flex-col gap-1.5 border-b border-border/40">
              <IconWorld className="h-7 w-7 opacity-30" />
              <span className="text-[11px]">No cover image uploaded</span>
            </div>
          )}

          {/* Card Meta Content */}
          <div className="p-3 space-y-1 bg-card">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              {domain}
            </p>
            <p className="font-semibold text-foreground line-clamp-1 leading-snug text-xs">
              {displayTitle}
            </p>
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
