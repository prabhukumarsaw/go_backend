"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  IconSearch,
  IconUpload,
  IconPhoto,
  IconCopy,
  IconCheck,
  IconFolder,
  IconDatabase,
  IconLayoutGrid,
  IconList,
  IconRefresh,
  IconDownload,
  IconTrash,
  IconExternalLink,
  IconFileTypePng,
  IconVideo,
  IconFilter,
  IconInfoCircle,
} from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaList, useDeleteMedia } from "../hooks/use-media";
import { MediaUploader } from "./media-uploader";
import { MediaDetailsDialog } from "./media-details-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { env } from "@/config/env";
import { toast } from "sonner";
import type { MediaItem } from "@/types/media";

export function getMediaUrl(item: MediaItem): string {
  // Normalize Windows backslashes
  const rawPath = (item.storage_path || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (rawPath) {
    const clean = rawPath.replace(/^uploads\//, "").replace(/^media\//, "");
    return `${env.NEXT_PUBLIC_API_URL}/uploads/${clean}`;
  }
  if (item.url) {
    return item.url
      .replace(/\\/g, "/")
      .replace(/\/media\//, "/uploads/");
  }
  return "";
}

export function MediaGrid() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useMediaList({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
  });

  const deleteMedia = useDeleteMedia();
  const mediaItems = data?.data || [];

  // Storage calculations
  const totalBytes = mediaItems.reduce((acc, m) => acc + (m.file_size || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  const handleCopyUrl = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    const url = getMediaUrl(item);
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    toast.success("Asset URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this asset permanently from storage?")) {
      await deleteMedia.mutateAsync(id);
      toast.info("Media asset deleted.");
    }
  };

  return (
    <div className="space-y-4">
      {/* AWS S3 Style Bucket & Metrics Header */}
      <div className="rounded-lg border bg-card/60 p-3.5 backdrop-blur-sm shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-muted-foreground">
            <IconDatabase className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">media</span>
            <span>/</span>
            <span className="text-primary font-medium">{category}</span>
            <span>/</span>
            <span>{category === "all" ? "*" : category}</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
            <div>
              Total Objects:{" "}
              <span className="font-semibold text-foreground">{mediaItems.length}</span>
            </div>
            <div>
              Size:{" "}
              <span className="font-semibold text-foreground">{totalMB} MB</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-500">
              ● Storage Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category, View Mode, Upload */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by object name or prefix…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs font-mono"
            />
          </div>

          <Select value={category} onValueChange={(val) => setCategory(val || "all")}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              <SelectItem value="news">/news</SelectItem>
              <SelectItem value="features">/features</SelectItem>
              <SelectItem value="sports">/sports</SelectItem>
              <SelectItem value="entertainment">/entertainment</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => refetch()}
            title="Refresh bucket objects"
          >
            <IconRefresh className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-md border p-0.5 bg-muted/40">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode("grid")}
            >
              <IconLayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode("table")}
            >
              <IconList className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Upload Dialog */}
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="h-8 text-xs">
                  <IconUpload className="mr-1.5 h-3.5 w-3.5" />
                  Upload Media
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  Upload Media Object
                </DialogTitle>
              </DialogHeader>
              <MediaUploader
                onSuccess={() => setIsUploadOpen(false)}
                category={category !== "all" ? category : "news"}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <LoadingState message="Fetching objects from storage…" />
      ) : isError ? (
        <ErrorState
          title="Failed to load media objects"
          message="Could not connect to the media storage engine. Ensure the Go backend is running."
          onRetry={() => refetch()}
        />
      ) : mediaItems.length === 0 ? (
        <EmptyState
          icon={IconPhoto}
          title="No media objects in bucket"
          description="Drag and drop high-res images, infographics, or multimedia assets to start building your editorial library."
        >
          <Button size="sm" onClick={() => setIsUploadOpen(true)}>
            <IconUpload className="mr-1.5 h-3.5 w-3.5" />
            Upload Your First Asset
          </Button>
        </EmptyState>
      ) : viewMode === "grid" ? (
        /* AWS Clean Card Grid */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3.5">
          {mediaItems.map((item) => {
            const url = getMediaUrl(item);
            const isImage = item.mime_type?.startsWith("image/");
            const isVideo = item.mime_type?.startsWith("video/");

            return (
              <Card
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="group relative flex flex-col overflow-hidden border bg-card hover:border-primary/60 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted/60 flex items-center justify-center">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                      }}
                    />
                  ) : isVideo ? (
                    <IconVideo className="h-10 w-10 text-muted-foreground/60" />
                  ) : (
                    <IconPhoto className="h-10 w-10 text-muted-foreground/60" />
                  )}

                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-black/70 text-white hover:bg-black"
                      onClick={(e) => handleCopyUrl(e, item)}
                      title="Copy Public URL"
                    >
                      {copiedId === item.id ? (
                        <IconCheck className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <IconCopy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <CardContent className="p-2.5 space-y-1">
                  <p className="text-xs font-medium font-mono truncate text-foreground leading-tight">
                    {item.original_name || item.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{(item.file_size / 1024).toFixed(0)} KB</span>
                    <span className="uppercase">{item.mime_type?.split("/")[1] || "FILE"}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* AWS S3 High-Density Object Table */
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[60px]">Preview</TableHead>
                <TableHead>Object Key / Filename</TableHead>
                <TableHead>MIME Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Folder / Scope</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mediaItems.map((item) => {
                const url = getMediaUrl(item);
                return (
                  <TableRow
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="cursor-pointer hover:bg-muted/20"
                  >
                    <TableCell className="p-2">
                      <div className="h-9 w-9 rounded-sm overflow-hidden bg-muted flex items-center justify-center border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={item.filename}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[220px]">
                          {item.original_name || item.filename}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {item.mime_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {(item.file_size / 1024).toFixed(1)} KB
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      /{item.category || "news"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => handleCopyUrl(e, item)}
                        title="Copy Public URL"
                      >
                        {copiedId === item.id ? (
                          <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <IconCopy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(e, item.id)}
                        title="Delete Asset"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* AWS Inspector Details Dialog */}
      <MediaDetailsDialog
        media={selectedMedia}
        open={!!selectedMedia}
        onOpenChange={(open) => {
          if (!open) setSelectedMedia(null);
        }}
      />
    </div>
  );
}
