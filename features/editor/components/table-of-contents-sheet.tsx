"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconListDetails,
  IconHash,
  IconArrowRight,
  IconFileText,
  IconSearch,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
  pos: number;
}

export function TableOfContentsSheet({
  editor,
  variant = "toolbar",
}: {
  editor: Editor;
  variant?: "toolbar" | "statusbar";
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [headings, setHeadings] = React.useState<HeadingItem[]>([]);

  // Scan headings from editor document
  const extractHeadings = React.useCallback(() => {
    if (!editor || editor.isDestroyed) return [];
    const items: HeadingItem[] = [];

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        const text = node.textContent.trim();
        items.push({
          id: `h-${pos}`,
          text: text || `Untitled H${node.attrs.level}`,
          level: node.attrs.level,
          pos,
        });
      }
    });

    return items;
  }, [editor]);

  React.useEffect(() => {
    setHeadings(extractHeadings());

    const handleUpdate = () => {
      setHeadings(extractHeadings());
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, extractHeadings]);

  const handleJump = (pos: number) => {
    editor.chain().focus().setTextSelection(pos).scrollIntoView().run();
    setIsOpen(false);
  };

  const filteredHeadings = headings.filter((h) =>
    h.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={
          variant === "statusbar"
            ? "flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-muted/80 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            : "inline-flex items-center justify-center gap-1 h-7 px-2 rounded-md text-xs font-medium hover:bg-muted text-foreground transition-colors shrink-0 cursor-pointer"
        }
        title="Document Outline & Table of Contents"
      >
        <IconListDetails className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-[11px]">
          {headings.length} {headings.length === 1 ? "Section" : "Sections"}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-lg border-border/80" align="end">
        {/* Header */}
        <div className="p-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconListDetails className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Article Outline</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {headings.length} headings
            </Badge>
          </div>
          {headings.length > 4 && (
            <div className="mt-2 relative">
              <IconSearch className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input
                className="h-7 text-xs pl-7"
                placeholder="Filter sections…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Headings List */}
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
          {headings.length === 0 ? (
            <div className="py-6 px-4 text-center">
              <IconFileText className="mx-auto h-7 w-7 text-muted-foreground/40 mb-1.5" />
              <p className="text-xs font-medium text-muted-foreground">No headings found</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                Add H1, H2, or H3 headings in your story to generate a live table of contents.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 h-6 text-[11px]"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  setIsOpen(false);
                }}
              >
                + Insert Heading
              </Button>
            </div>
          ) : filteredHeadings.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No matching sections
            </div>
          ) : (
            filteredHeadings.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleJump(item.pos)}
                className={`w-full group flex items-center justify-between text-left rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted cursor-pointer ${
                  item.level === 1
                    ? "font-bold text-foreground"
                    : item.level === 2
                    ? "font-medium text-foreground/90 pl-4"
                    : "text-muted-foreground pl-6"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <span
                    className={`inline-flex items-center justify-center rounded px-1 py-0.2 text-[9px] font-mono font-bold shrink-0 ${
                      item.level === 1
                        ? "bg-primary/15 text-primary"
                        : item.level === 2
                        ? "bg-muted text-muted-foreground border border-border/60"
                        : "text-muted-foreground/70"
                    }`}
                  >
                    H{item.level}
                  </span>
                  <span className="truncate">{item.text}</span>
                </div>
                <IconArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        {headings.length > 0 && (
          <div className="p-2 border-t border-border/50 bg-muted/20 text-[10px] text-muted-foreground text-center">
            Click any section to jump directly to it in the editor
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
