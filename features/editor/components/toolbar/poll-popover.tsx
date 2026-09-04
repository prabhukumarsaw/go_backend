"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  IconChartBar,
  IconPlus,
  IconTrash,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/config/env";

interface PollPopoverProps {
  editor: Editor;
}

export function PollPopover({ editor }: PollPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"active" | "custom">("active");
  const [loadingActive, setLoadingActive] = React.useState(false);
  const [activePoll, setActivePoll] = React.useState<any>(null);

  // Custom Poll State
  const [question, setQuestion] = React.useState("");
  const [options, setOptions] = React.useState<string[]>([
    "Yes, fully agree",
    "No, disagree",
  ]);

  // Fetch active poll when popover opens
  React.useEffect(() => {
    if (isOpen) {
      setLoadingActive(true);
      fetch(`${env.NEXT_PUBLIC_API_URL}/polls/active`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.data) {
            setActivePoll(data.data);
          } else {
            setActivePoll(null);
          }
        })
        .catch(() => setActivePoll(null))
        .finally(() => setLoadingActive(false));
    }
  }, [isOpen]);

  const handleInsertActivePoll = () => {
    if (!activePoll) return;

    editor
      .chain()
      .focus()
      .insertPoll({
        pollId: activePoll.id,
        question: activePoll.question,
        options: (activePoll.options || []).map((o: any) => ({
          id: o.id,
          text: o.text,
          votes: o.votes || 0,
          percentage: o.percentage || 0,
        })),
        totalVotes: activePoll.total_votes || 0,
      })
      .run();

    setIsOpen(false);
  };

  const handleInsertCustomPoll = () => {
    const q = question.trim() || "What is your opinion on this topic?";
    const validOptions = options
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: idx + 1,
        text,
        votes: 0,
        percentage: 0,
      }));

    if (validOptions.length < 2) return;

    editor
      .chain()
      .focus()
      .insertPoll({
        question: q,
        options: validOptions,
        totalVotes: 0,
      })
      .run();

    setQuestion("");
    setOptions(["Yes, fully agree", "No, disagree"]);
    setIsOpen(false);
  };

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        title="Insert Reader Poll"
      >
        <IconChartBar className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 space-y-3 shadow-xl rounded-xl" align="start">
        <div className="flex items-center justify-between pb-1.5 border-b">
          <p className="text-xs font-semibold">Insert Reader Poll</p>
          <div className="flex rounded-md bg-muted/60 p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                activeTab === "active"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active Poll
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                activeTab === "custom"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {activeTab === "active" ? (
          <div className="space-y-2.5">
            {loadingActive ? (
              <div className="py-6 flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <IconLoader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Checking newsroom active poll…</span>
              </div>
            ) : activePoll ? (
              <div className="space-y-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <IconSparkles className="h-3 w-3" />
                  <span>Live Newsroom Poll</span>
                </div>
                <p className="text-xs font-semibold text-foreground leading-snug">
                  {activePoll.question}
                </p>
                <div className="space-y-1">
                  {(activePoll.options || []).map((opt: any) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between text-[11px] p-1.5 rounded bg-background/80 border border-border/40"
                    >
                      <span>{opt.text}</span>
                      <span className="font-mono text-muted-foreground">{opt.percentage || 0}%</span>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full h-7 text-xs font-semibold mt-1"
                  onClick={handleInsertActivePoll}
                >
                  Insert Live Poll into Story
                </Button>
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  No active poll currently set on the server.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setActiveTab("custom")}
                >
                  Create a Poll for This Story
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Poll Question</Label>
              <Input
                placeholder="e.g. Will this policy improve public transit?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-muted-foreground">Poll Options</Label>
                {options.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    <IconPlus className="h-2.5 w-2.5" />
                    <span>Add option</span>
                  </button>
                )}
              </div>

              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground w-3 text-right">
                    {idx + 1}.
                  </span>
                  <Input
                    placeholder={`Option ${idx + 1}…`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="h-7 text-xs flex-1"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove option"
                    >
                      <IconTrash className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              size="sm"
              className="w-full h-7 text-xs font-semibold"
              onClick={handleInsertCustomPoll}
            >
              Insert Poll Block
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
