"use client";

import { UseFormReturn } from "react-hook-form";
import {
  IconPhoto,
  IconSeo,
  IconAdjustments,
  IconFileText,
} from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SerpSocialPreview } from "./serp-social-preview";
import { useTenant } from "@/components/providers/tenant-provider";
import type { ArticleFormData } from "@/features/articles/schemas";
import type { Category } from "@/types/content";

interface StudioSidebarProps {
  form: UseFormReturn<ArticleFormData>;
  categories?: Category[];
  onOpenMediaPicker?: () => void;
  className?: string;
}

export function StudioSidebar({
  form,
  categories = [],
  onOpenMediaPicker,
  className = "",
}: StudioSidebarProps) {
  const { siteName } = useTenant();
  const { register, setValue, watch } = form;

  const isBreaking = watch("is_breaking");
  const isFeatured = watch("is_featured");
  const isNational = watch("is_national");
  const language = watch("language");
  const featuredImage = watch("featured_image");
  const categoryIds = watch("category_ids") || [];

  return (
    <aside className={`w-full lg:w-80 shrink-0 space-y-4 ${className}`}>
      <Tabs defaultValue="metadata" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metadata" className="text-xs">
            <IconAdjustments className="mr-1.5 h-3.5 w-3.5" />
            Article Details
          </TabsTrigger>
          <TabsTrigger value="seo" className="text-xs">
            <IconSeo className="mr-1.5 h-3.5 w-3.5" />
            SEO & Social
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Metadata */}
        <TabsContent value="metadata" className="space-y-4 mt-3">
          {/* Taxonomy & Language */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Publishing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-xs">
                  Language
                </Label>
                <Select
                  value={language || "en"}
                  onValueChange={(val) => setValue("language", val || "en")}
                >
                  <SelectTrigger id="language" className="h-8 text-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (EN)</SelectItem>
                    <SelectItem value="hi">Hindi (HI)</SelectItem>
                    <SelectItem value="bn">Bengali (BN)</SelectItem>
                    <SelectItem value="mr">Marathi (MR)</SelectItem>
                    <SelectItem value="ta">Tamil (TA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Categories ({categoryIds.length})</Label>
                  {categoryIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setValue("category_ids", [])}
                      className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Selected category badges */}
                {categoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-muted/40 border">
                    {categoryIds.map((cid) => {
                      const cat = categories.find((c) => c.id === cid);
                      if (!cat) return null;
                      return (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="text-[11px] font-medium gap-1 pl-2 pr-1 py-0.5 bg-primary/10 text-primary border border-primary/20 max-w-full truncate"
                          title={cat.path || cat.name}
                        >
                          <span className="truncate">{cat.path || cat.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setValue(
                                "category_ids",
                                categoryIds.filter((id) => id !== cat.id)
                              );
                            }}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors shrink-0"
                          >
                            <span className="text-[10px] leading-none font-bold">×</span>
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown to add more categories */}
                <Select
                  onValueChange={(val) => {
                    const id = Number(val);
                    if (id && !categoryIds.includes(id)) {
                      setValue("category_ids", [...categoryIds, id]);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="+ Add topic or location category..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {categories
                      .filter((cat) => !categoryIds.includes(cat.id))
                      .map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)} className="text-xs">
                          <span className={cat.level && cat.level > 1 ? "pl-2 text-muted-foreground" : "font-semibold"}>
                            {cat.path || cat.name}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              {featuredImage ? (
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setValue("featured_image", "")}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (onOpenMediaPicker) onOpenMediaPicker();
                    else {
                      const url = window.prompt("Featured image URL:");
                      if (url) setValue("featured_image", url);
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <IconPhoto className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Click to add featured image
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Summary / Excerpt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Textarea
                placeholder="A concise summary for feed and social cards…"
                className="text-xs resize-none"
                rows={3}
                {...register("excerpt")}
              />
            </CardContent>
          </Card>

          {/* Flags & Toggles */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Editorial Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Breaking News</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Highlight with top breaking alert
                  </p>
                </div>
                <Switch
                  checked={isBreaking}
                  onCheckedChange={(val) => setValue("is_breaking", val)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">Featured Story</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Pin to homepage hero section
                  </p>
                </div>
                <Switch
                  checked={isFeatured}
                  onCheckedChange={(val) => setValue("is_featured", val)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-medium">National Wire</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Broadcast on National Homepage & Top Stories
                  </p>
                </div>
                <Switch
                  checked={isNational}
                  onCheckedChange={(val) => setValue("is_national", val)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: SEO & Meta */}
        <TabsContent value="seo" className="space-y-4 mt-3">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Search Engine Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="meta_title" className="text-xs">
                  SEO Title
                </Label>
                <Input
                  id="meta_title"
                  placeholder="Custom title tag for Google…"
                  className="h-8 text-xs"
                  {...register("meta_title")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meta_description" className="text-xs">
                  Meta Description
                </Label>
                <Textarea
                  id="meta_description"
                  placeholder="Appears in search result snippets (150-160 characters recommended)…"
                  className="text-xs resize-none"
                  rows={3}
                  {...register("meta_description")}
                />
              </div>

              {/* Live SERP & Social Share Card Preview */}
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="text-xs font-medium">Search & Social Preview</Label>
                <SerpSocialPreview
                  title={watch("title") || ""}
                  metaTitle={watch("meta_title") || ""}
                  excerpt={watch("excerpt") || ""}
                  metaDescription={watch("meta_description") || ""}
                  slug={
                    watch("title")
                      ? watch("title")
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "")
                      : "article-slug"
                  }
                  featuredImage={featuredImage}
                  siteName={siteName}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
