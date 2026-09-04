import { Image as BaseImage } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageView } from "../components/resizable-image-view";

export interface ResizableImageOptions {
  inline?: boolean;
  allowBase64?: boolean;
  HTMLAttributes?: Record<string, any>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    resizableImage: {
      setImageWidth: (width: string) => ReturnType;
      setImageAlignment: (alignment: "left" | "center" | "right" | "inline" | "full") => ReturnType;
    };
  }
}

export const ResizableImage = BaseImage.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "50%",
        parseHTML: (element) => element.getAttribute("data-width") || element.style.width || "50%",
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
        }),
      },
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => ({
          "data-alignment": attributes.alignment,
        }),
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") || "",
        renderHTML: (attributes) => ({
          alt: attributes.alt,
        }),
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageWidth:
        (width: string) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { width });
        },
      setImageAlignment:
        (alignment: "left" | "center" | "right" | "inline" | "full") =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { alignment });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  renderHTML({ HTMLAttributes }) {
    const { width = "50%", alignment = "center", src, alt = "", ...rest } = HTMLAttributes;

    let style = "";
    let extraClass = "rounded-lg transition-all duration-200 shadow-xs cursor-pointer";

    if (alignment === "left") {
      style = `width: ${width}; max-width: 100%; float: left; margin: 0.5rem 1.25rem 0.75rem 0; clear: left;`;
    } else if (alignment === "right") {
      style = `width: ${width}; max-width: 100%; float: right; margin: 0.5rem 0 0.75rem 1.25rem; clear: right;`;
    } else if (alignment === "inline") {
      style = `width: ${width}; max-width: 100%; display: inline-block; vertical-align: middle; margin: 0 0.5rem;`;
    } else if (alignment === "full") {
      style = "width: 100%; max-width: 100%; display: block; margin: 1.25rem 0; clear: both;";
    } else {
      // default: center
      style = `width: ${width}; max-width: 100%; display: block; margin: 1.25rem auto; clear: both;`;
    }

    return [
      "img",
      {
        ...rest,
        src,
        alt,
        "data-width": width,
        "data-alignment": alignment,
        style,
        class: extraClass,
      },
    ];
  },
});
