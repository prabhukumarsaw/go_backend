"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconKeyboard } from "@tabler/icons-react";

const SHORTCUTS = [
  { action: "Bold", shortcut: "Ctrl + B" },
  { action: "Italic", shortcut: "Ctrl + I" },
  { action: "Underline", shortcut: "Ctrl + U" },
  { action: "Strikethrough", shortcut: "Ctrl + Shift + X" },
  { action: "Inline Code", shortcut: "Ctrl + E" },
  { action: "Insert Link", shortcut: "Ctrl + K" },
  { action: "Heading 1", shortcut: "Ctrl + Alt + 1" },
  { action: "Heading 2", shortcut: "Ctrl + Alt + 2" },
  { action: "Heading 3", shortcut: "Ctrl + Alt + 3" },
  { action: "Bullet List", shortcut: "Ctrl + Shift + 8" },
  { action: "Numbered List", shortcut: "Ctrl + Shift + 7" },
  { action: "Task Checklist", shortcut: "Ctrl + Shift + 9" },
  { action: "Blockquote", shortcut: "Ctrl + Shift + B" },
  { action: "Code Block", shortcut: "Ctrl + Alt + C" },
  { action: "Undo", shortcut: "Ctrl + Z" },
  { action: "Redo", shortcut: "Ctrl + Shift + Z" },
];

export function EditorShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-mono transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
        title="Keyboard Shortcuts"
      >
        <IconKeyboard className="h-3 w-3" />
        <span>Shortcuts</span>
      </DialogTrigger>
      <DialogContent className="max-w-md p-5">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <IconKeyboard className="h-4 w-4 text-primary" />
            Editor Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          {SHORTCUTS.map((item) => (
            <div
              key={item.action}
              className="flex items-center justify-between p-1.5 rounded-md bg-muted/40 border border-border/40"
            >
              <span className="text-muted-foreground font-medium">{item.action}</span>
              <kbd className="font-mono text-[10px] bg-background border px-1.5 py-0.5 rounded text-foreground shadow-2xs font-semibold">
                {item.shortcut}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
