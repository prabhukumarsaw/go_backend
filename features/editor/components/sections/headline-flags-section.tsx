"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  IconFlame,
  IconStar,
  IconWorld,
  IconSparkles,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ArticleFormData } from "@/features/articles/schemas";

interface HeadlineFlagsSectionProps {
  form: UseFormReturn<ArticleFormData>;
  slug: string;
}

export function HeadlineFlagsSection({ form, slug }: HeadlineFlagsSectionProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const [copied, setCopied] = React.useState(false);

  const title = watch("title") || "";
  const isBreaking = watch("is_breaking") || false;
  const isFeatured = watch("is_featured") || false;
  const isNational = watch("is_national") || false;

  const charCount = title.length;
  const wordCount = title.trim() ? title.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleCopySlug = () => {
    if (!slug) return;
    navigator.clipboard.writeText(`/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
      {/* ─── Part 1: Headline & Slug (Left 70%) ─── */}
      <Card className="lg:col-span-7 flex flex-col border-border/70 shadow-2xs">
        <CardHeader className="p-3 pb-1.5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconSparkles className="h-3.5 w-3.5 text-primary" />
              Article Headline
            </CardTitle>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span>{charCount} chars</span>
              <span>·</span>
              <span>{wordCount} words</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2 space-y-2 flex-1 flex flex-col justify-start">
          <div className="space-y-1">
            <textarea
              placeholder="Write a clear, compelling headline for this story…"
              className="w-full resize-none border-0 bg-transparent p-0 text-base sm:text-lg font-semibold tracking-tight shadow-none placeholder:text-muted-foreground/35 focus:outline-none focus-visible:ring-0 text-foreground leading-snug min-h-[38px] max-h-[110px]"
              rows={1}
              onInput={(e) => {
                // Auto-expand textarea as text grows
                const target = e.currentTarget;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
              {...register("title", { required: "Headline is required" })}
            />
            {errors.title && (
              <p className="text-xs font-medium text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shrink-0">
                slug
              </span>
              <span className="font-mono text-xs text-muted-foreground/70 truncate select-all">
                /{slug || "untitled-article"}
              </span>
            </div>

            {slug && (
              <button
                type="button"
                onClick={handleCopySlug}
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-mono transition-colors shrink-0 px-1.5 py-0.5 rounded hover:bg-muted"
                title="Copy slug path"
              >
                {copied ? (
                  <>
                    <IconCheck className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Part 2: Interactive Editorial Flag Pills (Right 30%) ─── */}
      <Card className="lg:col-span-3 flex flex-col border-border/70 shadow-2xs">
        <CardHeader className="p-3 pb-1.5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Editorial Flags
            </CardTitle>
            <span className="text-[10px] font-mono text-muted-foreground">
              {[isBreaking, isFeatured, isNational].filter(Boolean).length} Active
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2 space-y-1.5 flex-1 flex flex-col justify-center">
          {/* Breaking News Flag Pill */}
          <button
            type="button"
            onClick={() => setValue("is_breaking", !isBreaking)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all select-none ${
              isBreaking
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 ring-1 ring-red-500/20 shadow-2xs font-semibold"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground border-border/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <IconFlame className={`h-4 w-4 ${isBreaking ? "text-red-500 animate-pulse" : "opacity-50"}`} />
              <span>Breaking Alert</span>
            </span>
            <Badge
              variant={isBreaking ? "default" : "outline"}
              className={`text-[9px] font-mono h-4 px-1.5 ${
                isBreaking ? "bg-red-500 hover:bg-red-500 text-white" : "text-muted-foreground/60 border-border/50"
              }`}
            >
              {isBreaking ? "ON" : "OFF"}
            </Badge>
          </button>

          {/* Featured Story Flag Pill */}
          <button
            type="button"
            onClick={() => setValue("is_featured", !isFeatured)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all select-none ${
              isFeatured
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 ring-1 ring-amber-500/20 shadow-2xs font-semibold"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground border-border/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <IconStar className={`h-4 w-4 ${isFeatured ? "text-amber-500 fill-amber-500/20" : "opacity-50"}`} />
              <span>Featured Story</span>
            </span>
            <Badge
              variant={isFeatured ? "default" : "outline"}
              className={`text-[9px] font-mono h-4 px-1.5 ${
                isFeatured ? "bg-amber-500 hover:bg-amber-500 text-white" : "text-muted-foreground/60 border-border/50"
              }`}
            >
              {isFeatured ? "ON" : "OFF"}
            </Badge>
          </button>

          {/* National Importance Flag Pill */}
          <button
            type="button"
            onClick={() => setValue("is_national", !isNational)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all select-none ${
              isNational
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 ring-1 ring-blue-500/20 shadow-2xs font-semibold"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground border-border/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <IconWorld className={`h-4 w-4 ${isNational ? "text-blue-500" : "opacity-50"}`} />
              <span>National Wire</span>
            </span>
            <Badge
              variant={isNational ? "default" : "outline"}
              className={`text-[9px] font-mono h-4 px-1.5 ${
                isNational ? "bg-blue-500 hover:bg-blue-500 text-white" : "text-muted-foreground/60 border-border/50"
              }`}
            >
              {isNational ? "ON" : "OFF"}
            </Badge>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
