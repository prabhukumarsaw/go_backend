import { IconCamera } from "@tabler/icons-react";

interface ArticleHeroProps {
  featuredImage?: string;
  title: string;
  caption?: string;
}

export function ArticleHero({ featuredImage, title, caption }: ArticleHeroProps) {
  if (!featuredImage) return null;

  return (
    <figure className="my-5 sm:my-6">
      <div className="relative aspect-[16/9] w-full min-h-[220px] sm:min-h-[340px] md:min-h-[440px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-border/80 bg-muted/30 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={featuredImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
        />
      </div>
      {caption && (
        <figcaption className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 px-1 font-hindi">
          <IconCamera className="h-3.5 w-3.5 text-red-600 shrink-0" />
          <span className="font-semibold text-foreground/80">फोटो क्रेडिट:</span>
          <span>{caption}</span>
        </figcaption>
      )}
    </figure>
  );
}
