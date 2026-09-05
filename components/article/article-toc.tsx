"use client";

import { useState } from "react";
import type { HeadingItem } from "./types";

interface ArticleTocProps {
  headings: HeadingItem[];
}

export function ArticleToc({ headings }: ArticleTocProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!headings || headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4 my-6"
    >
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-600" />
          <h3 className="text-xs sm:text-[13px] font-bold text-foreground font-hindi uppercase tracking-wide">
            विषय सूची (Contents)
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[11px] text-muted-foreground hover:text-red-600 font-hindi transition-colors cursor-pointer"
        >
          [{isOpen ? "छिपाएं" : "दिखाएं"}]
        </button>
      </div>

      {isOpen && (
        <ul className="space-y-1.5 pt-2.5 text-xs sm:text-[13px] font-hindi">
          {headings.map((h, i) => (
            <li key={i} className={h.level === 3 ? "pl-4" : ""}>
              <a
                href={`#${h.id}`}
                className="text-muted-foreground hover:text-red-600 transition-colors flex items-start gap-1.5 group"
              >
                <span className="font-mono text-xs text-foreground/70 shrink-0 pt-0.5">
                  {i + 1}.
                </span>
                <span className="group-hover:underline leading-snug">{h.text}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
