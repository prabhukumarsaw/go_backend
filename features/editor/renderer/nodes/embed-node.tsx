"use client";

import React from "react";
import type { TipTapNode } from "../types";

export function EmbedNode({ node }: { node: TipTapNode }) {
  if (node.type === "youtube") {
    const src = node.attrs?.src;
    if (!src) return null;

    return (
      <div className="my-8 sm:my-10 aspect-video w-full rounded-2xl overflow-hidden shadow-md border bg-black">
        <iframe
          src={src}
          title="Embedded YouTube Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  if (node.type === "iframe") {
    const src = node.attrs?.src;
    if (!src) return null;

    return (
      <div className="my-8 sm:my-10 w-full rounded-2xl overflow-hidden shadow-sm border bg-card">
        <iframe
          src={src}
          title="Embedded Media"
          className="w-full h-80 sm:h-96 md:h-[450px] border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    );
  }

  return null;
}
