"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconBrandYoutube,
  IconBrandX,
  IconBrandFacebook,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type EmbedType = "youtube" | "x" | "facebook";

export function EmbedPopover({ editor }: { editor: Editor }) {
  const [embedUrl, setEmbedUrl] = React.useState("");
  const [embedType, setEmbedType] = React.useState<EmbedType>("youtube");

  const handleInsertEmbed = () => {
    if (!embedUrl.trim()) return;

    if (embedType === "youtube") {
      editor.chain().focus().setYoutubeVideo({ src: embedUrl }).run();
    } else {
      let src = embedUrl;
      let height = "500";

      if (embedType === "x") {
        const tweetId = embedUrl.match(/status\/(\d+)/)?.[1];
        if (tweetId) {
          src = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
          height = "350";
        }
      } else if (embedType === "facebook") {
        src = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
          embedUrl
        )}&show_text=true&width=500`;
        height = "450";
      }

      editor
        .chain()
        .focus()
        .insertContent({ type: "iframe", attrs: { src, height } })
        .run();
    }
    setEmbedUrl("");
  };

  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted text-red-500 hover:text-red-600 transition-colors shrink-0"
        title="Embed YouTube / X / Facebook"
      >
        <IconBrandYoutube className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 space-y-2.5" align="start">
        <p className="text-xs font-semibold">Embed Media</p>
        <div className="flex gap-1">
          {(["youtube", "x", "facebook"] as const).map((type) => (
            <Button
              key={type}
              variant={embedType === type ? "secondary" : "outline"}
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={() => setEmbedType(type)}
            >
              {type === "youtube" && <IconBrandYoutube className="mr-1 h-3 w-3" />}
              {type === "x" && <IconBrandX className="mr-1 h-3 w-3" />}
              {type === "facebook" && <IconBrandFacebook className="mr-1 h-3 w-3" />}
              {type === "youtube" ? "YouTube" : type === "x" ? "X Post" : "Facebook"}
            </Button>
          ))}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            {embedType === "youtube"
              ? "Paste YouTube video URL"
              : embedType === "x"
              ? "Paste X (Twitter) post URL"
              : "Paste Facebook post URL"}
          </Label>
          <div className="flex gap-1.5">
            <Input
              className="h-7 text-xs flex-1 font-mono"
              placeholder={
                embedType === "youtube"
                  ? "https://youtube.com/watch?v=..."
                  : embedType === "x"
                  ? "https://x.com/user/status/..."
                  : "https://facebook.com/.../posts/..."
              }
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleInsertEmbed();
                }
              }}
            />
            <Button
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={handleInsertEmbed}
              disabled={!embedUrl.trim()}
            >
              Embed
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
