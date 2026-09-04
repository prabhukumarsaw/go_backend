"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMedia,
  uploadMedia,
  updateMediaMetadata,
  deleteMedia,
} from "@/lib/api/media";
import type { MediaFilter, MediaUpdateInput } from "@/types/media";

export function useMediaList(filter?: MediaFilter) {
  return useQuery({
    queryKey: ["media", filter],
    queryFn: () => listMedia(filter),
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      category = "news",
      folder = "general",
    }: {
      file: File;
      category?: string;
      folder?: string;
    }) => uploadMedia(file, category, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useUpdateMediaMetadata() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MediaUpdateInput }) =>
      updateMediaMetadata(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}
