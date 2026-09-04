"use client";

import * as React from "react";
import { IconMaximize, IconMinimize } from "@tabler/icons-react";
import { ToolButton } from "./tool-button";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function FullscreenButton({ isFullscreen, onToggle }: FullscreenButtonProps) {
  return (
    <ToolButton
      active={isFullscreen}
      onClick={onToggle}
      title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Zen Mode"}
      className={isFullscreen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}
    >
      {isFullscreen ? (
        <IconMinimize className="h-3.5 w-3.5" />
      ) : (
        <IconMaximize className="h-3.5 w-3.5" />
      )}
    </ToolButton>
  );
}
