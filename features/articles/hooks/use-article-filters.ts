"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function useArticleFilters() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("all"));
  const [category, setCategory] = useQueryState("category", parseAsString.withDefault("all"));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage, setPerPage] = useQueryState("perPage", parseAsInteger.withDefault(20));

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setPage(1);
  };

  return {
    search,
    setSearch,
    status,
    setStatus,
    category,
    setCategory,
    page,
    setPage,
    perPage,
    setPerPage,
    resetFilters,
  };
}
