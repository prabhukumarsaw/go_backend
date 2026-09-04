"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { IconFileText, IconFolders, IconLanguage, IconX, IconPlus } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArticleFormData } from "@/features/articles/schemas";
import type { Category } from "@/types/content";

interface SummaryPublishingSectionProps {
  form: UseFormReturn<ArticleFormData>;
  categories?: Category[];
}

export function SummaryPublishingSection({
  form,
  categories = [],
}: SummaryPublishingSectionProps) {
  const { register, watch, setValue } = form;

  const excerpt = watch("excerpt") || "";
  const language = watch("language") || "en";
  const categoryIds = watch("category_ids") || [];

  const isOptimalExcerpt = excerpt.length >= 120 && excerpt.length <= 180;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">
      {/* ─── Part 1: Summary / Excerpt (Left 70%) ─── */}
      <Card className="lg:col-span-7 flex flex-col border-border/70 shadow-2xs">
        <CardHeader className="p-3 pb-1.5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconFileText className="h-3.5 w-3.5 text-primary" />
              Story Summary / Excerpt
            </CardTitle>
            <span
              className={`text-[10px] font-mono ${isOptimalExcerpt
                ? "text-emerald-500 font-semibold"
                : excerpt.length > 250
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground"
                }`}
            >
              {excerpt.length} / 250 chars
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2 space-y-1.5 flex-1 flex flex-col justify-start">
          <Textarea
            placeholder="A concise, engaging overview of the story for mobile feeds, social cards, and push notifications…"
            className="min-h-[20dvh] text-sm resize-none bg-background/50 leading-relaxed border-border/60 focus-visible:ring-1 p-2"
            rows={4}
            maxLength={300}
            {...register("excerpt")}
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>💡 120–160 chars recommended for Google Discover & WhatsApp</span>
            {isOptimalExcerpt && (
              <span className="text-emerald-500 font-medium">✓ Optimal Length</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Part 2: Publishing Settings (Right 30%) ─── */}
      <Card className="lg:col-span-3 flex flex-col border-border/70 shadow-2xs">
        <CardHeader className="p-3 pb-1.5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconFolders className="h-3.5 w-3.5 text-primary" />
              Publishing Settings
            </CardTitle>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{language}</span>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2 space-y-2.5 flex-1 flex flex-col justify-start">
          {/* Language Selector */}
          <div className="space-y-1">
            <Label htmlFor="language-select" className="text-xs font-semibold flex items-center gap-1">
              <IconLanguage className="h-3 w-3 text-muted-foreground" />
              Edition Language
            </Label>
            <Select
              value={language}
              onValueChange={(val) => {
                if (val) setValue("language", val);
              }}
            >
              <SelectTrigger id="language-select" className="h-8 text-xs bg-background w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (Global)</SelectItem>
                <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories Selector */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Categories ({categoryIds.length})
              </Label>
              {categoryIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setValue("category_ids", [])}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Selected category badges */}
            {categoryIds.length > 0 && (
              <div className="flex flex-wrap gap-1 p-1.5 rounded-lg bg-muted/40 border max-h-20 overflow-y-auto">
                {categoryIds.map((cid) => {
                  const cat = categories.find((c) => c.id === cid);
                  if (!cat) return null;
                  return (
                    <Badge
                      key={cat.id}
                      variant="secondary"
                      className="text-[10px] font-medium gap-1 pl-2 pr-1 py-0.5 bg-primary/10 text-primary border border-primary/20 max-w-full truncate"
                      title={cat.path || cat.name}
                    >
                      <span className="truncate">{cat.name}</span>
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
                        <IconX className="h-2.5 w-2.5" />
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
              <SelectTrigger className="h-8 text-xs bg-background w-full">
                <SelectValue placeholder="+ Add category…" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
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

            {/* 1-Click Quick Category Suggestions */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                {categories
                  .filter((cat) => !categoryIds.includes(cat.id))
                  .slice(0, 3)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setValue("category_ids", [...categoryIds, cat.id])}
                      className="text-[10px] rounded-full border border-dashed border-border/70 px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      + {cat.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
