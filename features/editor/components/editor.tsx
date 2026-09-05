"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { getEditorExtensions } from "../extensions";
import { EditorToolbar } from "./toolbar/editor-toolbar";
import { EditorStatusBar } from "./editor-status-bar";
import { EditorBubbleMenu } from "./editor-bubble-menu";
import { useEditorAutoSave } from "../hooks/use-editor-autosave";

export interface ArticleEditorProps {
  content?: unknown;
  onChange?: (json: unknown) => void;
  onOpenMediaPicker?: () => void;
  editable?: boolean;
  onEditorReady?: (editor: Editor) => void;
}

export function ArticleEditor({
  content,
  onChange,
  onOpenMediaPicker,
  editable = true,
  onEditorReady,
}: ArticleEditorProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const editor = useEditor({
    editable,
    extensions: getEditorExtensions(),
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-base sm:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[520px] leading-relaxed font-sans text-left text-foreground selection:bg-primary/20",
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON());
      }
    },
  });

  // Notify parent component when editor instance is ready
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Keep editor content in sync when external content prop changes
  React.useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(content);
      if (currentJSON !== newJSON) {
        editor.commands.setContent(content as any);
      }
    }
  }, [content, editor]);

  // Handle escape key to exit fullscreen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Debounced auto-save to local storage safety net
  const {
    lastSaved,
    hasRecoverableDraft,
    recoverableDate,
    restoreDraft,
    dismissDraft,
  } = useEditorAutoSave(editor, content, editable);

  return (
    <div
      className={`flex flex-col bg-card transition-all ${isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-0 bg-background overflow-hidden"
          : "relative rounded-xl border border-border/70 shadow-sm overflow-hidden"
        }`}
    >
      {editable && (
        <EditorToolbar
          editor={editor}
          onOpenMediaPicker={onOpenMediaPicker}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />
      )}

      {/* Recoverable Unsaved Draft Banner */}
      {hasRecoverableDraft && editable && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-700 dark:text-amber-300">⚠️ Unsaved local backup found</span>
            <span className="text-muted-foreground text-[11px]">
              Found unsaved changes{recoverableDate ? ` from ${recoverableDate}` : ""}.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shadow-2xs text-[11px] transition-colors"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={dismissDraft}
              className="px-2 py-1 rounded hover:bg-amber-500/20 text-muted-foreground hover:text-foreground cursor-pointer text-[11px] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {editor && <EditorBubbleMenu editor={editor} />}

      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && editor) {
            editor.commands.focus("end");
          }
        }}
        className={`relative flex-1 overflow-y-auto cursor-text ${
          isFullscreen ? "bg-background" : "bg-card/40"
        }`}
      >
        <div
          className={`w-full transition-all ${
            isFullscreen
              ? "max-w-4xl mx-auto px-6 sm:px-12 py-8 sm:py-14"
              : "px-6 py-8 sm:px-10 sm:py-10"
          }`}
        >
          <EditorContent editor={editor} className="min-h-full" />
        </div>
      </div>

      <EditorStatusBar editor={editor} lastSaved={lastSaved} />
    </div>
  );
}

export default ArticleEditor;
