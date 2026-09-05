import { Node, mergeAttributes } from "@tiptap/react";

export type CalloutType =
  | "breaking"
  | "tip"
  | "stat"
  | "warning"
  | "factcheck"
  | "editor_note"
  | "tldr"
  | "quote"
  | "timeline"
  | "source_archive";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (options: { type: CalloutType; content?: any[] }) => ReturnType;
      toggleCallout: (options: { type: CalloutType }) => ReturnType;
    };
  }
}

export const CalloutNode = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      type: {
        default: "tip",
        parseHTML: (element) => element.getAttribute("data-callout-type") || "tip",
        renderHTML: (attributes) => ({
          "data-callout-type": attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes["data-callout-type"] || "tip";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "callout",
        class: `tiptap-callout tiptap-callout-${type} not-prose`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        ({ type, content }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { type },
            content: content || [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Write callout content here…" }],
              },
            ],
          });
        },
      toggleCallout:
        ({ type }) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { type });
        },
    };
  },
});
