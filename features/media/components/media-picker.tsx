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
import { IconSearch, IconPhoto, IconUpload } from "@tabler/icons-react";
import { useMediaList } from "../hooks/use-media";
import { MediaUploader } from "./media-uploader";
import { getMediaUrl } from "./media-grid";
import type { MediaItem } from "@/types/media";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: { url: string; alt?: string; caption?: string; id?: string }) => void;
}

export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMediaList({ search: search || undefined });

  const mediaItems = data?.data || [];

  const handleSelect = (item: MediaItem) => {
    const url = getMediaUrl(item);
    onOpenChange(false);
    // Release focus from modal before inserting into editor
    setTimeout(() => {
      onSelect({
        url,
        alt: item.alt_text || item.filename,
        caption: item.caption,
        id: item.id,
      });
    }, 60);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Select Media</DialogTitle>
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

          <TabsContent value="library" className="space-y-4 mt-4">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search media by title or tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                  Loading media library…
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                  No media files found.
                </div>
              ) : (
                mediaItems.map((item) => {
                  const url = getMediaUrl(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="group relative aspect-square rounded-md overflow-hidden border bg-muted hover:ring-2 hover:ring-primary focus:outline-none transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={item.alt_text || item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          // Fallback to broken image icon representation if needed
                          const img = e.currentTarget;
                          img.style.opacity = "0.6";
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
