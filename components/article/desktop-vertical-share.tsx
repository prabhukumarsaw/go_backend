"use client";

import { useEffect, useState } from "react";
import {
  IconBrandWhatsapp,
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconCopy,
  IconCheck,
  IconTextSize,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DesktopVerticalShareProps {
  articleTitle: string;
  articleSlug: string;
}

export function DesktopVerticalShare({
  articleTitle,
  articleSlug,
}: DesktopVerticalShareProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      toast.success("Article link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const cycleFontSize = () => {
    const nextSize = fontSize === "normal" ? "large" : fontSize === "large" ? "xlarge" : "normal";
    setFontSize(nextSize);
    const contentEls = document.querySelectorAll(".article-content, #article-reading-container");
    contentEls.forEach((el) => {
      el.setAttribute("data-font-size", nextSize);
    });
    toast.success(`फ़ॉन्ट आकार: ${nextSize === "normal" ? "सामान्य (Standard)" : nextSize === "large" ? "बड़ा (Large)" : "अतिरिक्त बड़ा (X-Large)"}`);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${articleTitle} - ${shareUrl}`
  )}`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    articleTitle
  )}&url=${encodeURIComponent(shareUrl)}`;

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <aside
      aria-label="Social sharing"
      className="flex flex-col items-center gap-2 p-1 rounded-2xl bg-card/90 backdrop-blur-md border border-border/70 shadow-xs"
    >
      <span className="text-[10px] font-bold font-hindi text-muted-foreground pt-1.5 pb-0.5">
        शेयर
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/30 transition-all shadow-2xs"
        onClick={() => window.open(whatsappUrl, "_blank")}
        title="WhatsApp पर शेयर करें"
      >
        <IconBrandWhatsapp className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30 transition-all shadow-2xs"
        onClick={() => window.open(tweetUrl, "_blank")}
        title="X (Twitter) पर शेयर करें"
      >
        <IconBrandTwitter className="h-3.5 w-3.5 text-sky-500" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/30 transition-all shadow-2xs"
        onClick={() => window.open(fbUrl, "_blank")}
        title="Facebook पर शेयर करें"
      >
        <IconBrandFacebook className="h-3.5 w-3.5 text-blue-600" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-muted transition-all shadow-2xs"
        onClick={handleCopy}
        title="लिंक कॉपी करें"
      >
        {copied ? (
          <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <IconCopy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </Button>

      <div className="w-4 border-b border-border/80 my-0.5" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground transition-all"
        onClick={cycleFontSize}
        title="फ़ॉन्ट आकार बदलें"
      >
        <IconTextSize className="h-3.5 w-3.5" />
      </Button>
    </aside>
  );
}
