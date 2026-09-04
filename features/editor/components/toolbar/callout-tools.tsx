"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconChartLine,
  IconAlertCircle,
  IconBulb,
  IconFlame,
  IconQuote,
  IconChecklist,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CalloutToolsProps {
  editor: Editor;
}

export function CalloutTools({ editor }: CalloutToolsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const insertCallout = (type: "breaking" | "tip" | "stat" | "warning") => {
    let content = "";
    if (type === "breaking") {
      content = `
        <div class="my-4 rounded-xl border-l-4 border-red-500 bg-red-500/10 p-4 dark:bg-red-950/20">
          <p class="font-bold text-red-600 dark:text-red-400 text-xs uppercase tracking-wider m-0">🔴 BREAKING NEWS</p>
          <p class="mt-1 mb-0 text-sm font-medium">Add key breaking alert details here…</p>
        </div>
      `;
    } else if (type === "stat") {
      content = `
        <div class="my-6 rounded-xl border bg-muted/40 p-5 text-center sm:text-left sm:flex sm:items-center sm:gap-6">
          <div class="text-3xl font-black text-primary font-mono tracking-tight">₹10,000 Cr+</div>
          <div class="border-t sm:border-t-0 sm:border-l sm:pl-6 mt-3 sm:mt-0 pt-3 sm:pt-0">
            <p class="font-semibold text-sm m-0">Key Financial / Demographic Statistic</p>
            <p class="text-xs text-muted-foreground m-0 mt-0.5">Source: Government Press Release / Official Data</p>
          </div>
        </div>
      `;
    } else if (type === "tip") {
      content = `
        <div class="my-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/10 p-4 dark:bg-blue-950/20">
          <p class="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider m-0">💡 EXPLAINER / KEY TAKEAWAY</p>
          <p class="mt-1 mb-0 text-sm">Add explainer note or key background context for readers…</p>
        </div>
      `;
    } else if (type === "warning") {
      content = `
        <div class="my-4 rounded-xl border-l-4 border-amber-500 bg-amber-500/10 p-4 dark:bg-amber-950/20">
          <p class="font-bold text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wider m-0">⚠️ CORRECTION / VERIFICATION NOTE</p>
          <p class="mt-1 mb-0 text-sm">Fact-check context or official clarification statement…</p>
        </div>
      `;
    }

    editor.chain().focus().insertContent(content).run();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted hover:text-foreground text-muted-foreground transition-colors shrink-0"
        title="Insert Callout, Stat Box, or Highlight"
      >
        <IconChartLine className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 space-y-1" align="start">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
          Editorial Blocks & Infographics
        </p>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-8 gap-2.5"
          onClick={() => insertCallout("stat")}
        >
          <IconChartLine className="h-4 w-4 text-emerald-500" />
          <div className="flex flex-col text-left">
            <span className="font-semibold">Big Stat Callout</span>
            <span className="text-[10px] text-muted-foreground">Key numbers & metrics box</span>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-8 gap-2.5"
          onClick={() => insertCallout("breaking")}
        >
          <IconFlame className="h-4 w-4 text-red-500" />
          <div className="flex flex-col text-left">
            <span className="font-semibold">Breaking Alert Banner</span>
            <span className="text-[10px] text-muted-foreground">Red urgent news callout</span>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-8 gap-2.5"
          onClick={() => insertCallout("tip")}
        >
          <IconBulb className="h-4 w-4 text-blue-500" />
          <div className="flex flex-col text-left">
            <span className="font-semibold">Key Takeaway Box</span>
            <span className="text-[10px] text-muted-foreground">Blue explainer highlight</span>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-8 gap-2.5"
          onClick={() => insertCallout("warning")}
        >
          <IconAlertCircle className="h-4 w-4 text-amber-500" />
          <div className="flex flex-col text-left">
            <span className="font-semibold">Verification Note</span>
            <span className="text-[10px] text-muted-foreground">Fact check or correction note</span>
          </div>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
