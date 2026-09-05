"use client";

import React, { useState } from "react";
import { IconChartPie, IconCheck } from "@tabler/icons-react";
import type { TipTapNode } from "../types";

export function PollNodeComponent({ node }: { node: TipTapNode }) {
  const question = node.attrs?.question || "Reader Poll / जनमत सर्वेक्षण";
  const rawOptions = node.attrs?.options;
  const options: Array<{ id: number; text: string; votes?: number; percentage?: number }> =
    Array.isArray(rawOptions)
      ? rawOptions
      : typeof rawOptions === "string"
      ? JSON.parse(rawOptions || "[]")
      : [];

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0) + (hasVoted ? 1 : 0);

  const handleVote = (id: number) => {
    if (hasVoted) return;
    setSelectedOption(id);
    setHasVoted(true);
  };

  return (
    <div className="my-8 sm:my-10 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border/50">
        <span className="h-7 w-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-xs">
          <IconChartPie className="h-4 w-4" />
        </span>
        <h4 className="font-bold text-base sm:text-lg text-foreground font-serif">
          {question}
        </h4>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const votes = (opt.votes || 0) + (isSelected ? 1 : 0);
          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleVote(opt.id)}
              disabled={hasVoted}
              className={`w-full relative overflow-hidden rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-red-600 bg-red-500/5 dark:bg-red-950/20"
                  : "border-border hover:border-border/80 bg-muted/20"
              }`}
            >
              {/* Progress bar background */}
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-red-500/15 dark:bg-red-500/25 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-3 text-sm sm:text-base">
                <span className="font-medium text-foreground flex items-center gap-2">
                  {isSelected && <IconCheck className="h-4 w-4 text-red-600 shrink-0" />}
                  {opt.text}
                </span>
                {hasVoted && (
                  <span className="font-mono text-xs sm:text-sm font-bold text-red-600 shrink-0">
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1">
        <span>{hasVoted ? "धन्यवाद आपके मत के लिए / Thank you for voting" : "Click an option to vote"}</span>
        <span>{totalVotes.toLocaleString()} Total Votes</span>
      </div>
    </div>
  );
}
