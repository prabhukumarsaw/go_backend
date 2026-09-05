"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconHeadphones, IconPlus } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AudioPopover({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");

  const handleInsertAudio = () => {
    if (!audioUrl.trim()) return;

    editor
      .chain()
      .focus()
      .setAudio({
        src: audioUrl.trim(),
        title: title.trim() || "Audio Recording / Podcast Episode",
        author: author.trim(),
      })
      .run();

    setAudioUrl("");
    setTitle("");
    setAuthor("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
        title="Insert Audio Clip / Podcast Player"
      >
        <IconHeadphones className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-84 p-3.5 space-y-3" align="start">
        <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
          <IconHeadphones className="h-4 w-4 text-emerald-600" />
          <p className="text-xs font-semibold">Embed Audio Clip / Podcast</p>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Audio Stream / File URL (MP3, WAV, AAC)</Label>
            <Input
              className="h-7 text-xs font-mono"
              placeholder="https://example.com/audio/interview.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Episode / Recording Title</Label>
            <Input
              className="h-7 text-xs"
              placeholder="e.g. Press Conference Audio Excerpt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Speaker / Correspondent (Optional)</Label>
            <Input
              className="h-7 text-xs"
              placeholder="e.g. Chief Economic Advisor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-muted-foreground px-2"
            onClick={() => {
              setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
              setTitle("Sample Field Audio Recording");
              setAuthor("Senior Correspondent");
            }}
          >
            Insert Sample
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-7 text-xs gap-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleInsertAudio}
            disabled={!audioUrl.trim()}
          >
            <IconPlus className="h-3 w-3" />
            Insert Audio
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
