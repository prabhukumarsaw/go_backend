"use client";

import React from "react";
import type { TipTapNode } from "../types";

export function TableNode({
  node,
  renderChildren,
}: {
  node: TipTapNode;
  renderChildren: (nodes?: TipTapNode[]) => React.ReactNode;
}) {
  return (
    <div className="my-8 sm:my-10 overflow-x-auto rounded-2xl border border-border shadow-xs max-w-full">
      <table className="w-full min-w-[500px] border-collapse text-sm sm:text-base font-sans">
        <tbody>
          {node.content?.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
            >
              {row.content?.map((cell, cellIdx) => {
                const isHeader =
                  cell.type === "tableHeader" || cell.type === "customTableHeader";
                const CellTag = isHeader ? "th" : "td";

                const bg = cell.attrs?.background || cell.attrs?.backgroundColor;
                const colSpan = cell.attrs?.colspan || cell.attrs?.colSpan;
                const rowSpan = cell.attrs?.rowspan || cell.attrs?.rowSpan;

                const style: React.CSSProperties = {};
                if (bg) style.backgroundColor = bg;

                return (
                  <CellTag
                    key={cellIdx}
                    colSpan={colSpan}
                    rowSpan={rowSpan}
                    style={Object.keys(style).length > 0 ? style : undefined}
                    className={`p-3.5 sm:p-4 border-r border-border last:border-r-0 ${
                      isHeader
                        ? "bg-muted/70 font-bold text-left text-foreground tracking-tight font-serif"
                        : "text-foreground/90 font-sans"
                    }`}
                  >
                    <div className="space-y-2">{renderChildren(cell.content)}</div>
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
