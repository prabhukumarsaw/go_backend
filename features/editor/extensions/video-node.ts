import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { VideoNodeView } from "../components/video-node-view";

export interface VideoOptions {
  HTMLAttributes?: Record<string, any>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: {
        src: string;
        title?: string;
        caption?: string;
        width?: string;
      }) => ReturnType;
    };
  }
}

export const VideoNode = Node.create<VideoOptions>({
  name: "video",
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
        default: "Editorial Short Video",
        parseHTML: (element) => element.getAttribute("data-title") || "Editorial Short Video",
        renderHTML: (attributes) => ({
          "data-title": attributes.title,
        }),
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") || "",
        renderHTML: (attributes) => ({
          "data-caption": attributes.caption,
        }),
      },
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-width") || "100%",
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video"]',
      },
      {
        tag: "video",
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          const video = node as HTMLVideoElement;
          return {
            src: video.getAttribute("src"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes["data-src"] || "";
    const title = HTMLAttributes["data-title"] || "Editorial Short Video";
    const caption = HTMLAttributes["data-caption"] || "";

    return [
      "figure",
      mergeAttributes(this.options.HTMLAttributes || {}, HTMLAttributes, {
        "data-type": "video",
        class: "tiptap-video not-prose my-6 mx-auto rounded-xl overflow-hidden border border-border bg-black",
      }),
      [
        "video",
        {
          controls: "true",
          playsinline: "true",
          preload: "metadata",
          src,
          class: "w-full aspect-video object-contain",
        },
      ],
      caption
        ? [
            "figcaption",
            { class: "p-2 text-xs text-muted-foreground text-center bg-card italic" },
            caption,
          ]
        : ["span", { class: "hidden" }, title],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },

  addCommands() {
    return {
      setVideo:
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
