"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  IconCopy,
  IconCheck,
  IconTrash,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMediaMetadata, useDeleteMedia } from "../hooks/use-media";
import type { MediaItem } from "@/types/media";
import { env } from "@/config/env";

import { getMediaUrl } from "./media-grid";

interface MediaDetailsDialogProps {
  media: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaDetailsDialog({
  media,
  open,
  onOpenChange,
}: MediaDetailsDialogProps) {
  const [altText, setAltText] = useState(media?.alt_text || "");
  const [caption, setCaption] = useState(media?.caption || "");
  const [copied, setCopied] = useState(false);

  const updateMetadata = useUpdateMediaMetadata();
  const deleteMedia = useDeleteMedia();

  if (!media) return null;

  const mediaUrl = getMediaUrl(media);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(mediaUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await updateMetadata.mutateAsync({
      id: media.id,
      input: {
        alt_text: altText,
        caption,
        category: media.category,
        folder: media.folder,
      },
    });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this media asset?")) {
      await deleteMedia.mutateAsync(media.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-6 sm:p-7 gap-6">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-lg font-bold truncate">
            {media.original_name || media.filename}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Left Column: Asset Preview & S3 Specs */}
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted/40 flex items-center justify-center shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl}
                alt={media.alt_text || "Media preview"}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="rounded-lg border bg-card/50 p-3.5 text-xs space-y-2 text-muted-foreground font-mono">
              <div className="flex justify-between items-center">
                <span>File size:</span>
                <span className="font-semibold text-foreground">
                  {(media.file_size / (1024 * 1024)).toFixed(2)} MB ({(media.file_size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>MIME type:</span>
                <span className="font-semibold text-foreground uppercase">{media.mime_type}</span>
              </div>
              {media.width && media.height ? (
                <div className="flex justify-between items-center">
                  <span>Resolution:</span>
                  <span className="font-semibold text-foreground">
                    {media.width} × {media.height} px
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between items-center">
                <span>Uploaded:</span>
                <span className="text-foreground">
                  {format(new Date(media.created_at), "MMM d, yyyy HH:mm")}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <IconCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <IconCopy className="mr-1.5 h-3.5 w-3.5" />
              )}
              {copied ? "Public URL Copied to Clipboard!" : "Copy Asset CDN URL"}
            </Button>
          </div>

          {/* Right Column: Metadata & Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="alt_text" className="text-xs font-semibold">
                  Alt Text (Accessibility & SEO)
                </Label>
                <Input
                  id="alt_text"
                  defaultValue={media.alt_text || ""}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image for screen readers & search engines…"
                  className="text-xs h-9"
                />
                <p className="text-[11px] text-muted-foreground">
                  Descriptive text improves web accessibility and Google News image ranking.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="caption" className="text-xs font-semibold">
                  Caption / Photo Credit
                </Label>
                <Textarea
                  id="caption"
                  defaultValue={media.caption || ""}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Photo: Reuters / Jane Doe (New Delhi)"
                  className="text-xs resize-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                onClick={handleDelete}
                disabled={deleteMedia.isPending}
              >
                <IconTrash className="mr-1.5 h-3.5 w-3.5" />
                Delete Asset
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs font-medium"
                  onClick={handleSave}
                  disabled={updateMetadata.isPending}
                >
                  {updateMetadata.isPending ? (
                    <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
