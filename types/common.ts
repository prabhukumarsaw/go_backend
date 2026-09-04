// ─── Common Utility Types ───────────────────────

export type SortDirection = "asc" | "desc";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Generic search/filter state for data tables.
 */
export interface TableState {
  search?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
