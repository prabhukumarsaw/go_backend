"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconPlus,
  IconSearch,
  IconCategory,
  IconExternalLink,
  IconTrash,
  IconEye,
  IconLoader2,
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
import { listCategories, createCategory, deleteCategory } from "@/lib/api/articles";
import { toast } from "sonner";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; slug?: string }) => createCategory(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      setIsCreateOpen(false);
      setNewCatName("");
      setNewCatSlug("");
      toast.success(`Category "${res.data.name}" created successfully`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["home-feed"] });
      setDeleteTarget(null);
      toast.success("Category deleted");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete category");
    },
  });

  const rawCategories = data?.data || [];
  const categories = rawCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleNameChange = (val: string) => {
    setNewCatName(val);
    setNewCatSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createMutation.mutate({
      name: newCatName.trim(),
      slug: newCatSlug.trim() || undefined,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Categories"
        description="Organize content sections, topics, and site navigation."
      >
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={
            <Button size="sm" className="h-8 shadow-xs font-medium">
              <IconPlus className="mr-1.5 h-3.5 w-3.5" />
              Add Category
            </Button>
          } />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Add New Category
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="cat_name" className="text-xs font-semibold">
                  Category Name *
                </Label>
                <Input
                  id="cat_name"
                  required
                  placeholder="e.g. Technology"
                  value={newCatName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat_slug" className="text-xs font-semibold">
                  URL Slug
                </Label>
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span>/</span>
                  <Input
                    id="cat_slug"
                    placeholder="technology"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
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
                  disabled={createMutation.isPending || !newCatName.trim()}
                >
                  {createMutation.isPending && (
                    <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  )}
                  Create Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>

      {isLoading ? (
        <LoadingState message="Loading categories…" />
      ) : isError ? (
        <ErrorState
          title="Failed to load categories"
          message="Could not connect to the API. Ensure the backend is active."
          onRetry={() => refetch()}
        />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={IconCategory}
          title="No categories found"
          description={
            search
              ? "No categories match your search query."
              : "No categories have been created yet."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-lg border bg-card p-3.5 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">
                    {cat.name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {cat.level === 1 ? "Main Section" : cat.level === 2 ? "Sub-Section" : "Topic"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">/{cat.slug}</span>
                  <span className="truncate max-w-[140px]">{cat.path || cat.name}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    render={<Link href={`/${cat.slug}`} target="_blank" />}
                  >
                    <IconEye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-lg border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[70px] text-xs font-semibold">ID</TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold">Category Name</TableHead>
                  <TableHead className="text-xs font-semibold">Path</TableHead>
                  <TableHead className="text-xs font-semibold">Slug</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{cat.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {cat.level === 1 ? "Main Section" : cat.level === 2 ? "Sub-Section" : "Topic"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {cat.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {cat.path || cat.name}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/${cat.slug}`}
                        target="_blank"
                        className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        /{cat.slug}
                        <IconExternalLink className="h-3 w-3 opacity-60" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          render={<Link href={`/${cat.slug}`} target="_blank" />}
                        >
                          <IconEye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete category"
                          onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Articles in this category will become unassigned.`}
        confirmText="Delete Category"
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
