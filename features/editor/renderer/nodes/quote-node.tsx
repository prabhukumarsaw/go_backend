"use client";

import React from "react";
import type { TipTapNode } from "../types";

export function QuoteNode({
  node,
  renderChildren,
}: {
  node: TipTapNode;
  renderChildren: (nodes?: TipTapNode[]) => React.ReactNode;
}) {
  return (
    <blockquote className="my-8 sm:my-10 border-l-5 border-red-600 pl-6 py-4 italic text-foreground/90 bg-red-500/5 dark:bg-red-950/15 rounded-r-2xl font-serif text-xl sm:text-2xl md:text-3xl leading-relaxed shadow-2xs">
      <div className="space-y-3">{renderChildren(node.content)}</div>
    </blockquote>
  );
}
