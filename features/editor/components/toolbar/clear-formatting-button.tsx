"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconClearFormatting } from "@tabler/icons-react";
import { ToolButton } from "./tool-button";

export function ClearFormattingButton({ editor }: { editor: Editor }) {
  return (
    <ToolButton
      onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      title="Clear Formatting"
    >
      <IconClearFormatting className="h-3.5 w-3.5" />
    </ToolButton>
  );
}
