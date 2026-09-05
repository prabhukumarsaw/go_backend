"use client";

import React from "react";
import type { TipTapNode } from "../types";

export function DividerNode({ node }: { node: TipTapNode }) {
  if (node.type === "horizontalRule") {
    return (
      <div className="my-10 sm:my-12 flex items-center justify-center gap-3">
        <div className="h-px bg-border/80 flex-1" />
        <span className="text-red-600/70 font-serif text-lg select-none">✦ ✦ ✦</span>
        <div className="h-px bg-border/80 flex-1" />
      </div>
    );
  }

  if (node.type === "hardBreak") {
    return <br className="my-1" />;
  }

  return null;
}
