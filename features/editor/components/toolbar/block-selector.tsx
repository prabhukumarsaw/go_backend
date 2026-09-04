"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconH1, IconH2, IconH3 } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BlockSelector({ editor }: { editor: Editor }) {
  const getActiveHeading = (): string => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "paragraph";
  };

  const handleHeadingChange = (val: string) => {
    if (val === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else if (val === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  return (
    <Select
      value={getActiveHeading()}
      onValueChange={(val) => {
        if (val) handleHeadingChange(val);
      }}
    >
      <SelectTrigger className="h-7 w-[110px] text-xs font-medium shrink-0 border-0 bg-muted/50 shadow-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="bottom" align="start">
        <SelectItem value="paragraph">Paragraph</SelectItem>
        <SelectItem value="h1">
          <span className="flex items-center gap-1.5">
            <IconH1 className="h-3.5 w-3.5" /> Heading 1
          </span>
        </SelectItem>
        <SelectItem value="h2">
          <span className="flex items-center gap-1.5">
            <IconH2 className="h-3.5 w-3.5" /> Heading 2
          </span>
        </SelectItem>
        <SelectItem value="h3">
          <span className="flex items-center gap-1.5">
            <IconH3 className="h-3.5 w-3.5" /> Heading 3
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
