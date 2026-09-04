"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconSubscript,
  IconSuperscript,
} from "@tabler/icons-react";
import { ToolButton } from "./tool-button";

export function FormattingTools({ editor }: { editor: Editor }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <ToolButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <IconBold className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <IconItalic className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <IconUnderline className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <IconStrikethrough className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
      >
        <IconCode className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("subscript")}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        title="Subscript"
      >
        <IconSubscript className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={editor.isActive("superscript")}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        title="Superscript"
      >
        <IconSuperscript className="h-3.5 w-3.5" />
      </ToolButton>
    </div>
  );
}
