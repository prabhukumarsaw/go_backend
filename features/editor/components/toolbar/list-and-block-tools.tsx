"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconList,
  IconListNumbers,
  IconCheckbox,
  IconQuote,
  IconCodeDots,
  IconMinus,
} from "@tabler/icons-react";
import { ToolButton } from "./tool-button";

export function ListAndBlockTools({ editor }: { editor: Editor }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <ToolButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <IconList className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <IconListNumbers className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="Checklist / Task List"
      >
        <IconCheckbox className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        <IconQuote className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <IconCodeDots className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <IconMinus className="h-3.5 w-3.5" />
      </ToolButton>
    </div>
  );
}
