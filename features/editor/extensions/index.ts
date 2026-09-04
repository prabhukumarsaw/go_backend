import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { Underline } from "@tiptap/extension-underline";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Typography } from "@tiptap/extension-typography";

import { ResizableImage } from "./resizable-image";
import { Columns, Column } from "./columns-node";
import { PollNode } from "./poll-node";
import { CustomTableCell, CustomTableHeader } from "./custom-table-cell";
import { Iframe } from "./iframe-node";

export { Iframe, ResizableImage, Columns, Column, PollNode, CustomTableCell, CustomTableHeader };

export function getEditorExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder: "Write your article body here… Use markdown or toolbar to format.",
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline underline-offset-4 hover:text-primary/80",
      },
    }),
    ResizableImage.configure({
      inline: false,
    }),
    Youtube.configure({
      inline: false,
      HTMLAttributes: {
        class: "rounded-lg overflow-hidden my-4",
      },
      width: 640,
      height: 360,
    }),
    Iframe,
    Columns,
    Column,
    PollNode,
    Table.configure({
      resizable: true,
      lastColumnResizable: true,
      handleWidth: 7,
      cellMinWidth: 50,
      renderWrapper: true,
      HTMLAttributes: {
        class: "border-collapse border border-border text-xs rounded-lg shadow-2xs",
      },
    }),
    TableRow,
    CustomTableCell,
    CustomTableHeader,
    Underline,
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    CharacterCount,
    Typography,
  ];
}
