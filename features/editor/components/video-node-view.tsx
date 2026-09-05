"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { IconMovie, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function VideoNodeView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { src, title = "Editorial Short Video", caption = "", width = "100%" } = node.attrs;

  return (
    <NodeViewWrapper className="not-prose my-6 select-none">
      <div
        className={`group relative mx-auto rounded-2xl border overflow-hidden transition-all shadow-sm ${
          selected
            ? "border-primary ring-2 ring-primary/20 bg-card"
            : "border-border/80 bg-card/90 hover:border-border"
        }`}
        style={{ width: width || "100%", maxWidth: "100%" }}
      >
        {/* Header: Label & Remove Button */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-muted/40 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
              <IconMovie className="h-3.5 w-3.5" />
              Short Video / Clip
            </span>
            {title && (
              <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[240px]">
                {title}
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={deleteNode}
            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
            title="Remove Video"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black/90 aspect-video flex items-center justify-center overflow-hidden">
          <video
            src={src}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Caption & Title Edit */}
        <div className="p-3 bg-card space-y-1.5 border-t border-border/40">
          <input
            type="text"
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            className="w-full bg-transparent text-xs font-semibold text-foreground focus:outline-none focus:underline truncate"
            placeholder="Video title or byline…"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            className="w-full bg-transparent text-[11px] text-muted-foreground focus:outline-none italic placeholder:not-italic"
            placeholder="Add video caption, source attribution or context (optional)…"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
