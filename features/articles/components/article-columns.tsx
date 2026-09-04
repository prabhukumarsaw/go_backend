"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { IconBolt, IconStar } from "@tabler/icons-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { ArticleStatusBadge } from "./article-status-badge";
import { ArticleRowActions } from "./article-actions";
import type { ArticleListItem } from "../types";

export const articleColumns: ColumnDef<ArticleListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Article" />
    ),
    cell: ({ row }) => {
      const article = row.original;
      return (
        <div className="flex flex-col gap-1 max-w-[380px]">
          <div className="flex items-center gap-1.5">
            {article.is_breaking && (
              <Badge variant="destructive" className="h-4 gap-0.5 px-1 text-[10px]">
                <IconBolt className="h-2.5 w-2.5" />
                Breaking
              </Badge>
            )}
            {article.is_featured && (
              <Badge variant="secondary" className="h-4 gap-0.5 px-1 text-[10px]">
                <IconStar className="h-2.5 w-2.5 text-amber-500" />
                Featured
              </Badge>
            )}
            <Link
              href={`/studio/${article.id}`}
              className="font-medium text-foreground hover:underline truncate"
            >
              {article.title}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-[11px] truncate">/{article.slug}</span>
            {article.categories && article.categories.length > 0 && (
              <>
                <span>·</span>
                <span className="truncate">{article.categories.join(", ")}</span>
              </>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <ArticleStatusBadge status={row.getValue("status")} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "author_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {row.getValue("author_name") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lang" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="uppercase font-mono text-[10px]">
        {row.getValue("language") || "en"}
      </Badge>
    ),
  },
  {
    accessorKey: "view_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Views" />
    ),
    cell: ({ row }) => {
      const views = Number(row.getValue("view_count")) || 0;
      return (
        <span className="text-xs font-mono text-muted-foreground">
          {views.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue("updated_at") as string;
      if (!dateStr) return <span className="text-xs text-muted-foreground">—</span>;
      try {
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(dateStr), "MMM d, yyyy")}
          </span>
        );
      } catch {
        return <span className="text-xs text-muted-foreground">{dateStr}</span>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ArticleRowActions article={row.original} />,
  },
];
