"use client";

import React from "react";
import type { TipTapNode } from "../types";

export function ColumnNode({
  node,
  renderChildren,
}: {
  node: TipTapNode;
  renderChildren: (nodes?: TipTapNode[]) => React.ReactNode;
}) {
  if (node.type === "columns") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 sm:my-10">
        {node.content?.map((col, idx) => (
          <div key={idx} className="space-y-4">
            {renderChildren(col.content)}
          </div>
        ))}
      </div>
    );
  }

  if (node.type === "column") {
    return (
      <div className="space-y-4">
        {renderChildren(node.content)}
      </div>
    );
  }

  return null;
}
