"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconSearch,
  IconPhoto,
  IconUpload,
  IconMovie,
  IconGridDots,
} from "@tabler/icons-react";
import { useMediaList } from "../hooks/use-media";
import { MediaUploader } from "./media-uploader";
import { getMediaUrl } from "./media-grid";
import type { MediaItem } from "@/types/media";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: {
    url: string;
    alt?: string;
    caption?: string;
    id?: string;
    isVideo?: boolean;
  }) => void;
}

export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "images" | "videos">("all");
  const { data, isLoading } = useMediaList({ search: search || undefined });

  const mediaItems = data?.data || [];

  const filteredItems = mediaItems.filter((item) => {
    const isVideo =
      item.mime_type?.startsWith("video/") ||
      item.folder === "videos" ||
      /\.(mp4|webm)$/i.test(item.filename);

    if (filterType === "images") return !isVideo;
    if (filterType === "videos") return isVideo;
    return true;
  });

  const handleSelect = (item: MediaItem) => {
    const url = getMediaUrl(item);
    const isVideo =
      item.mime_type?.startsWith("video/") ||
      item.folder === "videos" ||
      /\.(mp4|webm)$/i.test(item.filename);

    onOpenChange(false);
    // Release focus from modal before inserting into editor
    setTimeout(() => {
      onSelect({
        url,
        alt: item.alt_text || item.filename,
        caption: item.caption,
        id: item.id,
        isVideo,
      });
    }, 60);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Select Media Asset</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library" className="text-xs">
              <IconPhoto className="mr-1.5 h-3.5 w-3.5" />
              Media Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs">
              <IconUpload className="mr-1.5 h-3.5 w-3.5" />
              Upload New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-3 mt-3">
            {/* Search & Type Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search media by title or tag…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    filterType === "all" ? "bg-background text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("images")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    filterType === "images" ? "bg-background text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Images
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("videos")}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    filterType === "videos" ? "bg-background text-violet-600 dark:text-violet-400 shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <IconMovie className="h-3 w-3" />
                  Videos
                </button>
              </div>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                  Loading media library…
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                  {filterType === "videos"
                    ? "No short videos found. Click 'Upload New' to add MP4/WebM videos to your videos folder."
                    : "No media files found."}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const url = getMediaUrl(item);
                  const isVideo =
                    item.mime_type?.startsWith("video/") ||
                    item.folder === "videos" ||
                    /\.(mp4|webm)$/i.test(item.filename);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="group relative aspect-square rounded-md overflow-hidden border bg-muted hover:ring-2 hover:ring-primary focus:outline-none transition-all text-left cursor-pointer"
                    >
                      {isVideo ? (
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center relative">
                          <video
                            src={url}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute top-1.5 left-1.5 rounded-full bg-violet-600/90 text-white px-2 py-0.5 text-[9px] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                            <IconMovie className="h-2.5 w-2.5" />
                            <span>VIDEO</span>
                          </div>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={url}
                          alt={item.alt_text || item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.opacity = "0.6";
                          }}
                        />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate text-left">
                          {item.original_name || item.filename}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <MediaUploader
              onSuccess={() => {
                // Return to library tab when upload succeeds
                const libraryTab = document.querySelector('[data-value="library"]') as HTMLButtonElement;
                if (libraryTab) libraryTab.click();
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
