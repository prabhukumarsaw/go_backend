"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconRowInsertBottom,
  IconRowInsertTop,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconTrash,
  IconPalette,
  IconTable,
  IconLayoutRows,
  IconColumns,
  IconAlignBoxLeftTop,
  IconAlignBoxLeftMiddle,
  IconAlignBoxLeftBottom,
  IconAlignCenter,
  IconCirclesRelation,
  IconChevronDown,
  IconArrowsHorizontal,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TableContextMenuProps {
  editor: Editor;
  children?: React.ReactNode;
}

const CELL_BG_COLORS = [
  { label: "Default", value: "" },
  { label: "Soft Gray", value: "rgba(120, 120, 120, 0.12)" },
  { label: "Soft Blue", value: "rgba(59, 130, 246, 0.15)" },
  { label: "Soft Green", value: "rgba(16, 185, 129, 0.15)" },
  { label: "Soft Amber", value: "rgba(245, 158, 11, 0.15)" },
  { label: "Soft Red", value: "rgba(239, 68, 68, 0.15)" },
  { label: "Soft Purple", value: "rgba(168, 85, 247, 0.15)" },
];

export function TableContextMenu({ editor, children }: TableContextMenuProps) {
  if (!editor.isActive("table")) return null;

  const handleSetCellBg = (color: string) => {
    editor.chain().focus().setCellAttribute("backgroundColor", color).run();
  };

  const handleSetVerticalAlign = (align: "top" | "middle" | "bottom") => {
    editor.chain().focus().setCellAttribute("verticalAlign", align).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        children ? (
          (children as any)
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 text-[10px] gap-1 font-semibold text-primary px-2 shadow-2xs hover:bg-muted"
          >
            <IconTable className="h-3 w-3" />
            <span>Table Options</span>
            <IconChevronDown className="h-2.5 w-2.5 opacity-70" />
          </Button>
        )
      } />
      <DropdownMenuContent align="start" className="w-56 text-xs p-1 shadow-xl">
        {/* ─── Cell Background Color ─── */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 text-xs">
            <IconPalette className="h-3.5 w-3.5 text-muted-foreground" />
            Background color
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-40 p-1">
            {CELL_BG_COLORS.map((c) => (
              <DropdownMenuItem
                key={c.label}
                onClick={() => handleSetCellBg(c.value)}
                className="gap-2 text-xs cursor-pointer"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border/80"
                  style={{ backgroundColor: c.value || "transparent" }}
                />
                <span>{c.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* ─── Cell Vertical Alignment ─── */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 text-xs">
            <IconAlignCenter className="h-3.5 w-3.5 text-muted-foreground" />
            Vertical align
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-36 p-1">
            <DropdownMenuItem
              onClick={() => handleSetVerticalAlign("top")}
              className="gap-2 text-xs cursor-pointer"
            >
              <IconAlignBoxLeftTop className="h-3.5 w-3.5" />
              Top
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSetVerticalAlign("middle")}
              className="gap-2 text-xs cursor-pointer"
            >
              <IconAlignBoxLeftMiddle className="h-3.5 w-3.5" />
              Middle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSetVerticalAlign("bottom")}
              className="gap-2 text-xs cursor-pointer"
            >
              <IconAlignBoxLeftBottom className="h-3.5 w-3.5" />
              Bottom
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* ─── Header Toggles (Freeze) ─── */}
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          className="gap-2 text-xs cursor-pointer"
        >
          <IconLayoutRows className="h-3.5 w-3.5 text-muted-foreground" />
          Toggle First Row Freeze
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          className="gap-2 text-xs cursor-pointer"
        >
          <IconColumns className="h-3.5 w-3.5 text-muted-foreground" />
          Toggle First Column Freeze
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ─── Row Operations ─── */}
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className="gap-2 text-xs cursor-pointer"
        >
          <IconRowInsertTop className="h-3.5 w-3.5 text-muted-foreground" />
          Insert row above
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="gap-2 text-xs cursor-pointer"
        >
          <IconRowInsertBottom className="h-3.5 w-3.5 text-muted-foreground" />
          Insert row below
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ─── Column Operations ─── */}
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className="gap-2 text-xs cursor-pointer"
        >
          <IconColumnInsertLeft className="h-3.5 w-3.5 text-muted-foreground" />
          Insert column left
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="gap-2 text-xs cursor-pointer"
        >
          <IconColumnInsertRight className="h-3.5 w-3.5 text-muted-foreground" />
          Insert column right
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ─── Merge / Split Cells ─── */}
        <DropdownMenuItem
          onClick={() => editor.chain().focus().mergeOrSplit().run()}
          className="gap-2 text-xs cursor-pointer"
        >
          <IconCirclesRelation className="h-3.5 w-3.5 text-muted-foreground" />
          Merge or Split Cells
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ─── Deletion Operations ─── */}
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteRow().run()}
          className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
        >
          <IconTrash className="h-3.5 w-3.5" />
          Delete row
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
        >
          <IconTrash className="h-3.5 w-3.5" />
          Delete column
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteTable().run()}
          className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive font-semibold"
        >
          <IconTrash className="h-3.5 w-3.5" />
          Delete table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
