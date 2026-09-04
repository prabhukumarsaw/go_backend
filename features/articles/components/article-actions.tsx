"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconSend,
  IconCheck,
  IconArchive,
  IconCopy,
  IconCalendarTime,
  IconClock,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransitionArticle, useScheduleArticle } from "../hooks/use-articles";
import type { ArticleListItem } from "../types";

interface ArticleRowActionsProps {
  article: ArticleListItem;
}

export function ArticleRowActions({ article }: ArticleRowActionsProps) {
  const transition = useTransitionArticle();
  const scheduleMutation = useScheduleArticle();

  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [scheduledDateTime, setScheduledDateTime] = React.useState("");

  const handleStatusChange = (status: string) => {
    transition.mutate(
      { id: article.id, status },
      {
        onSuccess: () => {
          toast.success(`Article moved to ${status} successfully.`);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update article status.");
        },
      }
    );
  };

  const handleApplyPreset = (hoursFromNow: number, targetHour?: number) => {
    const d = new Date();
    if (targetHour !== undefined) {
      d.setDate(d.getDate() + 1);
      d.setHours(targetHour, 0, 0, 0);
    } else {
      d.setHours(d.getHours() + hoursFromNow);
    }
    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    const pad = (n: number) => n.toString().padStart(2, "0");
    const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setScheduledDateTime(localStr);
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDateTime) {
      toast.error("Please pick a publication date and time.");
      return;
    }

    const selectedDate = new Date(scheduledDateTime);
    if (selectedDate <= new Date()) {
      toast.error("Scheduled publication time must be in the future.");
      return;
    }

    scheduleMutation.mutate(
      { id: article.id, scheduledAt: selectedDate.toISOString() },
      {
        onSuccess: () => {
          setIsScheduleOpen(false);
          toast.success(
            `Article scheduled for publication at ${selectedDate.toLocaleDateString()} ${selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}!`
          );
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to schedule article.");
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem render={<Link href={`/studio/${article.id}`} />}>
            <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
            Edit in Studio
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link href={`/news/${article.slug}`} />}>
            <IconEye className="mr-2 h-4 w-4 text-muted-foreground" />
            Public Preview
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Workflow Transitions */}
          {article.status === "draft" && (
            <DropdownMenuItem onClick={() => handleStatusChange("review")}>
              <IconSend className="mr-2 h-4 w-4 text-amber-500" />
              Submit for Review
            </DropdownMenuItem>
          )}

          {article.status === "review" && (
            <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
              <IconCheck className="mr-2 h-4 w-4 text-emerald-500" />
              Approve Story
            </DropdownMenuItem>
          )}

          {(article.status === "approved" || article.status === "draft") && (
            <DropdownMenuItem
              onClick={() => {
                handleApplyPreset(1);
                setIsScheduleOpen(true);
              }}
            >
              <IconCalendarTime className="mr-2 h-4 w-4 text-indigo-500" />
              Schedule Publication…
            </DropdownMenuItem>
          )}

          {(article.status === "approved" || article.status === "draft" || article.status === "scheduled") && (
            <DropdownMenuItem onClick={() => handleStatusChange("published")}>
              <IconCheck className="mr-2 h-4 w-4 text-primary" />
              Publish Immediately
            </DropdownMenuItem>
          )}

          {article.status === "published" && (
            <DropdownMenuItem onClick={() => handleStatusChange("archived")}>
              <IconArchive className="mr-2 h-4 w-4 text-zinc-500" />
              Archive Story
            </DropdownMenuItem>
          )}

          {article.status === "archived" && (
            <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
              <IconCopy className="mr-2 h-4 w-4 text-muted-foreground" />
              Restore to Draft
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Schedule Publication Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <IconCalendarTime className="h-5 w-5 text-indigo-500" />
              Schedule Story Publication
            </DialogTitle>
            <DialogDescription className="text-xs">
              Automate publication. The newsroom background engine will release this story to the public portal and push news wires once the target timestamp arrives.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmSchedule} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border text-xs space-y-1">
              <div className="font-semibold text-foreground truncate">{article.title}</div>
              <div className="text-[11px] font-mono text-muted-foreground">/{article.slug}</div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-mono justify-start cursor-pointer"
                  onClick={() => handleApplyPreset(1)}
                >
                  <IconClock className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                  +1 Hour
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-mono justify-start cursor-pointer"
                  onClick={() => handleApplyPreset(3)}
                >
                  <IconClock className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                  +3 Hours
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-mono justify-start cursor-pointer"
                  onClick={() => handleApplyPreset(0, 8)}
                >
                  <IconCalendarTime className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                  Tomorrow 8:00 AM
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-mono justify-start cursor-pointer"
                  onClick={() => handleApplyPreset(0, 18)}
                >
                  <IconCalendarTime className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                  Tomorrow 6:00 PM
                </Button>
              </div>
            </div>

            {/* Custom Datetime Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Publication Timestamp (Local Time)</Label>
              <Input
                type="datetime-local"
                required
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={scheduleMutation.isPending}
              >
                {scheduleMutation.isPending && (
                  <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                Set Publication Schedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
