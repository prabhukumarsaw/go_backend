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
import { AudioPopover } from "./audio-popover";
import { VideoPopover } from "./video-popover";
import { CitationPopover } from "./citation-popover";
import { PollPopover } from "./poll-popover";
import { TableGridPopover } from "./table-grid-popover";
import { ColumnLayoutPopover } from "./column-layout-popover";
import { CalloutTools } from "./callout-tools";
import { ListAndBlockTools } from "./list-and-block-tools";
import { AlignmentTools } from "./alignment-tools";
import { FullscreenButton } from "./fullscreen-button";
import { HistoryTools } from "./history-tools";
import { TableOfContentsSheet } from "../table-of-contents-sheet";

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
    <div className="sticky top-0 z-20 flex items-center gap-1 overflow-x-auto border-b bg-background/95 px-2 py-1.5 backdrop-blur-md scrollbar-none shadow-2xs">
      {/* Group 1: Typography & Marks */}
      <div className="flex items-center gap-0.5 shrink-0">
        <BlockSelector editor={editor} />
        <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />
        <FormattingTools editor={editor} />
      </div>

      <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

      {/* Group 2: Color & Clean */}
      <div className="flex items-center gap-0.5 shrink-0">
        <ColorPickerPopover editor={editor} />
        <ClearFormattingButton editor={editor} />
      </div>

      <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

      {/* Group 3: Media & Rich Embeds */}
      <div className="flex items-center gap-0.5 shrink-0">
        <LinkPopover editor={editor} />
        <ImagePopover editor={editor} onOpenMediaPicker={onOpenMediaPicker} />
        <VideoPopover editor={editor} onOpenMediaPicker={onOpenMediaPicker} />
        <AudioPopover editor={editor} />
        <EmbedPopover editor={editor} />
        <PollPopover editor={editor} />
      </div>

      <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

      {/* Group 4: Structured Data, Columns & Callouts */}
      <div className="flex items-center gap-0.5 shrink-0">
        <TableGridPopover editor={editor} />
        <ColumnLayoutPopover editor={editor} />
        <CalloutTools editor={editor} />
        <CitationPopover editor={editor} />
      </div>

      <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

      {/* Group 5: Lists & Structure */}
      <div className="flex items-center gap-0.5 shrink-0">
        <ListAndBlockTools editor={editor} />
      </div>

      <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

      {/* Group 6: Alignment */}
      <div className="flex items-center gap-0.5 shrink-0">
        <AlignmentTools editor={editor} />
      </div>

      <div className="h-4 w-px bg-border/60 mx-1 shrink-0" />

      {/* Group 7: Modes & Outline & History */}
      <div className="flex items-center gap-0.5 shrink-0">
        <TableOfContentsSheet editor={editor} variant="toolbar" />
        {onToggleFullscreen && (
          <FullscreenButton
            isFullscreen={isFullscreen}
            onToggle={onToggleFullscreen}
          />
        )}
        <HistoryTools editor={editor} />
      </div>
    </div>
  );
}
