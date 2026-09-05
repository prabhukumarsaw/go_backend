"use client";

import React from "react";
import type { TipTapNode } from "../types";
import { InlineContent } from "../inline-content";

export function HeadingNode({ node }: { node: TipTapNode }) {
  const level = (node.attrs?.level || 2) as 1 | 2 | 3 | 4 | 5 | 6;
  const align = node.attrs?.textAlign;
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";

  const customFont = node.attrs?.fontFamily;
  const customColor = node.attrs?.color;

  const style: React.CSSProperties = {};
  if (customFont) style.fontFamily = customFont;
  if (customColor) style.color = customColor;

  const headingClasses: Record<number, string> = {
    1: "text-2xl sm:text-3xl font-bold tracking-tight font-hindi text-foreground mt-8 mb-3.5 leading-snug",
    2: "text-lg sm:text-xl md:text-2xl font-bold tracking-tight font-hindi text-foreground mt-7 mb-2.5 leading-snug",
    3: "text-base sm:text-lg md:text-xl font-bold tracking-tight font-hindi text-foreground mt-6 mb-2 leading-snug",
    4: "text-base sm:text-lg font-bold font-hindi text-foreground mt-5 mb-2 leading-snug",
    5: "text-sm sm:text-base font-bold font-hindi text-foreground mt-4 mb-1.5",
    6: "text-xs sm:text-sm font-bold font-hindi text-muted-foreground uppercase tracking-wider mt-4 mb-1",
  };

  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const id = node.content
    ?.map((c) => c.text || "")
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <Tag
      id={id || undefined}
      style={Object.keys(style).length > 0 ? style : undefined}
      className={`${headingClasses[level] || headingClasses[2]} ${alignClass}`}
    >
      <InlineContent marksAndText={node.content} />
    </Tag>
  );
}
