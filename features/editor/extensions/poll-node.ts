import { Node, mergeAttributes } from "@tiptap/react";

export interface PollOptionAttr {
  id: number;
  text: string;
  votes?: number;
  percentage?: number;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    poll: {
      insertPoll: (options: {
        pollId?: string;
        question: string;
        options: PollOptionAttr[];
        totalVotes?: number;
      }) => ReturnType;
    };
  }
}

export const PollNode = Node.create({
  name: "poll",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      pollId: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-poll-id") || "",
        renderHTML: (attributes) => ({
          "data-poll-id": attributes.pollId,
        }),
      },
      question: {
        default: "What is your opinion on this topic?",
        parseHTML: (element) => element.getAttribute("data-question") || "Reader Poll",
        renderHTML: (attributes) => ({
          "data-question": attributes.question,
        }),
      },
      options: {
        default: [
          { id: 1, text: "Strongly Agree", votes: 42, percentage: 65 },
          { id: 2, text: "Strongly Disagree", votes: 23, percentage: 35 },
        ],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-options");
          if (raw) {
            try {
              return JSON.parse(raw);
            } catch {
              return [];
            }
          }
          return [];
        },
        renderHTML: (attributes) => ({
          "data-options": JSON.stringify(attributes.options),
        }),
      },
      totalVotes: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute("data-total-votes") || 0),
        renderHTML: (attributes) => ({
          "data-total-votes": attributes.totalVotes,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="poll"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const question = HTMLAttributes["data-question"] || "Reader Poll";
    let options: PollOptionAttr[] = [];
    try {
      options = JSON.parse(HTMLAttributes["data-options"] || "[]");
    } catch {
      options = [];
    }
    const totalVotes = HTMLAttributes["data-total-votes"] || 0;

    // Build options HTML
    const optionsHtml = options
      .map((opt) => {
        const pct = opt.percentage || 0;
        return `
          <div class="poll-option-item relative overflow-hidden rounded-lg border border-border/70 bg-background/60 p-2.5 my-1.5 transition-all">
            <div class="poll-option-progress absolute inset-y-0 left-0 bg-primary/10 transition-all" style="width: ${pct}%;"></div>
            <div class="relative flex items-center justify-between text-xs font-medium">
              <span class="flex items-center gap-2">
                <span class="h-3.5 w-3.5 rounded-full border border-primary/50 flex items-center justify-center shrink-0"></span>
                <span>${opt.text}</span>
              </span>
              <span class="font-mono text-muted-foreground text-[11px]">${pct}% (${opt.votes || 0})</span>
            </div>
          </div>
        `;
      })
      .join("");

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "poll",
        class:
          "tiptap-poll not-prose my-6 mx-auto max-w-xl rounded-xl border border-primary/25 bg-card p-4 shadow-sm select-none",
      }),
      [
        "div",
        { class: "flex items-center justify-between pb-2 mb-2 border-b border-border/50" },
        [
          "span",
          {
            class:
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold tracking-wide uppercase",
          },
          "📊 Reader Opinion Poll",
        ],
        ["span", { class: "text-[11px] font-mono text-muted-foreground" }, `${totalVotes} Votes Total`],
      ],
      ["h4", { class: "text-sm sm:text-base font-semibold text-foreground my-2" }, question],
      ["div", { class: "poll-options-list space-y-1.5 my-3" }, ["rawHtmlContainer", {}, ""]],
      [
        "div",
        { class: "flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground" },
        ["span", {}, "🔒 Verified community response"],
        ["span", { class: "font-mono" }, "Live Poll"],
      ],
    ];
  },

  addCommands() {
    return {
      insertPoll:
        ({ pollId, question, options, totalVotes = 0 }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: "poll",
            attrs: {
              pollId: pollId || "",
              question,
              options,
              totalVotes,
            },
          });
        },
    };
  },
});
