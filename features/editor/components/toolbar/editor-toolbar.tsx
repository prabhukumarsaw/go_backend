"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";

import { BlockSelector } from "./block-selector";
import { FormattingTools } from "./formatting-tools";
import { ColorPickerPopover } from "./color-picker-popover";
import { ClearFormattingButton } from "./clear-formatting-button";
import { LinkPopover } from "./link-popover";
import { ImagePopover } from "./image-popover";
import { EmbedPopover } from "./embed-popover";
import { PollPopover } from "./poll-popover";
import { TableGridPopover } from "./table-grid-popover";
import { ColumnLayoutPopover } from "./column-layout-popover";
import { CalloutTools } from "./callout-tools";
import { ListAndBlockTools } from "./list-and-block-tools";
import { AlignmentTools } from "./alignment-tools";
import { FullscreenButton } from "./fullscreen-button";
import { HistoryTools } from "./history-tools";

export interface EditorToolbarProps {
  editor: Editor | null;
  onOpenMediaPicker?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function EditorToolbar({
  editor,
  onOpenMediaPicker,
  isFullscreen = false,
  onToggleFullscreen,
}: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="sticky top-0 z-20 flex items-center gap-1.5 overflow-x-auto border-b bg-background/95 p-1.5 backdrop-blur-md scrollbar-none shadow-2xs">
      {/* ─── Group 1: Typography & Marks ─── */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 shadow-2xs shrink-0">
        <BlockSelector editor={editor} />
        <div className="h-4 w-px bg-border/60 mx-0.5" />
        <FormattingTools editor={editor} />
      </div>

      {/* ─── Group 2: Color & Clean ─── */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 shadow-2xs shrink-0">
        <ColorPickerPopover editor={editor} />
        <ClearFormattingButton editor={editor} />
      </div>

      {/* ─── Group 3: Media & Rich Embeds ─── */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 shadow-2xs shrink-0">
        <LinkPopover editor={editor} />
        <ImagePopover editor={editor} onOpenMediaPicker={onOpenMediaPicker} />
        <EmbedPopover editor={editor} />
        <PollPopover editor={editor} />
      </div>

      {/* ─── Group 4: Structured Data, Columns & Tables ─── */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 shadow-2xs shrink-0">
        <TableGridPopover editor={editor} />
        <ColumnLayoutPopover editor={editor} />
        <CalloutTools editor={editor} />
      </div>

      {/* ─── Group 5: Lists & Structure ─── */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 shadow-2xs shrink-0">
        <ListAndBlockTools editor={editor} />
      </div>

      {/* ─── Group 6: Alignment ─── */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 shadow-2xs shrink-0">
        <AlignmentTools editor={editor} />
      </div>

      <div className="flex-1 min-w-2" />

      {/* ─── Group 7: Modes & History ─── */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5 shadow-2xs shrink-0">
        {onToggleFullscreen && (
          <>
            <FullscreenButton
              isFullscreen={isFullscreen}
              onToggle={onToggleFullscreen}
            />
            <div className="h-4 w-px bg-border/60 mx-0.5" />
          </>
        )}
        <HistoryTools editor={editor} />
      </div>
    </div>
  );
}
