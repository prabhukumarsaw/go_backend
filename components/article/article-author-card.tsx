import Link from "next/link";
import {
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconBrandYoutube,
  IconRosetteDiscountCheck,
} from "@tabler/icons-react";

interface ArticleAuthorCardProps {
  authorName: string;
  authorAvatar?: string;
  authorBio?: string;
}

export function ArticleAuthorCard({
  authorName,
  authorAvatar,
  authorBio,
}: ArticleAuthorCardProps) {
  const name = authorName || "Digital Desk Bureau";
  const initial = name.charAt(0).toUpperCase();
  const bio =
    authorBio ||
    "Senior investigative correspondent tracking governance, legal developments, law enforcement, and regional affairs.";

  return (
    <div className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 my-8 flex flex-col sm:flex-row gap-5 items-center sm:items-start shadow-xs transition-all">
      <div className="relative h-20 w-20 sm:h-22 sm:w-22 rounded-full overflow-hidden shrink-0 ring-3 ring-red-500/20 shadow-md bg-muted/60 flex items-center justify-center">
        {authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={authorAvatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl sm:text-3xl font-bold font-mono text-primary">
            {initial}
          </span>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left space-y-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-base sm:text-lg text-foreground hover:text-red-600 transition-colors">
              {name}
            </h3>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              <IconRosetteDiscountCheck className="h-3 w-3" />
              Verified
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Author Twitter"
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-sky-500 hover:border-sky-500/30 transition-all"
            >
              <IconBrandTwitter className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Author Facebook"
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-600/30 transition-all"
            >
              <IconBrandFacebook className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Author YouTube"
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-red-600 hover:border-red-600/30 transition-all"
            >
              <IconBrandYoutube className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Author WhatsApp"
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-600/30 transition-all"
            >
              <IconBrandWhatsapp className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
          {bio}
        </p>
      </div>
    </div>
  );
}
