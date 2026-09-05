"use client";

import React from "react";
import type { TipTapNode } from "../types";

export function CalloutNode({
  node,
  renderChildren,
}: {
  node: TipTapNode;
  renderChildren: (nodes?: TipTapNode[]) => React.ReactNode;
}) {
  const rawType = node.attrs?.type || "tip";
  const type = rawType === "big_stat" ? "stat" : rawType === "pull_quote" ? "quote" : rawType;

  return (
    <div className={`tiptap-callout tiptap-callout-${type} not-prose`}>
      {renderChildren(node.content)}
    </div>
  );
}
