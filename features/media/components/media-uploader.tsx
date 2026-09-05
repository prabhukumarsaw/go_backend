"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IconUpload, IconFile, IconCheck, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useUploadMedia } from "../hooks/use-media";
import { siteConfig } from "@/config/site";
import { toast } from "sonner";

interface MediaUploaderProps {
  onSuccess?: () => void;
  category?: string;
  folder?: string;
}

export function MediaUploader({
  onSuccess,
  category = "news",
  folder = "general",
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();
  const queryClient = useQueryClient();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const file = files[0];

    // Validate size (20MB)
    if (file.size > siteConfig.media.maxFileSize) {
      setError("File size exceeds 20MB limit.");
      return;
    }

    const isVideo =
      file.type.startsWith("video/") ||
      /\.(mp4|webm)$/i.test(file.name);
    const targetFolder = isVideo ? "videos" : folder;

    try {
      await upload.mutateAsync({ file, category, folder: targetFolder });
      await queryClient.invalidateQueries({ queryKey: ["media"] });
      await queryClient.refetchQueries({ queryKey: ["media"] });
      toast.success(isVideo ? "Short video uploaded to videos folder!" : "Asset uploaded successfully!");
      if (onSuccess) onSuccess();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please check backend connection.");
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={[
            ...siteConfig.media.acceptedImageTypes,
            ...siteConfig.media.acceptedVideoTypes,
          ].join(",")}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {upload.isPending ? (
            <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <IconUpload className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">
            {upload.isPending ? "Uploading file…" : "Click or drag & drop to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            Images (JPG, PNG, WebP) & Short Videos (MP4, WebM) up to 20MB
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
