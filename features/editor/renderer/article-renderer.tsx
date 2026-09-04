import React from "react";
import Image from "next/image";

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

interface ArticleRendererProps {
  content: unknown;
  className?: string;
}

export function ArticleRenderer({ content, className = "" }: ArticleRendererProps) {
  if (!content) return null;

  let doc: TipTapNode;
  try {
    doc = typeof content === "string" ? JSON.parse(content) : (content as TipTapNode);
  } catch {
    return <div className="article-content">{String(content)}</div>;
  }

  if (!doc?.content || !Array.isArray(doc.content)) {
    return null;
  }

  return (
    <article className={`article-content ${className}`}>
      {doc.content.map((node, index) => (
        <NodeRenderer key={index} node={node} />
      ))}
    </article>
  );
}

function NodeRenderer({ node }: { node: TipTapNode }): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p>
          <InlineContent marksAndText={node.content} />
        </p>
      );

    case "heading": {
      const level = node.attrs?.level || 2;
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag>
          <InlineContent marksAndText={node.content} />
        </Tag>
      );
    }

    case "blockquote":
      return (
        <blockquote>
          {node.content?.map((child, index) => (
            <NodeRenderer key={index} node={child} />
          ))}
        </blockquote>
      );

    case "bulletList":
      return (
        <ul className="list-disc pl-6 my-4 space-y-1">
          {node.content?.map((child, index) => (
            <li key={index}>
              {child.content?.map((item, itemIdx) => (
                <NodeRenderer key={itemIdx} node={item} />
              ))}
            </li>
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="list-decimal pl-6 my-4 space-y-1">
          {node.content?.map((child, index) => (
            <li key={index}>
              {child.content?.map((item, itemIdx) => (
                <NodeRenderer key={itemIdx} node={item} />
              ))}
            </li>
          ))}
        </ol>
      );

    case "image":
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={node.attrs?.src}
            alt={node.attrs?.alt || "Article image"}
            className="rounded-lg w-full h-auto object-cover"
          />
          {node.attrs?.title && (
            <figcaption className="text-xs text-muted-foreground mt-2 text-center">
              {node.attrs.title}
            </figcaption>
          )}
        </figure>
      );

    case "table":
      return (
        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse border border-border text-sm">
            <tbody>
              {node.content?.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-border">
                  {row.content?.map((cell, cellIdx) => {
                    const isHeader = cell.type === "tableHeader";
                    const CellTag = isHeader ? "th" : "td";
                    return (
                      <CellTag
                        key={cellIdx}
                        className={`p-2 border border-border ${
                          isHeader ? "bg-muted font-semibold text-left" : ""
                        }`}
                      >
                        {cell.content?.map((child, childIdx) => (
                          <NodeRenderer key={childIdx} node={child} />
                        ))}
                      </CellTag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "horizontalRule":
      return <hr className="my-8 border-border" />;

    default:
      return null;
  }
}

function InlineContent({
  marksAndText,
}: {
  marksAndText?: TipTapNode[];
}): React.ReactNode {
  if (!marksAndText || !Array.isArray(marksAndText)) return null;

  return marksAndText.map((item, index) => {
    if (item.type !== "text") return null;

    let content: React.ReactNode = item.text;

    if (item.marks && Array.isArray(item.marks)) {
      for (const mark of item.marks) {
        if (mark.type === "bold") {
          content = <strong key={mark.type}>{content}</strong>;
        } else if (mark.type === "italic") {
          content = <em key={mark.type}>{content}</em>;
        } else if (mark.type === "underline") {
          content = <u key={mark.type}>{content}</u>;
        } else if (mark.type === "link") {
          content = (
            <a
              key={mark.type}
              href={mark.attrs?.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:opacity-80"
            >
              {content}
            </a>
          );
        }
      }
    }

    return <React.Fragment key={index}>{content}</React.Fragment>;
  });
}
