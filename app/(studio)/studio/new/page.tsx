"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Editor } from "@tiptap/react";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconLoader2,
  IconSend,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ArticleEditor } from "@/features/editor/components/editor";
import { MediaPicker } from "@/features/media/components/media-picker";
import {
  HeadlineFlagsSection,
  SummaryPublishingSection,
  FeaturedSeoPreviewSection,
} from "@/features/editor/components/sections";
import {
  articleFormSchema,
  type ArticleFormData,
} from "@/features/articles/schemas";
import { useCreateArticle, useTransitionArticle } from "@/features/articles/hooks/use-articles";
import { listCategories } from "@/lib/api/articles";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function NewArticlePage() {
  const router = useRouter();
  const editorRef = useRef<Editor | null>(null);
  const [editorContent, setEditorContent] = useState<unknown>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"featured" | "editor">("featured");
  const [publishIntent, setPublishIntent] = useState(false);

  const createArticle = useCreateArticle();
  const transition = useTransitionArticle();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const categories = categoriesData?.data || [];

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
      meta_title: "",
      meta_description: "",
      featured_image: "",
    },
  });

  const { handleSubmit, watch } = form;
  const title = watch("title");

  // Auto slug generation from title
  const slug = title
    ? title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    : "";

  const onInvalid = (errors: any) => {
    console.warn("Validation error on create:", errors);
    const firstField = Object.keys(errors)[0];
    const firstError = errors[firstField];
    toast.error(firstError?.message || `Please complete required fields (${firstField})`);
  };

  const onSubmit = async (data: ArticleFormData) => {
    try {
      const currentBody = editorRef.current ? editorRef.current.getJSON() : (editorContent || { type: "doc", content: [] });
      const response = await createArticle.mutateAsync({
        title: data.title,
        language: data.language || "en",
        excerpt: data.excerpt,
        body: currentBody,
        is_breaking: data.is_breaking,
        is_featured: data.is_featured,
        is_national: data.is_national,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        featured_image: data.featured_image,
        category_ids: data.category_ids,
        tag_ids: data.tag_ids,
      });

      const newId = response?.data?.id;

      if (publishIntent && newId) {
        // Save → immediately publish
        await transition.mutateAsync({ id: newId, status: "published" });
        toast.success("Article published successfully!", {
          description: "Your story is now live for readers.",
          action: slug
            ? {
                label: "View Live",
                onClick: () => window.open(`/news/${slug}`, "_blank"),
              }
            : undefined,
        });
        router.push("/panel/articles");
      } else if (newId) {
        toast.success("Draft saved.");
        router.push(`/studio/${newId}`);
      } else {
        router.push("/panel/articles");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save article");
    } finally {
      setPublishIntent(false);
    }
  };

  const isPending = createArticle.isPending || transition.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="min-h-[calc(100vh-3rem)] flex flex-col bg-background/50">
      {/* ─── Studio Top Action Bar ─── */}
      <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b bg-background/95 px-3 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" render={<Link href="/panel/articles" />}>
            <IconArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground font-mono">
            New Draft
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Draft */}
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold shadow-xs gap-1.5"
            disabled={isPending}
            onClick={() => setPublishIntent(false)}
          >
            {isPending && !publishIntent ? (
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconDeviceFloppy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            Save Draft
          </Button>

          {/* Publish Now */}
          <Button
            type="submit"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            disabled={isPending}
            onClick={() => setPublishIntent(true)}
          >
            {isPending && publishIntent ? (
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconSend className="h-3.5 w-3.5" />
            )}
            Publish Now
          </Button>
        </div>
      </div>

      {/* ─── Main Studio Workspace: 4 Structured Sections ─── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-3 sm:p-6 lg:p-8">
        {/* Section 1: Headline & Slug (Left 70%) | Editorial Flags (Right 30%) */}
        <HeadlineFlagsSection form={form} slug={slug} />

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
          slug={slug}
          onOpenMediaPicker={() => {
            setMediaPickerTarget("featured");
            setIsMediaPickerOpen(true);
          }}
        />
      </div>

      {/* ─── Media Library Modal ─── */}
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
    </form>
  );
}
