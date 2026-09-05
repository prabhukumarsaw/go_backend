"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const [hasRecoverableDraft, setHasRecoverableDraft] = useState(false);
  const [recoverableDate, setRecoverableDate] = useState<string | null>(null);

  const [dismissed, setDismissed] = useState(false);
  const hasCheckedRef = useRef(false);

  const storageKey = options?.storageKey ?? "bharatvani_studio_draft_backup";
  const timestampKey = `${storageKey}_timestamp`;
  const delayMs = options?.delayMs ?? 1500;

  // Check once on initial mount if an unsaved backup exists
  useEffect(() => {
    if (!editable || hasCheckedRef.current || dismissed) return;
    hasCheckedRef.current = true;

    try {
      const saved = localStorage.getItem(storageKey);
      const savedTime = localStorage.getItem(timestampKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.content &&
          parsed.content.length > 0 &&
          JSON.stringify(parsed) !== JSON.stringify(content)
        ) {
          setHasRecoverableDraft(true);
          if (savedTime) {
            setRecoverableDate(savedTime);
          }
        }
      }
    } catch {
      // Ignore parse/storage errors
    }
  }, [editable, storageKey, timestampKey, content, dismissed]);

  // Debounced backup
  useEffect(() => {
    if (!editor || !editable) return;

    const timer = setTimeout(() => {
      try {
        const json = editor.getJSON();
        if (json && json.content && json.content.length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(json));
          const timeStr = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          localStorage.setItem(timestampKey, timeStr);
          setLastSaved(timeStr);
        }
      } catch {
        // Silently ignore quota / localStorage unavailable
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [content, editor, editable, storageKey, timestampKey, delayMs]);

  const restoreDraft = useCallback(() => {
    if (!editor) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        editor.commands.setContent(parsed);
        setHasRecoverableDraft(false);
      }
    } catch {
      // Ignore
    }
  }, [editor, storageKey]);

  const dismissDraft = useCallback(() => {
    setDismissed(true);
    setHasRecoverableDraft(false);
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(timestampKey);
      setHasRecoverableDraft(false);
    } catch {
      // Ignore
    }
  }, [storageKey, timestampKey]);

  return {
    lastSaved,
    hasRecoverableDraft,
    recoverableDate,
    restoreDraft,
    dismissDraft,
    clearDraft,
  };
}
