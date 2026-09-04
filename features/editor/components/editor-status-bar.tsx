"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { useEditorMetrics } from "../hooks/use-editor-metrics";
import { EditorShortcutsDialog } from "./editor-shortcuts-dialog";
import { IconBook2, IconFileText } from "@tabler/icons-react";

interface EditorStatusBarProps {
  editor: Editor | null;
  lastSaved: string | null;
}

export function EditorStatusBar({ editor, lastSaved }: EditorStatusBarProps) {
  const { wordCount, charCount, readTimeMin } = useEditorMetrics(editor);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground backdrop-blur-xs select-none">
      {/* Metrics Chips */}
      <div className="flex items-center gap-2 font-mono sm:gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-background/80 border px-2 py-0.5 shadow-2xs">
          <IconFileText className="h-3 w-3 text-muted-foreground" />
          <span>
            <strong className="text-foreground font-semibold">
              {wordCount.toLocaleString()}
            </strong>{" "}
            words
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            <strong className="text-foreground font-semibold">
              {charCount.toLocaleString()}
            </strong>{" "}
            chars
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-background/80 border px-2.5 py-0.5 shadow-2xs">
          <IconBook2 className="h-3 w-3 text-primary" />
          <span>
            ~<strong className="text-foreground font-semibold">{readTimeMin}</strong> min read
          </span>
        </div>
      </div>

      {/* Auto-Save Status & Shortcuts */}
      <div className="flex items-center gap-3">
        <EditorShortcutsDialog />

        <div className="h-3 w-px bg-border/60" />

        <div className="flex items-center gap-1.5 text-[10px]">
          {lastSaved ? (
            <span className="flex items-center gap-1.5 font-mono text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Saved locally at {lastSaved}</span>
            </span>
          ) : (
            <span className="text-muted-foreground/60 font-mono">Ready to write</span>
          )}
        </div>
      </div>
    </div>
  );
}
