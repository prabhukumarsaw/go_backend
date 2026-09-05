"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function ArticleBackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/60 h-8 px-2.5 text-xs sm:text-sm font-medium transition-colors gap-1.5 shrink-0"
    >
      <IconArrowLeft className="h-3.5 w-3.5" />
      <span>Back</span>
    </Button>
  );
}
