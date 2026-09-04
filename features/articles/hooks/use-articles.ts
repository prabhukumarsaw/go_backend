"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  studioListArticles,
  getArticle,
  createArticle,
  updateArticle,
  transitionArticleStatus,
  scheduleArticle,
  getArticleVersions,
} from "@/lib/api/articles";
import type { CreateArticleInput, ListArticlesFilter } from "@/types/content";

export function useStudioArticles(filter?: ListArticlesFilter) {
  return useQuery({
    queryKey: ["studio-articles", filter],
    queryFn: () => studioListArticles(filter),
  });
}

export function useArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => getArticle(id!),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateArticleInput) => createArticle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateArticleInput> }) =>
      updateArticle(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studio-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["article", variables.id] });
    },
  });
}

export function useTransitionArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      transitionArticleStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studio-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["article", variables.id] });
    },
  });
}

export function useScheduleArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      scheduleArticle(id, scheduledAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studio-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["article", variables.id] });
    },
  });
}

export function useArticleVersions(id: string | undefined) {
  return useQuery({
    queryKey: ["article-versions", id],
    queryFn: () => getArticleVersions(id!),
    enabled: !!id,
  });
}
