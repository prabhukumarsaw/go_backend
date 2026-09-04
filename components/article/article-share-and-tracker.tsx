"use client";

import { useEffect, useState } from "react";
import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandWhatsapp,
  IconCopy,
  IconCheck,
  IconShare,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useFeedPersonalization } from "@/lib/hooks/use-feed-personalization";

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

  useEffect(() => {
    setShareUrl(window.location.href);
    trackArticleRead(articleId, categories);
  }, [articleId, categories, trackArticleRead]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
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

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3">
      <span className="text-xs font-mono text-muted-foreground mr-1 flex items-center gap-1">
        <IconShare className="h-3.5 w-3.5" /> Share:
      </span>

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-xs gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
        onClick={() => window.open(whatsappUrl, "_blank")}
      >
        <IconBrandWhatsapp className="h-4 w-4 text-emerald-500" />
        WhatsApp
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-xs gap-1.5"
        onClick={() => window.open(tweetUrl, "_blank")}
      >
        <IconBrandTwitter className="h-3.5 w-3.5" />
        X / Post
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-xs gap-1.5"
        onClick={() => window.open(linkedinUrl, "_blank")}
      >
        <IconBrandLinkedin className="h-3.5 w-3.5 text-blue-600" />
        LinkedIn
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-xs gap-1.5"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
            Copied!
          </>
        ) : (
          <>
            <IconCopy className="h-3.5 w-3.5" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  );
}
