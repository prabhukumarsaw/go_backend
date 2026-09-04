import { Node, mergeAttributes } from "@tiptap/react";

export type ColumnLayout = "2-equal" | "25-75" | "75-25" | "3-equal" | "25-50-25";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    columns: {
      insertColumns: (layout: ColumnLayout) => ReturnType;
      deleteColumns: () => ReturnType;
    };
  }
}

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      layout: {
        default: "2-equal",
        parseHTML: (element) => element.getAttribute("data-layout") || "2-equal",
        renderHTML: (attributes) => ({
          "data-layout": attributes.layout,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const layout = (HTMLAttributes["data-layout"] || "2-equal") as ColumnLayout;

    let gridStyle = "grid-template-columns: repeat(2, 1fr);";
    if (layout === "25-75") {
      gridStyle = "grid-template-columns: 1fr 3fr;";
    } else if (layout === "75-25") {
      gridStyle = "grid-template-columns: 3fr 1fr;";
    } else if (layout === "3-equal") {
      gridStyle = "grid-template-columns: repeat(3, 1fr);";
    } else if (layout === "25-50-25") {
      gridStyle = "grid-template-columns: 1fr 2fr 1fr;";
    }

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "columns",
        class:
          "tiptap-columns grid gap-3.5 my-4 p-2.5 rounded-xl border border-dashed border-border/70 bg-muted/15 transition-all",
        style: gridStyle,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertColumns:
        (layout: ColumnLayout) =>
        ({ commands }) => {
          let colsCount = 2;
          if (layout === "3-equal" || layout === "25-50-25") {
            colsCount = 3;
          }

          const columns = Array.from({ length: colsCount }, () => ({
            type: "column",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Write column content…" }],
              },
            ],
          }));

          return commands.insertContent({
            type: "columns",
            attrs: { layout },
            content: columns,
          });
        },
      deleteColumns:
        () =>
        ({ commands }) => {
          return commands.deleteNode("columns");
        },
    };
  },
});

export const Column = Node.create({
  name: "column",
  content: "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column",
        class:
          "tiptap-column min-w-0 p-2 rounded-lg border border-border/50 bg-background/80 shadow-2xs focus-within:ring-1 focus-within:ring-primary/40 transition-all",
      }),
      0,
    ];
  },
});
