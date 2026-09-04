"use client";

import * as React from "react";
import { flexRender, type Table as TanStackTable, type Row } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { IconSearch, IconX, IconInbox } from "@tabler/icons-react";

interface ResponsiveDataViewProps<TData> {
  table: TanStackTable<TData>;
  columnsLength: number;
  isLoading?: boolean;
  /** Optional custom mobile card renderer. If omitted, mobile shows a responsive scrollable table. */
  renderMobileCard?: (row: Row<TData>) => React.ReactNode;
  /** Search state */
  search?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  /** Filter slot (e.g., status buttons, category selects) */
  filters?: React.ReactNode;
  /** Primary action slot (e.g., "+ Add New" button) */
  action?: React.ReactNode;
  /** Empty state messaging */
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ResponsiveDataView<TData>({
  table,
  columnsLength,
  isLoading = false,
  renderMobileCard,
  search,
  onSearchChange,
  searchPlaceholder = "Search records…",
  filters,
  action,
  emptyTitle = "No records found",
  emptyDescription = "There are no items matching your current filters or search query.",
}: ResponsiveDataViewProps<TData>) {
  const rows = table.getRowModel().rows || [];

  return (
    <div className="space-y-4">
      {/* Top Controls Bar: Search, Filters, Primary Action */}
      {(onSearchChange || filters || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
            {onSearchChange && (
              <div className="relative w-full sm:max-w-xs">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 pl-9 pr-8 text-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
          </div>

          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-2 rounded-lg border bg-card p-6">
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          <div className="space-y-2 pt-4">
            <div className="h-10 w-full animate-pulse rounded bg-muted/60" />
            <div className="h-10 w-full animate-pulse rounded bg-muted/40" />
            <div className="h-10 w-full animate-pulse rounded bg-muted/20" />
          </div>
        </div>
      ) : rows.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <IconInbox className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">{emptyTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">{emptyDescription}</p>
        </div>
      ) : (
        <>
          {/* Mobile View: Render cards if renderMobileCard is provided, otherwise responsive table */}
          {renderMobileCard ? (
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
                >
                  {renderMobileCard(row)}
                </div>
              ))}
            </div>
          ) : null}

          {/* Desktop View (or fallback table on mobile) */}
          <div
            className={`rounded-lg border bg-card shadow-sm overflow-hidden ${
              renderMobileCard ? "hidden md:block" : "block overflow-x-auto"
            }`}
          >
            <Table>
              <TableHeader className="bg-muted/40">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Pagination Controls */}
      <DataTablePagination table={table} />
    </div>
  );
}
