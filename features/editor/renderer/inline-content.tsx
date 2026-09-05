"use client";

import React from "react";
import type { TipTapNode } from "./types";

interface InlineContentProps {
  marksAndText?: TipTapNode[];
}

export function InlineContent({ marksAndText }: InlineContentProps): React.ReactNode {
  if (!marksAndText || !Array.isArray(marksAndText)) return null;

  return marksAndText.map((item, index) => {
    if (item.type === "hardBreak") {
      return <br key={`br-${index}`} className="my-0.5" />;
    }

    if (item.type !== "text") return null;

    let content: React.ReactNode = item.text || "";
    let inlineStyles: React.CSSProperties = {};

    if (item.marks && Array.isArray(item.marks)) {
      for (const mark of item.marks) {
        switch (mark.type) {
          case "bold":
            content = (
              <strong key={mark.type} className="font-bold text-foreground">
                {content}
              </strong>
            );
            break;

          case "italic":
            content = (
              <em key={mark.type} className="italic">
                {content}
              </em>
            );
            break;

          case "underline":
            content = (
              <u key={mark.type} className="underline underline-offset-3">
                {content}
              </u>
            );
            break;

          case "strike":
            content = (
              <s key={mark.type} className="line-through text-muted-foreground/80">
                {content}
              </s>
            );
            break;

          case "code":
            content = (
              <code
                key={mark.type}
                className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.88em] text-red-600 dark:text-red-400 font-medium border border-border/40"
              >
                {content}
              </code>
            );
            break;

          case "highlight": {
            const color = mark.attrs?.color;
            content = (
              <mark
                key={mark.type}
                style={color ? { backgroundColor: color } : undefined}
                className={
                  color
                    ? "px-1.5 py-0.5 rounded text-foreground"
                    : "bg-amber-200/75 dark:bg-amber-500/30 text-foreground px-1.5 py-0.5 rounded"
                }
              >
                {content}
              </mark>
            );
            break;
          }

          case "textStyle": {
            const color = mark.attrs?.color;
            const fontFamily = mark.attrs?.fontFamily;
            const fontSize = mark.attrs?.fontSize;
            if (color) inlineStyles.color = color;
            if (fontFamily) inlineStyles.fontFamily = fontFamily;
            if (fontSize) inlineStyles.fontSize = fontSize;
            break;
          }

          case "link": {
            const href = mark.attrs?.href || "#";
            const isExternal = href.startsWith("http");
            content = (
              <a
                key={mark.type}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-red-600 dark:text-red-400 underline underline-offset-4 decoration-red-600/40 hover:decoration-red-600 font-medium transition-colors"
              >
                {content}
              </a>
            );
            break;
          }

          case "subscript":
            content = (
              <sub key={mark.type} className="text-[0.75em] leading-none">
                {content}
              </sub>
            );
            break;

          case "superscript":
            content = (
              <sup key={mark.type} className="text-[0.75em] leading-none">
                {content}
              </sup>
            );
            break;

          default:
            break;
        }
      }
    }

    if (Object.keys(inlineStyles).length > 0) {
      content = <span style={inlineStyles}>{content}</span>;
    }

    return <React.Fragment key={index}>{content}</React.Fragment>;
  });
}
