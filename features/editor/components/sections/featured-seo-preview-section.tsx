"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  IconPhoto,
  IconSeo,
  IconEye,
  IconUpload,
  IconTrash,
  IconRefresh,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SerpSocialPreview } from "../serp-social-preview";
import { useTenant } from "@/components/providers/tenant-provider";
import type { ArticleFormData } from "@/features/articles/schemas";

interface FeaturedSeoPreviewSectionProps {
  form: UseFormReturn<ArticleFormData>;
  slug: string;
  onOpenMediaPicker?: () => void;
}

export function FeaturedSeoPreviewSection({
  form,
  slug,
  onOpenMediaPicker,
}: FeaturedSeoPreviewSectionProps) {
  const { siteName } = useTenant();
  const { register, watch, setValue } = form;

  const title = watch("title") || "";
  const excerpt = watch("excerpt") || "";
  const featuredImage = watch("featured_image") || "";
  const metaTitle = watch("meta_title") || "";
  const metaDescription = watch("meta_description") || "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-3.5 items-stretch">
      {/* ─── Part 1: Featured Image (Left 40%) ─── */}
      <Card className="lg:col-span-4 flex flex-col border-border/70 shadow-2xs">
        <CardHeader className="p-3 pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <IconPhoto className="h-3 w-3" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Cover Image
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
              16:9
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2.5 flex-1 flex flex-col justify-between space-y-2">
          {featuredImage ? (
            <div className="space-y-1.5 flex-1 flex flex-col justify-between">
              <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted group shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-full object-cover transition-transform group-hover:scale-102 duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {onOpenMediaPicker && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs gap-1 shadow-md font-medium px-2"
                      onClick={onOpenMediaPicker}
                    >
                      <IconRefresh className="h-3 w-3" />
                      Replace
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs gap-1 shadow-md font-medium px-2"
                    onClick={() => setValue("featured_image", "")}
                  >
                    <IconTrash className="h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground truncate font-mono select-all">
                {featuredImage}
              </p>
            </div>
          ) : (
            <div
              onClick={() => {
                if (onOpenMediaPicker) onOpenMediaPicker();
                else {
                  const url = window.prompt("Paste Image URL:");
                  if (url) setValue("featured_image", url);
                }
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-border/80 bg-muted/20 p-4 text-center cursor-pointer hover:bg-muted/40 hover:border-primary/50 transition-all min-h-[110px]"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
                <IconUpload className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Select cover image
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Choose from media library or paste URL
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1 border-t border-border/40 truncate">
            <IconInfoCircle className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            <span className="truncate">Recommended: 1200 × 675 px (JPG, WebP)</span>
          </div>
        </CardContent>
      </Card>

      {/* ─── Part 2: SEO Form (Center 30%) ─── */}
      <Card className="lg:col-span-3 flex flex-col border-border/70 shadow-2xs">
        <CardHeader className="p-3 pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <IconSeo className="h-3 w-3" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Search & Social Meta
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
              SEO
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2.5 flex-1 flex flex-col justify-between space-y-2.5">
          {/* Meta Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold text-muted-foreground">Search Title</Label>
              <span
                className={`text-[10px] font-mono ${
                  (metaTitle || title).length > 60
                    ? "text-destructive font-semibold"
                    : (metaTitle || title).length >= 45
                    ? "text-emerald-500 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {(metaTitle || title).length} / 60
                {(metaTitle || title).length >= 45 && (metaTitle || title).length <= 60 && " ✓"}
              </span>
            </div>
            <Input
              placeholder={title || "Custom search title…"}
              className="h-7 text-xs bg-background border-border/70"
              maxLength={70}
              {...register("meta_title")}
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold text-muted-foreground">Meta Description</Label>
              <span
                className={`text-[10px] font-mono ${
                  (metaDescription || excerpt).length > 160
                    ? "text-destructive font-semibold"
                    : (metaDescription || excerpt).length >= 120
                    ? "text-emerald-500 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {(metaDescription || excerpt).length} / 160
                {(metaDescription || excerpt).length >= 120 && (metaDescription || excerpt).length <= 160 && " ✓"}
              </span>
            </div>
            <Textarea
              placeholder={excerpt || "Summary for Google search & WhatsApp…"}
              className="text-xs resize-none bg-background leading-relaxed min-h-[58px] border-border/70 p-2"
              rows={2}
              maxLength={180}
              {...register("meta_description")}
            />
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1 border-t border-border/40 truncate">
            <IconInfoCircle className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            <span className="truncate">Keep title &lt;60 and desc &lt;160 chars</span>
          </div>
        </CardContent>
      </Card>

      {/* ─── Part 3: Live Preview (Right 30%) ─── */}
      <Card className="lg:col-span-3 flex flex-col border-border/70 shadow-2xs">
        <CardHeader className="p-3 pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <IconEye className="h-3 w-3" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Snippet Preview
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2.5 flex-1 flex flex-col justify-start">
          <SerpSocialPreview
            title={title}
            metaTitle={metaTitle}
            excerpt={excerpt}
            metaDescription={metaDescription}
            slug={slug}
            featuredImage={featuredImage}
            siteName={siteName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
