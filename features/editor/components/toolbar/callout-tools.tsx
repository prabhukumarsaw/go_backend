"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconChartLine,
  IconAlertCircle,
  IconBulb,
  IconFlame,
  IconShieldCheck,
  IconNotes,
  IconBook2,
  IconQuote,
  IconHistory,
  IconArchive,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { CalloutType } from "../../extensions/callout-node";

interface CalloutToolsProps {
  editor: Editor;
}

export function CalloutTools({ editor }: CalloutToolsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const insertCallout = (type: CalloutType) => {
    let content: any[] = [];
    if (type === "stat") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "₹10,000 Cr+",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Key Financial / Demographic Statistic",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "italic" }],
              text: "Source: Official Ministry Gazette / Government Press Release",
            },
          ],
        },
      ];
    } else if (type === "quote") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "“In journalism, truth isn't just an option—it is the foundational pillar of democracy.”",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "— CHIEF INVESTIGATIVE CORRESPONDENT",
            },
          ],
        },
      ];
    } else if (type === "timeline") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "⏱️ KEY EVENT SEQUENCE & TIMELINE",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "09:30 AM — ",
            },
            {
              type: "text",
              text: "Special parliamentary session convened.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "12:15 PM — ",
            },
            {
              type: "text",
              text: "Official resolution approved by voice vote.",
            },
          ],
        },
      ];
    } else if (type === "source_archive") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "📁 PRIMARY SOURCE ARCHIVE & GAZETTE RECORD",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Document Ref: Ministry Gazette Notification No. 402/2026. Verified via the National Archives digital portal.",
            },
          ],
        },
      ];
    } else if (type === "breaking") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "🔴 BREAKING NEWS ALERT: ",
            },
            {
              type: "text",
              text: "Urgent headline developments and breaking facts as confirmed by authorities…",
            },
          ],
        },
      ];
    } else if (type === "tip") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "💡 BACKGROUND & EXPLAINER: ",
            },
            {
              type: "text",
              text: "Essential context and background information readers need to understand this story…",
            },
          ],
        },
      ];
    } else if (type === "warning") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "⚠️ OFFICIAL CLARIFICATION / CORRECTION NOTE: ",
            },
            {
              type: "text",
              text: "Clarification issued by the editorial board following primary source verification…",
            },
          ],
        },
      ];
    } else if (type === "factcheck") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "✓ FACT-CHECK VERIFIED: ",
            },
            {
              type: "text",
              text: 'Claim: "Insert tested public statement here" — Verdict: True (Supported by primary evidence and audited data).',
            },
          ],
        },
      ];
    } else if (type === "editor_note") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "📝 INTERNAL EDITORIAL NOTE: ",
            },
            {
              type: "text",
              text: "Verify second source on key quote before final publishing sign-off. Cross-check image rights.",
            },
          ],
        },
      ];
    } else if (type === "tldr") {
      content = [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "📌 THE 60-SECOND SUMMARY (TL;DR):",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "• Core development and primary impact on citizens.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "• Response and statements from key stakeholders.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "• Upcoming timeline and next steps to watch.",
            },
          ],
        },
      ];
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: "callout",
        attrs: { type },
        content,
      })
      .run();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted hover:text-foreground text-muted-foreground transition-colors shrink-0 cursor-pointer"
        title="Insert Editorial & Journalism Blocks"
      >
        <IconChartLine className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-1.5 space-y-0.5" align="start">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
          Editorial & Journalism Blocks
        </p>

        {/* TL;DR */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("tldr")}
        >
          <IconBook2 className="h-4 w-4 text-primary shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">TL;DR Summary Card</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Structured 60-second summary box</span>
          </div>
        </Button>

        {/* Fact-Check */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("factcheck")}
        >
          <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">Fact-Check Box</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Claim & verified verdict badge</span>
          </div>
        </Button>

        {/* Big Stat */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("stat")}
        >
          <IconChartLine className="h-4 w-4 text-emerald-500 shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">Big Stat Callout</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Key data metric & source line</span>
          </div>
        </Button>

        {/* Pull Quote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("quote")}
        >
          <IconQuote className="h-4 w-4 text-amber-500 shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">Interview Pull Quote</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Styled quote with byline attribution</span>
          </div>
        </Button>

        {/* Timeline */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("timeline")}
        >
          <IconHistory className="h-4 w-4 text-sky-500 shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">Event Timeline</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Chronological sequence of events</span>
          </div>
        </Button>

        {/* Source Archive */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("source_archive")}
        >
          <IconArchive className="h-4 w-4 text-sky-600 shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">Source Document Archive</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Official gazette or records record</span>
          </div>
        </Button>

        {/* Breaking News */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("breaking")}
        >
          <IconFlame className="h-4 w-4 text-red-500 shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">Breaking News Alert</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Red urgency banner</span>
          </div>
        </Button>

        {/* Explainer */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("tip")}
        >
          <IconBulb className="h-4 w-4 text-blue-500 shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">Background Explainer</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Context & takeaway box</span>
          </div>
        </Button>

        {/* Internal Review Note */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-auto py-1.5 px-2 gap-2.5 cursor-pointer rounded-md"
          onClick={() => insertCallout("editor_note")}
        >
          <IconNotes className="h-4 w-4 text-violet-500 shrink-0" />
          <div className="flex flex-col text-left min-w-0">
            <span className="font-semibold leading-tight text-xs">Internal Editorial Note</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Pre-publish review checklist</span>
          </div>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
