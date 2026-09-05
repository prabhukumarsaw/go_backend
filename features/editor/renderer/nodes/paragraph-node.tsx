"use client";

import React from "react";
import type { TipTapNode } from "../types";
import { InlineContent } from "../inline-content";

export function ParagraphNode({ node }: { node: TipTapNode }) {
  const align = node.attrs?.textAlign;
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : align === "justify"
      ? "text-justify"
      : "text-left";

  const customFont = node.attrs?.fontFamily;
  const customSize = node.attrs?.fontSize;
  const customColor = node.attrs?.color;

  const style: React.CSSProperties = {};
  if (customFont) style.fontFamily = customFont;
  if (customSize) style.fontSize = customSize;
  if (customColor) style.color = customColor;

  // Empty paragraph spacer
  if (!node.content || node.content.length === 0) {
    return <p className="min-h-[1.25rem]" />;
  }

  return (
    <p
      style={Object.keys(style).length > 0 ? style : undefined}
      className={alignClass || undefined}
    >
      <InlineContent marksAndText={node.content} />
    </p>
  );
}
