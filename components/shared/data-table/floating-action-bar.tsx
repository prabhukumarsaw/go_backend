"use client";

import * as React from "react";
import {
  IconCheck,
  IconX,
  IconArchive,
  IconClock,
  IconDownload,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FloatingActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchStatusChange?: (status: "published" | "draft" | "archived") => Promise<void> | void;
  onBatchExport?: () => void;
  isLoading?: boolean;
}

export function FloatingActionBar({
  selectedCount,
  onClearSelection,
  onBatchStatusChange,
  onBatchExport,
  isLoading = false,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2 sm:gap-3 rounded-full border bg-card/95 backdrop-blur-md px-3 sm:px-4 py-2 shadow-2xl ring-1 ring-foreground/10 text-xs text-foreground">
        {/* Selected Counter */}
        <div className="flex items-center gap-1.5 pl-1 font-medium">
          <Badge variant="secondary" className="h-5 px-1.5 font-mono text-[11px]">
            {selectedCount}
          </Badge>
          <span className="hidden sm:inline">selected</span>
        </div>

        <div className="h-4 w-px bg-border shrink-0" />

        {/* Action Buttons */}
        {isLoading ? (
          <div className="flex items-center gap-2 px-3 text-muted-foreground text-xs font-mono">
            <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Processing…</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {onBatchStatusChange && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30"
                  onClick={() => onBatchStatusChange("published")}
                >
                  <IconCheck className="mr-1 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Publish</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30"
                  onClick={() => onBatchStatusChange("draft")}
                >
                  <IconClock className="mr-1 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">To Draft</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => onBatchStatusChange("archived")}
                >
                  <IconArchive className="mr-1 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Archive</span>
                </Button>
              </>
            )}

            {onBatchExport && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={onBatchExport}
                title="Export selected to CSV"
              >
                <IconDownload className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
        )}

        <div className="h-4 w-px bg-border shrink-0" />

        {/* Clear Selection Button */}
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClearSelection}
          title="Clear selection"
        >
          <IconX className="h-3.5 w-3.5" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>
    </div>
  );
}
