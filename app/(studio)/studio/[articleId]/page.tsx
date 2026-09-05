"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Editor } from "@tiptap/react";
import {
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconSend,
  IconArchive,
  IconEye,
  IconExternalLink,
  IconLoader2,
  IconAdjustments,
  IconDotsVertical,
} from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArticleEditor } from "@/features/editor/components/editor";
import {
  HeadlineFlagsSection,
  SummaryPublishingSection,
  FeaturedSeoPreviewSection,
} from "@/features/editor/components/sections";
import { ArticleStatusBadge } from "@/features/articles/components/article-status-badge";
import { MediaPicker } from "@/features/media/components/media-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  articleFormSchema,
  type ArticleFormData,
} from "@/features/articles/schemas";
import {
  useArticle,
  useTransitionArticle,
  useUpdateArticle,
} from "@/features/articles/hooks/use-articles";
import { listCategories } from "@/lib/api/articles";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = use(params);
  const router = useRouter();
  const editorRef = useRef<Editor | null>(null);
  const [editorContent, setEditorContent] = useState<unknown>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"featured" | "editor">("featured");

  const { data: articleData, isLoading, isError, refetch } = useArticle(articleId);
  const transition = useTransitionArticle();
  const updateArticle = useUpdateArticle();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const categories = categoriesData?.data || [];
  const article = articleData?.data;

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      language: "en",
      excerpt: "",
      is_breaking: false,
      is_featured: false,
      is_national: false,
      category_ids: [],
      tag_ids: [],
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = form;

  // Hydrate form when article data loads
  useEffect(() => {
    if (article) {
      reset({
        title: article.title || "",
        language: article.language || "en",
        excerpt: article.excerpt || "",
        is_breaking: Boolean(article.is_breaking),
        is_featured: Boolean(article.is_featured),
        is_national: Boolean(article.is_national),
        meta_title: article.meta_title || "",
        meta_description: article.meta_description || "",
        featured_image: article.featured_image || "",
        category_ids: article.category_ids || [],
        tag_ids: [],
      });
      if (article.body) {
        setEditorContent(article.body);
      }
    }
  }, [article, reset]);

  const onInvalid = (errors: any) => {
    console.warn("Validation error on save:", errors);
    const firstField = Object.keys(errors)[0];
    const firstError = errors[firstField];
    toast.error(firstError?.message || `Please complete required fields (${firstField})`);
  };

  const handleStatusTransition = async (newStatus: string) => {
    try {
      await transition.mutateAsync({ id: articleId, status: newStatus });
      toast.success(`Article moved to ${newStatus}`);
      if (newStatus === "published" || newStatus === "archived") {
        router.push("/panel/articles");
      }
    } catch (err: any) {
      toast.error(err?.message || `Failed to transition article to ${newStatus}`);
    }
  };

  const handleSave = async (data: ArticleFormData) => {
    try {
      const currentBody = editorRef.current ? editorRef.current.getJSON() : (editorContent || article?.body || { type: "doc", content: [] });
      await updateArticle.mutateAsync({
        id: articleId,
        input: {
          ...data,
          body: currentBody,
        },
      });
      toast.success("Changes saved.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save story");
    }
  };

  const handleSaveAndPublish = async (data: ArticleFormData) => {
    try {
      const currentBody = editorRef.current ? editorRef.current.getJSON() : (editorContent || article?.body || { type: "doc", content: [] });
      await updateArticle.mutateAsync({
        id: articleId,
        input: { ...data, body: currentBody },
      });
      const isAlreadyPublished = article?.status === "published";
      if (!isAlreadyPublished) {
        await transition.mutateAsync({ id: articleId, status: "published" });
      }
      toast.success(
        isAlreadyPublished ? "Article updated live!" : "Article published successfully!",
        {
          description: "Your story is live for readers.",
          action: article?.slug
            ? {
                label: "View Live",
                onClick: () => window.open(`/news/${article.slug}`, "_blank"),
              }
            : undefined,
        }
      );
      router.push("/panel/articles");
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading article in Studio…" variant="page" />;
  }

  if (isError || !article) {
    return (
      <div className="p-8">
        <ErrorState
          title="Article not found"
          message="Could not load the requested article from the newsroom API."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col">
      {/* Studio Header Actions */}
      <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b bg-background/95 px-4 sm:px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" render={<Link href="/panel/articles" />}>
            <IconArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <ArticleStatusBadge status={article.status} />
          {article.slug && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              render={<Link href={`/news/${article.slug}`} target="_blank" />}
            >
              {article.status === "published" ? (
                <>
                  <IconExternalLink className="h-3 w-3" />
                  View Live
                </>
              ) : (
                <>
                  <IconEye className="h-3 w-3" />
                  Preview
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Save (always visible) */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5 shadow-xs"
            onClick={handleSubmit(handleSave, onInvalid)}
            disabled={updateArticle.isPending || transition.isPending}
          >
            {updateArticle.isPending ? (
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconDeviceFloppy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            Save
          </Button>

          {/* Context-aware primary: Publish Now / Update Live */}
          {article.status === "draft" && (
            <Button
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              onClick={handleSubmit(handleSaveAndPublish, onInvalid)}
              disabled={updateArticle.isPending || transition.isPending}
            >
              {transition.isPending ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : <IconSend className="h-3.5 w-3.5" />}
              Publish Now
            </Button>
          )}
          {article.status === "published" && (
            <Button
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              onClick={handleSubmit(handleSaveAndPublish, onInvalid)}
              disabled={updateArticle.isPending || transition.isPending}
            >
              {transition.isPending ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : <IconCheck className="h-3.5 w-3.5" />}
              Update Live
            </Button>
          )}
          {(article.status === "review" || article.status === "approved") && (
            <Button
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              onClick={handleSubmit(handleSaveAndPublish, onInvalid)}
              disabled={updateArticle.isPending || transition.isPending}
            >
              {transition.isPending ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : <IconSend className="h-3.5 w-3.5" />}
              Publish Now
            </Button>
          )}

          {/* Overflow more-actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={transition.isPending}>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-44">
              {article.status === "draft" && (
                <DropdownMenuItem onClick={() => handleStatusTransition("review")}>
                  <IconSend className="mr-2 h-4 w-4 text-amber-500" />
                  Submit for Review
                </DropdownMenuItem>
              )}
              {article.status === "review" && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusTransition("approved")}>
                    <IconCheck className="mr-2 h-4 w-4 text-emerald-500" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusTransition("draft")}>
                    Return to Draft
                  </DropdownMenuItem>
                </>
              )}
              {article.status === "approved" && (
                <DropdownMenuItem onClick={() => handleStatusTransition("review")}>
                  Return to Review
                </DropdownMenuItem>
              )}
              {(article.status === "published" || article.status === "draft") && (
                <DropdownMenuItem onClick={() => handleStatusTransition("archived")} className="text-destructive">
                  <IconArchive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              {article.status === "published" && (
                <DropdownMenuItem onClick={() => handleStatusTransition("draft")}>
                  Revert to Draft
                </DropdownMenuItem>
              )}
              {article.status === "archived" && (
                <DropdownMenuItem onClick={() => handleStatusTransition("draft")}>
                  Restore to Draft
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {/* ─── Main Studio Workspace: 4 Structured Sections ─── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-3 sm:p-6 lg:p-8">
        {/* Section 1: Headline & Slug (Left 70%) | Editorial Flags (Right 30%) */}
        <HeadlineFlagsSection form={form} slug={article.slug || ""} />

        {/* Section 2: Summary / Excerpt (Left 70%) | Publishing Settings (Right 30%) */}
        <SummaryPublishingSection form={form} categories={categories} />

        {/* Section 3: Article Editor (Full Width 100%) */}
        <div className="w-full min-w-0">
          <ArticleEditor
            content={editorContent}
            onChange={(json) => setEditorContent(json)}
            onEditorReady={(ed) => {
              editorRef.current = ed;
            }}
            onOpenMediaPicker={() => {
              setMediaPickerTarget("editor");
              setIsMediaPickerOpen(true);
            }}
          />
        </div>

        {/* Section 4: Featured Image (Left 40%) | SEO Form (Center 30%) | Live Preview (Right 30%) */}
        <FeaturedSeoPreviewSection
          form={form}
          slug={article.slug || ""}
          onOpenMediaPicker={() => {
            setMediaPickerTarget("featured");
            setIsMediaPickerOpen(true);
          }}
        />
      </div>

      <MediaPicker
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={({ url, alt, isVideo }) => {
          if (mediaPickerTarget === "featured") {
            form.setValue("featured_image", url, { shouldDirty: true, shouldValidate: true });
          } else if (mediaPickerTarget === "editor") {
            if (editorRef.current) {
              const ed = editorRef.current;
              const isVideoFile = isVideo || /\.(mp4|webm|mov)$/i.test(url);
              if (isVideoFile) {
                ed.chain().focus().setVideo({ src: url, title: alt || "Short Video" }).run();
              } else {
                ed.chain()
                  .focus()
                  .insertContent({
                    type: "image",
                    attrs: {
                      src: url,
                      alt: alt || "",
                    },
                  })
                  .run();
              }
            }
          }
        }}
      />
    </div>
  );
}
