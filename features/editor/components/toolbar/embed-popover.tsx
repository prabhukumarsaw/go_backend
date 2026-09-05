"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconBrandYoutube,
  IconBrandX,
  IconBrandFacebook,
  IconBrandSpotify,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type EmbedType = "youtube" | "x" | "facebook" | "spotify";

export function EmbedPopover({ editor }: { editor: Editor }) {
  const [embedUrl, setEmbedUrl] = React.useState("");
  const [embedType, setEmbedType] = React.useState<EmbedType>("youtube");
  const [isOpen, setIsOpen] = React.useState(false);

  const handleInsertEmbed = () => {
    if (!embedUrl.trim()) return;

    if (embedType === "youtube") {
      editor.chain().focus().setYoutubeVideo({ src: embedUrl.trim() }).run();
    } else {
      let src = embedUrl.trim();
      let height = "500";

      if (embedType === "x") {
        const tweetId = embedUrl.match(/status\/(\d+)/)?.[1];
        if (tweetId) {
          src = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
          height = "350";
        }
      } else if (embedType === "facebook") {
        src = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
          embedUrl.trim()
        )}&show_text=true&width=500`;
        height = "450";
      } else if (embedType === "spotify") {
        const match = embedUrl.match(/open\.spotify\.com\/(track|episode|album|playlist|show)\/([a-zA-Z0-9]+)/);
        if (match) {
          const [, type, id] = match;
          src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
          height = type === "episode" || type === "track" ? "152" : "352";
        } else {
          src = embedUrl.trim();
          height = "152";
        }
      }

      editor
        .chain()
        .focus()
        .insertContent({ type: "iframe", attrs: { src, height } })
        .run();
    }
    setEmbedUrl("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted text-red-500 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
        title="Embed YouTube / X / Spotify / Facebook"
      >
        <IconBrandYoutube className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-84 p-3.5 space-y-2.5" align="start">
        <p className="text-xs font-semibold">Embed Media & Social Post</p>
        <div className="grid grid-cols-4 gap-1">
          {(
            [
              { type: "youtube", label: "YouTube", icon: IconBrandYoutube },
              { type: "spotify", label: "Spotify", icon: IconBrandSpotify },
              { type: "x", label: "X Post", icon: IconBrandX },
              { type: "facebook", label: "Facebook", icon: IconBrandFacebook },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.type}
                type="button"
                variant={embedType === item.type ? "secondary" : "outline"}
                size="sm"
                className="h-7 text-[11px] px-1.5 flex items-center justify-center gap-1"
                onClick={() => setEmbedType(item.type)}
              >
                <Icon className="h-3 w-3" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            {embedType === "youtube"
              ? "YouTube video URL"
              : embedType === "spotify"
              ? "Spotify track or podcast episode link"
              : embedType === "x"
              ? "X (Twitter) status URL"
              : "Facebook post URL"}
          </Label>
          <div className="flex gap-1.5">
            <Input
              className="h-7 text-xs flex-1 font-mono"
              placeholder={
                embedType === "youtube"
                  ? "https://youtube.com/watch?v=..."
                  : embedType === "spotify"
                  ? "https://open.spotify.com/episode/..."
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
              type="button"
              size="sm"
              className="h-7 text-xs px-2.5 cursor-pointer"
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
