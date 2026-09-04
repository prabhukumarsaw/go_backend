"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconPhoto, IconLink, IconUpload } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImagePopoverProps {
  editor: Editor;
  onOpenMediaPicker?: () => void;
}

export function ImagePopover({ editor, onOpenMediaPicker }: ImagePopoverProps) {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const handleInsertUrl = () => {
    const cleanUrl = imageUrl.trim().replace(/\\/g, "/");
    if (!cleanUrl) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src: cleanUrl,
          alt: imageAlt.trim() || "",
        },
      })
      .run();
    setImageUrl("");
    setImageAlt("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted text-primary hover:text-primary transition-colors shrink-0"
        title="Insert Image"
      >
        <IconPhoto className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 space-y-3" align="start">
        <p className="text-xs font-semibold">Insert Image</p>

        {/* Option A: Open Media Library */}
        {onOpenMediaPicker && (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs font-medium justify-center gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => {
                setIsOpen(false);
                onOpenMediaPicker();
              }}
            >
              <IconUpload className="h-3.5 w-3.5" />
              Choose from Media Library
            </Button>
          </div>
        )}

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <span className="relative bg-popover px-2 text-[10px] uppercase font-mono text-muted-foreground">
            or paste url
          </span>
        </div>

        {/* Option B: Direct URL Input */}
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Image URL</Label>
            <Input
              className="h-7 text-xs font-mono"
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleInsertUrl();
                }
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Alt Text (Optional)</Label>
            <Input
              className="h-7 text-xs"
              placeholder="Descriptive image caption…"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleInsertUrl();
                }
              }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full h-7 text-xs font-medium"
            onClick={handleInsertUrl}
            disabled={!imageUrl.trim()}
          >
            <IconLink className="mr-1.5 h-3.5 w-3.5" />
            Insert Image URL
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
