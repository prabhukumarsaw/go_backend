import { Node as TiptapNode, mergeAttributes } from "@tiptap/react";

/**
 * Custom TipTap Node for embedding responsive iframes (e.g., X / Twitter, Facebook, widgets).
 */
export const Iframe = TiptapNode.create({
  name: "iframe",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: "Embedded content" },
      frameborder: { default: "0" },
      allowfullscreen: { default: true },
      width: { default: "100%" },
      height: { default: "400" },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return [
      "div",
      {
        class: "my-4 rounded-lg overflow-hidden border bg-muted/20",
        style: "position:relative",
      },
      [
        "iframe",
        mergeAttributes(HTMLAttributes, {
          class: "w-full",
          style: `height:${HTMLAttributes.height || 400}px`,
          loading: "lazy",
        }),
      ],
    ];
  },
});
