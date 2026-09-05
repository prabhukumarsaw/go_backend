"use client";

import { useEffect, useState } from "react";
import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconCopy,
  IconCheck,
  IconShare,
  IconTextSize,
  IconArrowUp,
  IconBookmark,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useFeedPersonalization } from "@/lib/hooks/use-feed-personalization";
import { toast } from "sonner";

interface ArticleShareAndTrackerProps {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  categories: string[];
}

export function ArticleShareAndTracker({
  articleId,
  articleTitle,
  articleSlug,
  categories,
}: ArticleShareAndTrackerProps) {
  const { trackArticleRead } = useFeedPersonalization();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  useEffect(() => {
    setShareUrl(window.location.href);
    trackArticleRead(articleId, categories);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [articleId, categories, trackArticleRead]);

  // Set reading font size via data-attribute on reader containers
  const applyFontSize = (size: "normal" | "large" | "xlarge") => {
    setFontSize(size);
    const contentEls = document.querySelectorAll(".article-content, #article-reading-container");
    contentEls.forEach((el) => {
      el.setAttribute("data-font-size", size);
    });
    toast.success(`फ़ॉन्ट आकार: ${size === "normal" ? "सामान्य (Standard)" : size === "large" ? "बड़ा (Large)" : "बहुत बड़ा (X-Large)"}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    articleTitle
  )}&url=${encodeURIComponent(shareUrl)}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${articleTitle} - ${shareUrl}`
  )}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* ─── Sleek Reading Progress Line (Aaj Tak Red Accent) ─── */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Social Share Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1 font-hindi">
            <IconShare className="h-3.5 w-3.5 text-red-600" /> शेयर करें:
          </span>

          {/* WhatsApp Primary Aaj Tak Style */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] border-[#25D366]/30 font-medium transition-all"
            onClick={() => window.open(whatsappUrl, "_blank")}
          >
            <IconBrandWhatsapp className="h-4 w-4 text-[#25D366]" />
            <span className="font-semibold">WhatsApp</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 hover:text-sky-500 hover:border-sky-500/30 transition-all"
            onClick={() => window.open(tweetUrl, "_blank")}
          >
            <IconBrandTwitter className="h-3.5 w-3.5 text-sky-500" />
            <span className="hidden sm:inline">X (Twitter)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 hover:text-blue-600 hover:border-blue-500/30 transition-all"
            onClick={() => window.open(facebookUrl, "_blank")}
          >
            <IconBrandLinkedin className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 transition-all"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">कॉपी हुआ!</span>
              </>
            ) : (
              <>
                <IconCopy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-hindi">लिंक कॉपी</span>
              </>
            )}
          </Button>
        </div>

        {/* Reader Comfort / Wikipedia-style Font Size Switcher */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
          <span className="text-[11px] font-hindi text-muted-foreground px-1.5 hidden xs:inline">
            फ़ॉन्ट:
          </span>
          <button
            type="button"
            onClick={() => applyFontSize("normal")}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
              fontSize === "normal"
                ? "bg-card text-red-600 shadow-xs border border-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="सामान्य आकार (Normal text)"
          >
            अ
          </button>
          <button
            type="button"
            onClick={() => applyFontSize("large")}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
              fontSize === "large"
                ? "bg-card text-red-600 shadow-xs border border-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="बड़ा आकार (Large text)"
          >
            अ+
          </button>
          <button
            type="button"
            onClick={() => applyFontSize("xlarge")}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
              fontSize === "xlarge"
                ? "bg-card text-red-600 shadow-xs border border-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="अतिरिक्त बड़ा आकार (Extra Large text)"
          >
            अ++
          </button>
        </div>
      </div>

      {/* Floating Back To Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-red-600 text-white shadow-xl flex items-center justify-center hover:bg-red-700 hover:scale-105 active:scale-95 transition-all"
          title="ऊपर जाएं / Back to Top"
        >
          <IconArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
