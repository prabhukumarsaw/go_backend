import { Badge } from "@/components/ui/badge";
import { ARTICLE_STATUS_CONFIG } from "../types";

interface ArticleStatusBadgeProps {
  status: string;
  className?: string;
}

export function ArticleStatusBadge({ status, className }: ArticleStatusBadgeProps) {
  const config = ARTICLE_STATUS_CONFIG[status] || {
    label: status,
    variant: "secondary",
    color: "bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant={config.variant}
      className={`border capitalize font-medium text-[11px] ${config.color} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}
