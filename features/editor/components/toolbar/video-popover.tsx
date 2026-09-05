"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconMovie, IconPlus, IconUpload, IconLink } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface VideoPopoverProps {
  editor: Editor;
  onOpenMediaPicker?: () => void;
}

export function VideoPopover({ editor, onOpenMediaPicker }: VideoPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState("");
  const [title, setTitle] = React.useState("");

  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return;

    editor
      .chain()
      .focus()
      .setVideo({
        src: videoUrl.trim(),
        title: title.trim() || "Editorial Short Video",
      })
      .run();

    setVideoUrl("");
    setTitle("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors shrink-0 cursor-pointer"
        title="Insert Short Video / MP4 Clip"
      >
        <IconMovie className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3.5 space-y-3" align="start">
        <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
          <IconMovie className="h-4 w-4 text-violet-600" />
          <p className="text-xs font-semibold">Insert Short Video / Clip</p>
        </div>

        {onOpenMediaPicker && (
          <div className="rounded-lg border border-dashed border-violet-500/40 bg-violet-500/5 p-3 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Upload direct to your media library under the <strong>videos</strong> folder.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 w-full border-violet-500/30 text-violet-700 dark:text-violet-300 hover:bg-violet-500/10 cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                onOpenMediaPicker();
              }}
            >
              <IconUpload className="h-3.5 w-3.5" />
              Upload or Choose from Media Library
            </Button>
          </div>
        )}

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border/60 w-full" />
          <span className="absolute bg-popover px-2 text-[10px] text-muted-foreground font-medium uppercase">
            Or Paste URL
          </span>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Video Stream / File URL (MP4, WebM)</Label>
            <Input
              className="h-7 text-xs font-mono"
              placeholder="https://example.com/videos/news-clip.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Video Title (Optional)</Label>
            <Input
              className="h-7 text-xs"
              placeholder="e.g. Ground report from parliament"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-1">
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs gap-1 px-3 bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
            onClick={handleInsertVideo}
            disabled={!videoUrl.trim()}
          >
            <IconPlus className="h-3 w-3" />
            Insert Video
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
