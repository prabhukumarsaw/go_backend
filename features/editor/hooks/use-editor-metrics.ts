"use client";

import { type Editor } from "@tiptap/react";

export interface EditorMetrics {
  wordCount: number;
  charCount: number;
  readTimeMin: number;
}

export function useEditorMetrics(editor: Editor | null): EditorMetrics {
  const wordCount = editor?.storage?.characterCount?.words?.() ?? 0;
  const charCount = editor?.storage?.characterCount?.characters?.() ?? 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return {
    wordCount,
    charCount,
    readTimeMin,
  };
}
