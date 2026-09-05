"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconHeadphones,
  IconVolume,
  IconVolumeOff,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function AudioNodeView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { src, title = "Audio Clip / Interview Recording", author = "", caption = "" } = node.attrs;

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <NodeViewWrapper className="not-prose my-6 select-none">
      <div
        className={`group relative mx-auto max-w-xl rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
          selected
            ? "border-primary ring-2 ring-primary/20 bg-card"
            : "border-border/80 bg-card/90 hover:border-border"
        }`}
      >
        <audio
          ref={audioRef}
          src={src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          muted={isMuted}
          preload="metadata"
        />

        {/* Header: Label + Delete */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <IconHeadphones className="h-3 w-3" />
              Podcast / Audio Clip
            </span>
            {author && (
              <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[200px]">
                By {author}
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={deleteNode}
            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title="Remove Audio"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Body: Play Button + Metadata + Progress */}
        <div className="mt-3.5 flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <IconPlayerPause className="h-5 w-5 fill-current" />
            ) : (
              <IconPlayerPlay className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          <div className="flex-1 min-w-0 space-y-1.5">
            <input
              type="text"
              value={title}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none focus:underline truncate"
              placeholder="Enter audio or episode title…"
            />

            {/* Scrubber & Duration */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground shrink-0 min-w-[65px] text-right">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <IconVolumeOff className="h-3.5 w-3.5" />
                ) : (
                  <IconVolume className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Caption */}
        <div className="mt-3 pt-2.5 border-t border-border/40">
          <input
            type="text"
            value={caption}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none italic placeholder:not-italic"
            placeholder="Add audio caption or transcript note (optional)…"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
