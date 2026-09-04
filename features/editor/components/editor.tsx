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
          "prose prose-base dark:prose-invert max-w-none focus:outline-none min-h-[520px] px-6 py-8 sm:px-10 sm:py-10 leading-relaxed font-serif text-foreground selection:bg-primary/20",
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
  const { lastSaved } = useEditorAutoSave(editor, content, editable);

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

      {editor && <EditorBubbleMenu editor={editor} />}

      <div
        className={`relative flex-1 overflow-auto bg-card/60 transition-colors ${isFullscreen ? "p-4 sm:p-12 max-w-3xl mx-auto w-full" : ""
          }`}
      >
        <EditorContent editor={editor} />
      </div>

      <EditorStatusBar editor={editor} lastSaved={lastSaved} />
    </div>
  );
}

export default ArticleEditor;
