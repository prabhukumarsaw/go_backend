"use client";

import { useState, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconPlus,
  IconSearch,
  IconCategory,
  IconExternalLink,
  IconTrash,
  IconLoader2,
  IconChevronRight,
  IconChevronDown,
  IconEdit,
  IconFolder,
  IconMaximize,
  IconMinimize,
  IconCopy,
  IconCheck,
  IconFolderPlus,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  listCategoriesTree,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
} from "@/lib/api/articles";
import type { Category } from "@/types/content";
import { toast } from "sonner";

type FilterLevel = "all" | "main" | "sub";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<string>("root");
  const [formSortOrder, setFormSortOrder] = useState<number>(1);

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // Fetch categories tree from Go API
  const { data: treeData, isLoading, isError, refetch } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: () => listCategoriesTree(),
    staleTime: 2 * 60 * 1000,
  });

  const treeCategories: Category[] = useMemo(() => treeData?.data || [], [treeData]);

  // Cache Invalidation & Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      resetForm();
      toast.success(`Category "${res.data.name}" created successfully`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      resetForm();
      toast.success(`Category "${res.data.name}" updated successfully`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
      toast.success("Category deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete category");
    },
  });

  const resetForm = useCallback(() => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormParentId("root");
    setFormSortOrder(1);
  }, []);

  const handleOpenCreateModal = useCallback(
    (parentId?: number) => {
      resetForm();
      if (parentId) {
        setFormParentId(String(parentId));
      }
      setIsModalOpen(true);
    },
    [resetForm]
  );

  const handleOpenEditModal = useCallback((cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parent_id ? String(cat.parent_id) : "root");
    setFormSortOrder(cat.sort_order || 1);
    setIsModalOpen(true);
  }, []);

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload: CreateCategoryPayload = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      parent_id: formParentId === "root" ? null : parseInt(formParentId, 10),
      sort_order: formSortOrder,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleExpand = useCallback((id: number) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleExpandAll = useCallback(() => {
    const all: Record<number, boolean> = {};
    const markAll = (nodes: Category[]) => {
      nodes.forEach((c) => {
        all[c.id] = true;
        if (c.children && c.children.length > 0) {
          markAll(c.children);
        }
      });
    };
    markAll(treeCategories);
    setExpandedNodes(all);
  }, [treeCategories]);

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes({});
  }, []);

  const handleCopySlug = useCallback((slug: string) => {
    navigator.clipboard.writeText(`/${slug}`);
    setCopiedSlug(slug);
    toast.success(`Copied path "/${slug}" to clipboard`);
    setTimeout(() => setCopiedSlug(null), 2000);
  }, []);

  // Filtered Tree logic
  const filteredTree = useMemo(() => {
    let result = treeCategories;

    if (search.trim()) {
      const query = search.toLowerCase();

      const filterNode = (node: Category): Category | null => {
        const matchesSelf =
          node.name.toLowerCase().includes(query) ||
          node.slug.toLowerCase().includes(query);

        const matchingChildren = node.children
          ? (node.children.map(filterNode).filter(Boolean) as Category[])
          : [];

        if (matchesSelf || matchingChildren.length > 0) {
          return {
            ...node,
            children: matchingChildren.length > 0 ? matchingChildren : node.children,
          };
        }
        return null;
      };

      result = result.map(filterNode).filter(Boolean) as Category[];
    }

    if (filterLevel === "main") {
      result = result.map((node) => ({ ...node, children: [] }));
    } else if (filterLevel === "sub") {
      result = result.filter((node) => node.children && node.children.length > 0);
    }

    return result;
  }, [treeCategories, search, filterLevel]);

  return (
    <div className="space-y-5">
      {/* Clean Standard Page Header */}
      <PageHeader
        title="Category Tree & Navigation Hierarchy"
        description="Organize main editorial desks, sub-desks, and navigation section hierarchy."
      >
        <Button
          size="sm"
          onClick={() => handleOpenCreateModal()}
          className="h-9 font-medium shadow-xs"
        >
          <IconPlus className="mr-1.5 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      {/* Clean Theme-Synced Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories & sub-desks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs rounded-md"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border/50 w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setFilterLevel("all")}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                filterLevel === "all"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel("main")}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                filterLevel === "main"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Main L1
            </button>
            <button
              type="button"
              onClick={() => setFilterLevel("sub")}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                filterLevel === "sub"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              With Sub-desks
            </button>
          </div>
        </div>

        {/* Tree Expand / Collapse Controls */}
        <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium rounded-md"
            onClick={handleExpandAll}
          >
            <IconMaximize className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium rounded-md"
            onClick={handleCollapseAll}
          >
            <IconMinimize className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Category Tree Container */}
      {isLoading ? (
        <LoadingState message="Loading category tree structure…" />
      ) : isError ? (
        <ErrorState
          title="Failed to load category tree"
          message="Could not connect to the API. Ensure the Go backend server is running."
          onRetry={() => refetch()}
        />
      ) : filteredTree.length === 0 ? (
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
        <div className="space-y-2">
          {filteredTree.map((rootNode) => (
            <TreeNodeCardMemoized
              key={rootNode.id}
              node={rootNode}
              searchActive={!!search}
              expandedNodes={expandedNodes}
              copiedSlug={copiedSlug}
              onToggleExpand={toggleExpand}
              onAddChild={handleOpenCreateModal}
              onEdit={handleOpenEditModal}
              onDelete={(target) => setDeleteTarget(target)}
              onCopySlug={handleCopySlug}
            />
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Category Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cat_name" className="text-xs font-semibold">
                Category Name *
              </Label>
              <Input
                id="cat_name"
                required
                placeholder="e.g. दुनिया, भारत, खेल, टेक्नोलॉजी"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-xs h-9 rounded-md"
              />
            </div>

            {/* URL Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="cat_slug" className="text-xs font-semibold">
                  URL Slug
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  /{formSlug || "slug"}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                <span className="px-2 py-1.5 bg-muted rounded-md border text-[11px]">/</span>
                <Input
                  id="cat_slug"
                  placeholder="world, national, sports"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="text-xs h-9 rounded-md font-mono"
                />
              </div>
            </div>

            {/* Parent Category Select */}
            <div className="space-y-1.5">
              <Label htmlFor="parent_cat" className="text-xs font-semibold">
                Parent Category (Menu Placement)
              </Label>
              <select
                id="parent_cat"
                value={formParentId}
                onChange={(e) => setFormParentId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                <option value="root">Root Level Category (Main Menu L1)</option>
                {treeCategories
                  .filter((root) => root.id !== editingCategory?.id)
                  .map((root) => (
                    <option key={root.id} value={root.id}>
                      ↳ {root.name} (Main Menu L1)
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <Label htmlFor="sort_order" className="text-xs font-semibold">
                Sort Order
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-md shrink-0"
                  onClick={() => setFormSortOrder((prev) => Math.max(1, prev - 1))}
                >
                  -
                </Button>
                <Input
                  id="sort_order"
                  type="number"
                  min={1}
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(parseInt(e.target.value, 10) || 1)}
                  className="text-xs h-9 font-mono rounded-md text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-md shrink-0"
                  onClick={() => setFormSortOrder((prev) => prev + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  createMutation.isPending || updateMutation.isPending || !formName.trim()
                }
                className="font-medium"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Sub-desks and assigned articles will be unassigned.`}
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

// ─── Memoized Tree Node Card Component (Simple & Theme-Synced) ───
interface TreeNodeCardProps {
  node: Category;
  searchActive: boolean;
  expandedNodes: Record<number, boolean>;
  copiedSlug: string | null;
  onToggleExpand: (id: number) => void;
  onAddChild: (parentId: number) => void;
  onEdit: (cat: Category) => void;
  onDelete: (target: { id: number; name: string }) => void;
  onCopySlug: (slug: string) => void;
  level?: number;
}

const TreeNodeCardMemoized = memo(function TreeNodeCard({
  node,
  searchActive,
  expandedNodes,
  copiedSlug,
  onToggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  onCopySlug,
  level = 1,
}: TreeNodeCardProps) {
  const children = node.children || [];
  const hasChildren = children.length > 0;

  // Toggle state logic: Collapsed by default, auto-expanded on active search
  const isExpanded = expandedNodes[node.id] ?? (searchActive ? true : false);

  const isLevel1 = level === 1;

  return (
    <div className="rounded-lg border border-border/80 bg-card hover:bg-accent/10 transition-all overflow-hidden">
      {/* Node Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-card hover:bg-muted/30 transition-colors gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Chevron Expand Toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(node.id)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all focus:outline-hidden"
              aria-label="Toggle Sub-desks"
            >
              {isExpanded ? (
                <IconChevronDown className="h-4 w-4 text-foreground transition-transform duration-200" />
              ) : (
                <IconChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
              )}
            </button>
          ) : (
            <IconFolder className="h-4 w-4 text-muted-foreground/40 ml-1" />
          )}

          {/* Details */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-foreground tracking-tight">
              {node.name}
            </span>

            {/* Level Badge (Neutral Theme Synced) */}
            <Badge
              variant={isLevel1 ? "default" : "secondary"}
              className="text-[10px] font-semibold px-2 py-0.5"
            >
              {isLevel1 ? "Main L1" : `Sub L${level}`}
            </Badge>

            {/* Slug Path */}
            <span className="font-mono text-xs text-muted-foreground">/{node.slug}</span>

            {/* Order Badge */}
            <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
              Order #{node.sort_order || 1}
            </Badge>

            {/* Sub-desks Counter */}
            {hasChildren && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono cursor-pointer hover:bg-muted transition-colors text-muted-foreground"
                onClick={() => onToggleExpand(node.id)}
              >
                {children.length} sub-desks
              </Badge>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
          {isLevel1 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs font-medium rounded-md hover:bg-muted transition-colors"
              onClick={() => onAddChild(node.id)}
            >
              <IconFolderPlus className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              Add Sub-desk
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-md"
            title="Copy URL Path"
            onClick={() => onCopySlug(node.slug)}
          >
            {copiedSlug === node.slug ? (
              <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <IconCopy className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-md"
            title="Edit Category"
            onClick={() => onEdit(node)}
          >
            <IconEdit className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-md"
            title="Delete Category"
            onClick={() => onDelete({ id: node.id, name: node.name })}
          >
            <IconTrash className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-md"
            title="View Live Section"
            render={<Link href={`/${node.slug}`} target="_blank" />}
          >
            <IconExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Nested Branch Sub-Desks */}
      {hasChildren && isExpanded && (
        <div className="pl-4 sm:pl-6 pr-3 py-2 space-y-2 border-t border-border/40 bg-muted/20 border-l border-border/60 ml-3.5 my-1">
          {children.map((child) => (
            <TreeNodeCardMemoized
              key={child.id}
              node={child}
              searchActive={searchActive}
              expandedNodes={expandedNodes}
              copiedSlug={copiedSlug}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopySlug={onCopySlug}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});
