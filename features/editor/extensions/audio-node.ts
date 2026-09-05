import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AudioNodeView } from "../components/audio-node-view";

export interface AudioOptions {
  HTMLAttributes?: Record<string, any>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: {
        src: string;
        title?: string;
        author?: string;
        caption?: string;
      }) => ReturnType;
    };
  }
}

export const AudioNode = Node.create<AudioOptions>({
  name: "audio",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-src") || element.getAttribute("src") || "",
        renderHTML: (attributes) => ({
          "data-src": attributes.src,
        }),
      },
      title: {
        default: "Audio Clip / Interview Recording",
        parseHTML: (element) => element.getAttribute("data-title") || "Audio Clip",
        renderHTML: (attributes) => ({
          "data-title": attributes.title,
        }),
      },
      author: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-author") || "",
        renderHTML: (attributes) => ({
          "data-author": attributes.author,
        }),
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") || "",
        renderHTML: (attributes) => ({
          "data-caption": attributes.caption,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="audio"]',
      },
      {
        tag: "audio",
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          const audio = node as HTMLAudioElement;
          return {
            src: audio.getAttribute("src"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes["data-src"] || "";
    const title = HTMLAttributes["data-title"] || "Audio Clip";

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes || {}, HTMLAttributes, {
        "data-type": "audio",
        class: "tiptap-audio not-prose my-6 mx-auto max-w-xl rounded-xl border border-border p-4 bg-card",
      }),
      [
        "div",
        { class: "flex items-center gap-2 mb-2" },
        ["span", { class: "text-xs font-semibold text-primary" }, "🎙️ " + title],
      ],
      [
        "audio",
        {
          controls: "true",
          src,
          class: "w-full",
          preload: "metadata",
        },
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView);
  },

  addCommands() {
    return {
      setAudio:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
