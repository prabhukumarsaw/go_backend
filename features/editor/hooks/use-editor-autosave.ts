"use client";

import { useEffect, useState } from "react";
import { type Editor } from "@tiptap/react";

interface UseEditorAutoSaveOptions {
  storageKey?: string;
  delayMs?: number;
}

export function useEditorAutoSave(
  editor: Editor | null,
  content: unknown,
  editable: boolean = true,
  options?: UseEditorAutoSaveOptions
) {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const storageKey = options?.storageKey ?? "bharatvani_studio_draft_backup";
  const delayMs = options?.delayMs ?? 1500;

  useEffect(() => {
    if (!editor || !editable) return;

    const timer = setTimeout(() => {
      try {
        const json = editor.getJSON();
        if (json && Object.keys(json).length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(json));
          setLastSaved(
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        }
      } catch {
        // Silently ignore quota / localStorage unavailable in SSR
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [content, editor, editable, storageKey, delayMs]);

  return { lastSaved };
}
