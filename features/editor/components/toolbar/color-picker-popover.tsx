"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconColorSwatch } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Orange", value: "#fed7aa" },
];

export function ColorPickerPopover({ editor }: { editor: Editor }) {
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted hover:text-foreground transition-colors shrink-0"
        title="Text Color & Highlight"
      >
        <IconColorSwatch className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Text Color
          </p>
          <div className="flex gap-1">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                className="h-5 w-5 rounded-full border transition-transform hover:scale-110"
                style={{ background: c.value || "currentColor" }}
                title={c.label}
                onClick={() => {
                  if (c.value) {
                    editor.chain().focus().setColor(c.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                }}
              />
            ))}
          </div>

          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
            Highlight
          </p>
          <div className="flex gap-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                className="h-5 w-5 rounded-full border transition-transform hover:scale-110"
                style={{ background: c.value }}
                title={c.label}
                onClick={() =>
                  editor.chain().focus().toggleHighlight({ color: c.value }).run()
                }
              />
            ))}
            <button
              type="button"
              className="h-5 w-5 rounded-full border bg-background text-[8px] font-bold text-muted-foreground flex items-center justify-center hover:bg-muted"
              title="Remove Highlight"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
            >
              ✕
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
