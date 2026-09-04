"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
} from "@tabler/icons-react";
import { ToolButton } from "./tool-button";

export function AlignmentTools({ editor }: { editor: Editor }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <ToolButton
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align Left"
      >
        <IconAlignLeft className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align Center"
      >
        <IconAlignCenter className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align Right"
      >
        <IconAlignRight className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        title="Justify"
      >
        <IconAlignJustified className="h-3.5 w-3.5" />
      </ToolButton>
    </div>
  );
}
