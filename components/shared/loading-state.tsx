import { Skeleton } from "@/components/ui/skeleton";
import { IconLoader2 } from "@tabler/icons-react";

interface LoadingStateProps {
  message?: string;
  variant?: "spinner" | "skeleton" | "page";
}

export function LoadingState({
  message = "Loading…",
  variant = "spinner",
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-caption">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IconLoader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}
