"use client";

import React, { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import type { TipTapNode } from "../types";

export function CodeBlockNode({ node }: { node: TipTapNode }) {
  const [copied, setCopied] = useState(false);
  const language = node.attrs?.language || "";
  const codeText = node.content?.map((c) => c.text || "").join("") || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="my-8 sm:my-10 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md not-prose">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <IconCopy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto text-sm sm:text-base font-mono leading-relaxed selection:bg-red-500/30">
        <code>{codeText}</code>
      </pre>
    </div>
  );
}
