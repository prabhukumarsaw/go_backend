"use client";

import React, { useMemo } from "react";
import type { TipTapNode, ArticleRendererProps } from "./types";
import { NodeRenderer } from "./node-renderer";

export function ArticleRenderer({ content, className = "" }: ArticleRendererProps) {
  const doc = useMemo<TipTapNode | null>(() => {
    if (!content) return null;
    try {
      return typeof content === "string" ? JSON.parse(content) : (content as TipTapNode);
    } catch {
      return null;
    }
  }, [content]);

  if (!content) return null;

  if (!doc) {
    return (
      <div className={`article-content font-sans leading-relaxed ${className}`}>
        {String(content)}
      </div>
    );
  }

  if (!doc.content || !Array.isArray(doc.content)) {
    return null;
  }

  return (
    <div className={`article-content space-y-6 ${className}`}>
      {doc.content.map((node, index) => (
        <NodeRenderer key={index} node={node} />
      ))}
    </div>
  );
}
