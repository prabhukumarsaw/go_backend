"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconPlus,
  IconSearch,
  IconTag,
  IconTrash,
  IconLoader2,
  IconArticle,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { listTags, createTag, deleteTag } from "@/lib/api/articles";
import { toast } from "sonner";

export default function TagsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tags"],
    queryFn: () => listTags(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; slug?: string }) => createTag(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsCreateOpen(false);
      setTagName("");
      setTagSlug("");
      toast.success(`Tag "#${res.data.name}" created successfully`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create tag");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setDeleteTarget(null);
      toast.success("Tag deleted");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete tag");
    },
  });

  const rawTags = data?.data || [];
  const tags = rawTags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleNameChange = (val: string) => {
    setTagName(val);
    setTagSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    createMutation.mutate({
      name: tagName.trim(),
      slug: tagSlug.trim() || undefined,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tags"
        description="Organize keywords and topic tags for articles."
      >
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={
            <Button size="sm" className="h-8 shadow-xs font-medium">
              <IconPlus className="mr-1.5 h-3.5 w-3.5" />
              Add Tag
            </Button>
          } />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Create Tag
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="tag_name" className="text-xs font-semibold">
                  Tag Name *
                </Label>
                <Input
                  id="tag_name"
                  required
                  placeholder="e.g. Elections, Climate"
                  value={tagName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tag_slug" className="text-xs font-semibold">
                  Slug
                </Label>
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span>#</span>
                  <Input
                    id="tag_slug"
                    placeholder="elections"
                    value={tagSlug}
                    onChange={(e) => setTagSlug(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending || !tagName.trim()}
                >
                  {createMutation.isPending && (
                    <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  )}
                  Create Tag
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>

      {isLoading ? (
        <LoadingState message="Loading tags…" />
      ) : isError ? (
        <ErrorState
          title="Failed to load tags"
          message="Could not connect to the API. Ensure backend is running."
          onRetry={() => refetch()}
        />
      ) : tags.length === 0 ? (
        <EmptyState
          icon={IconTag}
          title="No tags found"
          description={
            search
              ? "No tags match your search query."
              : "No tags have been created yet."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:hidden">
            {tags.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border bg-card p-3 flex items-center justify-between shadow-xs"
              >
                <div className="space-y-1">
                  <Badge variant="secondary" className="font-mono text-xs">
                    #{t.name}
                  </Badge>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {t.usage_count || 0} articles
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget({ id: t.id, name: t.name })}
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-lg border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Tag Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{t.id}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      <Badge variant="secondary" className="font-mono text-xs font-semibold">
                        #{t.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {t.slug}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <IconArticle className="h-3.5 w-3.5 text-primary" />
                        {t.usage_count || 0} articles
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Delete tag"
                        onClick={() => setDeleteTarget({ id: t.id, name: t.name })}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Tag"
        description={`Are you sure you want to delete tag "#${deleteTarget?.name}"?`}
        confirmText="Delete Tag"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
      />
    </div>
  );
}
