"use client";

import React from "react";
import type { TipTapNode } from "../types";

export function ListNode({
  node,
  renderChildren,
}: {
  node: TipTapNode;
  renderChildren: (nodes?: TipTapNode[]) => React.ReactNode;
}) {
  if (node.type === "bulletList") {
    return (
      <ul className="list-disc pl-6 my-6 sm:my-8 space-y-3 text-lg sm:text-xl text-foreground/95 font-sans font-hindi leading-relaxed">
        {node.content?.map((item, index) => (
          <li key={index} className="leading-relaxed">
            {renderChildren(item.content)}
          </li>
        ))}
      </ul>
    );
  }

  if (node.type === "orderedList") {
    return (
      <ol className="list-decimal pl-6 my-6 sm:my-8 space-y-3 text-lg sm:text-xl text-foreground/95 font-sans font-hindi leading-relaxed">
        {node.content?.map((item, index) => (
          <li key={index} className="leading-relaxed">
            {renderChildren(item.content)}
          </li>
        ))}
      </ol>
    );
  }

  if (node.type === "taskList") {
    return (
      <ul className="list-none pl-0 my-6 sm:my-8 space-y-3.5">
        {node.content?.map((item, index) => (
          <ListNode key={index} node={item} renderChildren={renderChildren} />
        ))}
      </ul>
    );
  }

  if (node.type === "taskItem") {
    const isChecked = Boolean(node.attrs?.checked);
    return (
      <li className="flex items-start gap-3.5 text-lg sm:text-xl text-foreground/95 leading-relaxed font-sans font-hindi group">
        <div className="pt-1 shrink-0">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="h-5 w-5 rounded border-border text-red-600 focus:ring-red-600/20 accent-red-600 cursor-default"
          />
        </div>
        <div className={`flex-1 ${isChecked ? "line-through text-muted-foreground/75" : ""}`}>
          {renderChildren(node.content)}
        </div>
      </li>
    );
  }

  return null;
}
