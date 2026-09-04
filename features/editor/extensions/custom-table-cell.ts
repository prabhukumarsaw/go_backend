import { TableCell as BaseTableCell } from "@tiptap/extension-table-cell";
import { TableHeader as BaseTableHeader } from "@tiptap/extension-table-header";

export const CustomTableCell = BaseTableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor};`,
          };
        },
      },
      verticalAlign: {
        default: "top",
        parseHTML: (element) => element.style.verticalAlign || "top",
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign || attributes.verticalAlign === "top") return {};
          return {
            style: `vertical-align: ${attributes.verticalAlign};`,
          };
        },
      },
    };
  },
});

export const CustomTableHeader = BaseTableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return {
            style: `background-color: ${attributes.backgroundColor};`,
          };
        },
      },
      verticalAlign: {
        default: "top",
        parseHTML: (element) => element.style.verticalAlign || "top",
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign || attributes.verticalAlign === "top") return {};
          return {
            style: `vertical-align: ${attributes.verticalAlign};`,
          };
        },
      },
    };
  },
});
