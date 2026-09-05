"use client";

import React from "react";
import { IconVolume } from "@tabler/icons-react";
import type { TipTapNode } from "../types";

export function MediaNode({ node }: { node: TipTapNode }) {
  if (node.type === "image" || node.type === "resizableImage") {
    const src = node.attrs?.src;
    if (!src) return null;

    const alt = node.attrs?.alt || "Article illustration";
    const title = node.attrs?.title;
    const caption = node.attrs?.caption || title;
    const width = node.attrs?.width;
    const align = node.attrs?.alignment || node.attrs?.align || "center";

    const alignContainerClass =
      align === "left"
        ? "mr-auto text-left"
        : align === "right"
        ? "ml-auto text-right"
        : "mx-auto text-center";

    return (
      <figure className={`my-8 sm:my-10 ${alignContainerClass} max-w-full group`}>
        <div
          className="relative inline-block overflow-hidden rounded-2xl border bg-muted/40 shadow-md max-w-full"
          style={width ? { width: typeof width === "number" ? `${width}px` : width } : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full h-auto object-cover max-h-[650px] transition-transform duration-500 group-hover:scale-101"
          />
        </div>
        {caption && (
          <figcaption className="text-xs sm:text-sm text-muted-foreground mt-2.5 text-center font-sans italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (node.type === "audio") {
    const src = node.attrs?.src;
    const title = node.attrs?.title || "Audio Clip / Podcast Episode";
    const artist = node.attrs?.artist || "Newsroom Audio Desk";

    return (
      <div className="my-8 sm:my-10 rounded-2xl border border-border/80 bg-card/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
            <IconVolume className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-foreground truncate font-serif">
              {title}
            </h4>
            <p className="text-xs text-muted-foreground truncate font-mono">
              {artist}
            </p>
          </div>
        </div>
        {src && (
          <audio controls className="w-full h-10 rounded-lg outline-none" preload="metadata">
            <source src={src} />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    );
  }

  if (node.type === "video") {
    const src = node.attrs?.src;
    const title = node.attrs?.title;

    return (
      <figure className="my-8 sm:my-10 rounded-2xl overflow-hidden border bg-black shadow-md">
        {src && (
          <video
            src={src}
            controls
            playsInline
            className="w-full aspect-video max-h-[600px] object-contain bg-black"
            preload="metadata"
          >
            Your browser does not support HTML5 video.
          </video>
        )}
        {title && (
          <figcaption className="text-xs sm:text-sm text-muted-foreground p-3 text-center font-sans bg-card border-t italic">
            {title}
          </figcaption>
        )}
      </figure>
    );
  }

  return null;
}
