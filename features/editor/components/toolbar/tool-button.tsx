"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export interface ToolButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ToolButton({
  active,
  disabled,
  onClick,
  title,
  children,
  className = "",
}: ToolButtonProps) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className={`h-7 w-7 shrink-0 ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );
}
