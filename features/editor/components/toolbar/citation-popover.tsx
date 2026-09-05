"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import { IconBookmark, IconPlus, IconExternalLink } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function CitationPopover({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [citationNumber, setCitationNumber] = React.useState("1");
  const [sourceTitle, setSourceTitle] = React.useState("");
  const [sourceUrl, setSourceUrl] = React.useState("");

  // Auto-detect next citation number when opened
  React.useEffect(() => {
    if (isOpen && editor) {
      const html = editor.getHTML();
      const matches = html.match(/data-footnote="(\d+)"/g);
      if (matches && matches.length > 0) {
        setCitationNumber(String(matches.length + 1));
      } else {
        setCitationNumber("1");
      }
    }
  }, [isOpen, editor]);

  const handleInsertCitation = () => {
    if (!sourceTitle.trim()) return;

    const num = citationNumber || "1";
    const title = sourceTitle.trim();
    const url = sourceUrl.trim();

    // 1. Insert inline citation superscript at current cursor
    const inlineHtml = `<sup class="tiptap-citation font-mono text-[11px] font-bold text-primary hover:underline select-none" data-footnote="${num}"><a href="#fn-${num}" title="${title}">[${num}]</a></sup>&nbsp;`;
    editor.chain().focus().insertContent(inlineHtml).run();

    // 2. Check if a Sources & Citations section already exists at document bottom
    const docHtml = editor.getHTML();
    const hasFootnotesSection = docHtml.includes('data-type="citations-section"');

    const sourceItemHtml = `<li id="fn-${num}" class="pl-1"><strong>[${num}]</strong> ${title}${
      url ? ` — <a href="${url}" target="_blank" rel="noopener noreferrer" class="underline text-primary hover:text-primary/80">${url}</a>` : ""
    }</li>`;

    if (!hasFootnotesSection) {
      // Create new citations container at bottom
      const citationsContainer = `
        <div data-type="citations-section" class="my-8 rounded-xl border border-border/80 bg-muted/20 p-4 not-prose">
          <div class="flex items-center gap-1.5 pb-2 mb-2.5 border-b border-border/50 text-xs font-semibold text-foreground">
            <span>📚 Sources, Citations & Fact-Check Notes</span>
          </div>
          <ol class="citations-list list-decimal pl-5 space-y-1.5 text-xs text-muted-foreground">
            ${sourceItemHtml}
          </ol>
        </div>
      `;
      editor.commands.insertContentAt(editor.state.doc.content.size, citationsContainer);
    } else {
      // Append citation into existing list
      const updatedHtml = docHtml.replace(
        /<\/ol>\s*<\/div>\s*$/,
        `${sourceItemHtml}</ol></div>`
      );
      if (updatedHtml !== docHtml) {
        editor.commands.setContent(updatedHtml);
      }
    }

    setSourceTitle("");
    setSourceUrl("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-colors shrink-0 cursor-pointer"
        title="Insert Footnote & Citation Reference"
      >
        <IconBookmark className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3.5 space-y-3" align="start">
        <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
          <IconBookmark className="h-4 w-4 text-sky-600" />
          <p className="text-xs font-semibold">Add Footnote & Source Citation</p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="w-20 space-y-1">
              <Label className="text-[11px] text-muted-foreground">Index</Label>
              <Input
                className="h-7 text-xs font-mono text-center"
                value={citationNumber}
                onChange={(e) => setCitationNumber(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-[11px] text-muted-foreground">Citation / Source Name</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g. Reuters Investigative Report"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Source URL (Optional)</Label>
            <Input
              className="h-7 text-xs font-mono"
              placeholder="https://reuters.com/article/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-1">
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs gap-1 px-3 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
            onClick={handleInsertCitation}
            disabled={!sourceTitle.trim()}
          >
            <IconPlus className="h-3 w-3" />
            Add Citation [{citationNumber}]
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
