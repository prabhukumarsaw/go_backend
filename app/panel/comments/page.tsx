"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconMessage,
  IconCheck,
  IconX,
  IconFlame,
  IconRefresh,
  IconShieldCheck,
  IconLoader2,
  IconArticle,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/layout/page-header";
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
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { listPendingComments, moderateComment } from "@/lib/api/moderation";
import { toast } from "sonner";

export default function CommentsPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<"pending" | "all">("pending");

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["moderation-comments"],
    queryFn: () => listPendingComments(1, 50),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "approve" | "reject" | "spam" }) =>
      moderateComment(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["moderation-comments"] });
      const label =
        variables.action === "approve"
          ? "Comment approved & published live!"
          : variables.action === "reject"
          ? "Comment rejected and hidden."
          : "Comment flagged as spam.";
      toast.success(label);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to moderate comment.");
    },
  });

  const comments = data?.data || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Comments"
        description="Review, approve, and moderate reader comments."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 text-xs"
          >
            <IconRefresh
              className={`h-3.5 w-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={activeFilter === "pending" ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setActiveFilter("pending")}
          >
            <IconShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Pending Review
            <Badge variant="secondary" className="ml-2 font-mono text-[10px]">
              {comments.length}
            </Badge>
          </Button>
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {comments.length} awaiting review
        </span>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <LoadingState message="Loading comments…" />
      ) : isError ? (
        <ErrorState
          title="Failed to load comments"
          message="Could not connect to moderation service. Ensure backend is running."
          onRetry={() => refetch()}
        />
      ) : comments.length === 0 ? (
        <EmptyState
          icon={IconMessage}
          title="No pending comments"
          description="All reader comments have been reviewed and moderated."
        />
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border bg-card p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {comment.user_name || `User #${comment.user_id}`}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <p className="text-xs text-foreground bg-muted/30 p-2 rounded border">
                  &ldquo;{comment.body}&rdquo;
                </p>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                  <IconArticle className="h-3 w-3 shrink-0 text-primary" />
                  <span className="truncate">{comment.article_title || "Article"}</span>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                    disabled={moderateMutation.isPending}
                    onClick={() => moderateMutation.mutate({ id: comment.id, action: "approve" })}
                  >
                    <IconCheck className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
                    disabled={moderateMutation.isPending}
                    onClick={() => moderateMutation.mutate({ id: comment.id, action: "reject" })}
                  >
                    <IconX className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-amber-500 hover:bg-amber-500/10"
                    disabled={moderateMutation.isPending}
                    onClick={() => moderateMutation.mutate({ id: comment.id, action: "spam" })}
                  >
                    Spam
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Reader</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {comment.user_name ? comment.user_name.slice(0, 2).toUpperCase() : "U"}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">
                            {comment.user_name || `User #${comment.user_id}`}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-md">
                      <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-2.5 rounded border">
                        &ldquo;{comment.body}&rdquo;
                      </p>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <IconArticle className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {comment.article_title || `Article #${comment.article_id}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-[11px] font-mono text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                          disabled={moderateMutation.isPending}
                          onClick={() =>
                            moderateMutation.mutate({ id: comment.id, action: "approve" })
                          }
                        >
                          <IconCheck className="mr-1 h-3.5 w-3.5" />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
                          disabled={moderateMutation.isPending}
                          onClick={() =>
                            moderateMutation.mutate({ id: comment.id, action: "reject" })
                          }
                        >
                          <IconX className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-amber-500 hover:bg-amber-500/10"
                          disabled={moderateMutation.isPending}
                          onClick={() =>
                            moderateMutation.mutate({ id: comment.id, action: "spam" })
                          }
                        >
                          Spam
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
    </div>
  );
}
