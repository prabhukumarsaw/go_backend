"use client";

import { PageHeader } from "@/components/layout/page-header";
import { MediaGrid } from "@/features/media/components/media-grid";

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Upload, organize, and manage images and media assets for editorial articles."
      />

      <MediaGrid />
    </div>
  );
}
