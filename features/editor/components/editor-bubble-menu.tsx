"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconLink,
  IconHighlight,
  IconH2,
  IconH3,
  IconQuote,
  IconTrash,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconTableRow,
  IconTableColumn,
} from "@tabler/icons-react";
import { TableContextMenu } from "./toolbar/table-context-menu";

export function EditorBubbleMenu({ editor }: { editor: Editor }) {
  if (!editor) return null;

  const isImageActive = editor.isActive("image");
  const isTableActive = editor.isActive("table");

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-full border border-border/80 bg-background/95 px-2 py-1 shadow-2xl backdrop-blur-md ring-1 ring-foreground/5 text-xs animate-fade-in-up"
    >
      {/* ─── Context 1: Image Controls ─── */}
      {isImageActive ? (
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono font-semibold text-muted-foreground px-1.5">
            Image Size:
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().setImageWidth("25%").run()}
            className="h-6 px-1.5 rounded-full text-[10px] font-mono hover:bg-muted font-medium"
          >
            25%
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setImageWidth("50%").run()}
            className="h-6 px-1.5 rounded-full text-[10px] font-mono hover:bg-muted font-medium"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setImageWidth("75%").run()}
            className="h-6 px-1.5 rounded-full text-[10px] font-mono hover:bg-muted font-medium"
          >
            75%
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setImageWidth("100%").run()}
            className="h-6 px-1.5 rounded-full text-[10px] font-mono hover:bg-muted font-medium"
          >
            100%
          </button>

          <div className="h-3.5 w-px bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().setImageAlignment("left").run()}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Float Left (Inline text wrap)"
          >
            <IconAlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setImageAlignment("center").run()}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Center Block"
          >
            <IconAlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setImageAlignment("right").run()}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Float Right (Inline text wrap)"
          >
            <IconAlignRight className="h-3.5 w-3.5" />
          </button>

          <div className="h-3.5 w-px bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-destructive/10 text-destructive"
            title="Delete Image"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : isTableActive ? (
        /* ─── Context 2: Table Quick Controls ─── */
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono font-semibold text-muted-foreground px-1.5">
            Table:
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="h-6 px-1.5 rounded-full text-[10px] hover:bg-muted font-medium flex items-center gap-1"
            title="Insert Row Below"
          >
            <IconTableRow className="h-3 w-3" />
            <span>+ Row</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="h-6 px-1.5 rounded-full text-[10px] hover:bg-muted font-medium flex items-center gap-1"
            title="Insert Column Right"
          >
            <IconTableColumn className="h-3 w-3" />
            <span>+ Col</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="h-6 px-1.5 rounded-full text-[10px] hover:bg-destructive/10 text-destructive font-medium"
            title="Delete Current Row"
          >
            Del Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="h-6 px-1.5 rounded-full text-[10px] hover:bg-destructive/10 text-destructive font-medium"
            title="Delete Current Column"
          >
            Del Col
          </button>
          <div className="h-3.5 w-px bg-border/60 mx-0.5" />
          <TableContextMenu editor={editor} />
          <div className="h-3.5 w-px bg-border/60 mx-0.5" />
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-destructive/10 text-destructive"
            title="Delete Table"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* ─── Context 3: Text Selection Controls ─── */
        <>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("bold")
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Bold (Ctrl+B)"
          >
            <IconBold className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("italic")
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Italic (Ctrl+I)"
          >
            <IconItalic className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("underline")
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Underline (Ctrl+U)"
          >
            <IconUnderline className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("strike")
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Strikethrough"
          >
            <IconStrikethrough className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("highlight")
                ? "bg-amber-400/20 text-amber-600 dark:text-amber-300 ring-1 ring-amber-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Highlight"
          >
            <IconHighlight className="h-3.5 w-3.5" />
          </button>

          <div className="h-3.5 w-px bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("heading", { level: 2 })
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Heading 2"
          >
            <IconH2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("heading", { level: 3 })
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Heading 3"
          >
            <IconH3 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("blockquote")
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Quote"
          >
            <IconQuote className="h-3.5 w-3.5" />
          </button>

          <div className="h-3.5 w-px bg-border/60 mx-1" />

          <button
            type="button"
            onClick={() => {
              const previousUrl = editor.getAttributes("link").href;
              const url = window.prompt("URL", previousUrl);
              if (url === null) return;
              if (url === "") {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                return;
              }
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }}
            className={`h-7 w-7 flex items-center justify-center rounded-full transition-all ${
              editor.isActive("link")
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Link (Ctrl+K)"
          >
            <IconLink className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </BubbleMenu>
  );
}
