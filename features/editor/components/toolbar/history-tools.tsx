"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { ToolButton } from "./tool-button";

export function HistoryTools({ editor }: { editor: Editor }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <ToolButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <IconArrowBackUp className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <IconArrowForwardUp className="h-3.5 w-3.5" />
      </ToolButton>
    </div>
  );
}
