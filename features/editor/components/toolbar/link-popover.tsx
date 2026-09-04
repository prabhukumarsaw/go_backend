"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconLink } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function LinkPopover({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = React.useState("");

  const handleInsertLink = () => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();
    setLinkUrl("");
  };

  return (
    <Popover>
      <PopoverTrigger
        className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium transition-colors shrink-0 ${
          editor.isActive("link")
            ? "bg-muted text-foreground"
            : "hover:bg-muted hover:text-foreground text-muted-foreground"
        }`}
        title="Insert Link"
      >
        <IconLink className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-2" align="start">
        <Label className="text-xs">URL</Label>
        <div className="flex gap-1.5">
          <Input
            className="h-7 text-xs flex-1"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleInsertLink();
              }
            }}
          />
          <Button size="sm" className="h-7 text-xs px-2.5" onClick={handleInsertLink}>
            Set
          </Button>
        </div>
        {editor.isActive("link") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-destructive hover:text-destructive w-full"
            onClick={() => {
              editor.chain().focus().unsetLink().run();
              setLinkUrl("");
            }}
          >
            Remove Link
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
