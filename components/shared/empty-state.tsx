import { type ReactNode } from "react";
import { IconInbox } from "@tabler/icons-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children?: ReactNode; // Action slot
}

export function EmptyState({
  icon: Icon = IconInbox,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-title">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-caption">{description}</p>
        )}
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
