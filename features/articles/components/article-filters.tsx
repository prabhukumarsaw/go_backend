"use client";

import { IconSearch, IconX } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useArticleFilters } from "../hooks/use-article-filters";

interface ArticleFiltersProps {
  categories?: { id: number; name: string; slug: string }[];
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function ArticleFilters({ categories = [] }: ArticleFiltersProps) {
  const {
    search,
    setSearch,
    status,
    setStatus,
    category,
    setCategory,
    resetFilters,
  } = useArticleFilters();

  const hasActiveFilters = search || status !== "all" || category !== "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Status filter */}
        <Select value={status} onValueChange={(val) => setStatus(val || "all")}>
          <SelectTrigger className="h-8 w-[135px] text-xs">
            <SelectValue placeholder="All Statuses">
              {(val) => STATUS_OPTIONS.find((s) => s.value === val)?.label ?? "All Statuses"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent side="bottom" align="start">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category filter */}
        {categories.length > 0 && (
          <Select value={category} onValueChange={(val) => setCategory(val || "all")}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="All Categories">
                {(val) =>
                  val === "all"
                    ? "All Categories"
                    : categories.find((c) => c.slug === val)?.name ?? "All Categories"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Reset filter */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <IconX className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
