"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconLayoutColumns,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { ColumnLayout } from "../../extensions/columns-node";

interface ColumnLayoutPopoverProps {
  editor: Editor;
}

const LAYOUT_PRESETS: {
  id: ColumnLayout;
  label: string;
  description: string;
  gridTemplate: string;
  bars: number[];
}[] = [
  {
    id: "2-equal",
    label: "2 Columns (50 / 50)",
    description: "Equal two-column side-by-side split",
    gridTemplate: "1fr 1fr",
    bars: [50, 50],
  },
  {
    id: "25-75",
    label: "2 Columns (25 / 75)",
    description: "Left sidebar with wide main content",
    gridTemplate: "1fr 3fr",
    bars: [25, 75],
  },
  {
    id: "75-25",
    label: "2 Columns (75 / 25)",
    description: "Wide main story with right sidebar",
    gridTemplate: "3fr 1fr",
    bars: [75, 25],
  },
  {
    id: "3-equal",
    label: "3 Columns (33 / 33 / 33)",
    description: "Three equal columns for news summaries",
    gridTemplate: "1fr 1fr 1fr",
    bars: [33, 33, 33],
  },
  {
    id: "25-50-25",
    label: "3 Columns (25 / 50 / 25)",
    description: "Featured center story with dual sidebars",
    gridTemplate: "1fr 2fr 1fr",
    bars: [25, 50, 25],
  },
];

export function ColumnLayoutPopover({ editor }: ColumnLayoutPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isInColumns = editor.isActive("columns");

  const handleSelectLayout = (layout: ColumnLayout) => {
    editor.chain().focus().insertColumns(layout).run();
    setIsOpen(false);
  };

  const handleDeleteColumns = () => {
    editor.chain().focus().deleteColumns().run();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium transition-colors shrink-0 ${
          isInColumns
            ? "bg-muted text-primary"
            : "hover:bg-muted hover:text-foreground text-muted-foreground"
        }`}
        title="Column Layouts (2-col, 25/75, 3-col)"
      >
        <IconLayoutColumns className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-2.5 shadow-xl rounded-xl" align="start">
        <div className="flex items-center justify-between pb-1 border-b">
          <p className="text-xs font-semibold">Column Layouts</p>
          {isInColumns && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-1.5 text-destructive hover:bg-destructive/10 gap-1"
              onClick={handleDeleteColumns}
            >
              <IconTrash className="h-3 w-3" />
              Remove Columns
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectLayout(preset.id)}
              className="w-full flex flex-col gap-1 p-2 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {preset.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {preset.bars.join(" / ")}%
                </span>
              </div>

              {/* Visual preview bar */}
              <div className="flex gap-1 h-3 w-full rounded bg-muted/40 p-0.5 overflow-hidden">
                {preset.bars.map((bar, i) => (
                  <div
                    key={i}
                    className="h-full rounded-xs bg-primary/25 group-hover:bg-primary/50 transition-colors"
                    style={{ width: `${bar}%` }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
