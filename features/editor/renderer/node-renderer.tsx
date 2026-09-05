"use client";

import React from "react";
import type { TipTapNode } from "./types";
import { ParagraphNode } from "./nodes/paragraph-node";
import { HeadingNode } from "./nodes/heading-node";
import { CalloutNode } from "./nodes/callout-node";
import { MediaNode } from "./nodes/media-node";
import { EmbedNode } from "./nodes/embed-node";
import { TableNode } from "./nodes/table-node";
import { ListNode } from "./nodes/list-node";
import { CodeBlockNode } from "./nodes/code-block-node";
import { PollNodeComponent } from "./nodes/poll-node";
import { ColumnNode } from "./nodes/column-node";
import { QuoteNode } from "./nodes/quote-node";
import { DividerNode } from "./nodes/divider-node";

interface NodeRendererProps {
  node: TipTapNode;
}

export function NodeRenderer({ node }: NodeRendererProps): React.ReactNode {
  const renderChildren = (children?: TipTapNode[]) => {
    if (!children || !Array.isArray(children)) return null;
    return children.map((child, index) => (
      <NodeRenderer key={index} node={child} />
    ));
  };

  switch (node.type) {
    case "paragraph":
      return <ParagraphNode node={node} />;

    case "heading":
      return <HeadingNode node={node} />;

    case "blockquote":
      return <QuoteNode node={node} renderChildren={renderChildren} />;

    case "callout":
      return <CalloutNode node={node} renderChildren={renderChildren} />;

    case "image":
    case "resizableImage":
    case "audio":
    case "video":
      return <MediaNode node={node} />;

    case "youtube":
    case "iframe":
      return <EmbedNode node={node} />;

    case "table":
      return <TableNode node={node} renderChildren={renderChildren} />;

    case "bulletList":
    case "orderedList":
    case "taskList":
    case "taskItem":
      return <ListNode node={node} renderChildren={renderChildren} />;

    case "codeBlock":
      return <CodeBlockNode node={node} />;

    case "poll":
      return <PollNodeComponent node={node} />;

    case "columns":
    case "column":
      return <ColumnNode node={node} renderChildren={renderChildren} />;

    case "horizontalRule":
    case "hardBreak":
      return <DividerNode node={node} />;

    default:
      if (node.content && Array.isArray(node.content)) {
        return <div className="my-2">{renderChildren(node.content)}</div>;
      }
      return null;
  }
}
