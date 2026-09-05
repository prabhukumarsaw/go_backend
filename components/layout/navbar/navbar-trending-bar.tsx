"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  IconChevronRight,
  IconChevronLeft,
  IconFlame,
  IconHash,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { listTrendingTags } from "@/lib/api/articles";

// Fallback high-traffic trending news tags (Hindi broadcast topics)
const defaultTrendingTags = [
  { name: "क्रिकेट", slug: "cricket" },
  { name: "बिहार", slug: "bihar" },
  { name: "झारखंड", slug: "jharkhand" },
  { name: "मौसम", slug: "weather" },
  { name: "चुनाव 2026", slug: "elections-2026" },
  { name: "राजनीति", slug: "politics" },
  { name: "बॉलीवुड", slug: "bollywood" },
  { name: "देश", slug: "national" },
  { name: "कारोबार", slug: "business" },
  { name: "टेक्नोलॉजी", slug: "technology" },
  { name: "राशिफल", slug: "rashifal" },
  { name: "शिक्षा", slug: "education" },
  { name: "विश्व", slug: "world" },
];

export function NavbarTrendingBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Top tags by usage_count (backend sorts, limit 15)
  const { data: tagsData } = useQuery({
    queryKey: ["trending-tags-bar"],
    queryFn: () => listTrendingTags(15),
    staleTime: 5 * 60 * 1000,
  });

  const apiTags = tagsData?.data || [];

  // Merge backend tags with default tags to ensure rich content
  const displayTags =
    apiTags.length >= 6
      ? apiTags.map((t) => ({ name: t.name, slug: t.slug }))
      : [
          ...apiTags.map((t) => ({ name: t.name, slug: t.slug })),
          ...defaultTrendingTags.filter(
            (dt) => !apiTags.some((at) => at.slug === dt.slug || at.name === dt.name)
          ),
        ];

  // Check scroll position to toggle navigation buttons & fade masks
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, displayTags]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -220 : 220;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    // Hidden in mobile view (< sm:), visible on tablet and desktop (sm:block)
    <div className="hidden sm:block w-full bg-[#051f1c] border-b border-[#0d3f3a] select-none">
      <div className="relative mx-auto flex h-8 max-w-[1536px] items-center px-3 sm:px-5 lg:px-6 overflow-hidden">

        {/* ── Logo overflow spacer ── aligns trending strip start to right of the absolute logo above */}
        <div className="w-[132px] shrink-0" aria-hidden="true" />

        {/* ── Section badge ── */}
        <div className="flex items-center gap-1 bg-red-600 text-white font-bold text-[10.5px] px-2 py-0.5 rounded-sm shrink-0 mr-3 shadow-xs">
          <IconFlame className="h-3 w-3" />
          <span className="font-hindi">ट्रेंडिंग</span>
          <IconChevronRight className="h-3 w-3 opacity-80" />
        </div>

        {/* ── Scrollable tags container with left/right fade masks and arrows ── */}
        <div className="relative flex-1 min-w-0 flex items-center overflow-hidden">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll tags left"
              className="absolute left-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#051f1c]/90 text-white/90 hover:text-white hover:bg-red-600 border border-white/20 shadow-md transition-all focus:outline-hidden"
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Left subtle fade gradient */}
          {canScrollLeft && (
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#051f1c] to-transparent z-[5]"
              aria-hidden="true"
            />
          )}

          {/* Tags Flex Row */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap flex-1 min-w-0 py-0.5 px-1 scroll-smooth"
          >
            {displayTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="group flex items-center gap-0.5 px-2 py-0.5 rounded-sm bg-white/8 hover:bg-red-600 border border-white/10 hover:border-red-500/70 text-white/85 hover:text-white transition-all duration-150 text-[11px] font-semibold font-hindi whitespace-nowrap shadow-2xs shrink-0"
                title={`#${tag.name}`}
              >
                <IconHash className="h-2.5 w-2.5 text-red-400 group-hover:text-white opacity-80 shrink-0 transition-colors" />
                <span>{tag.name}</span>
              </Link>
            ))}
          </div>

          {/* Right subtle fade gradient */}
          {canScrollRight && (
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#051f1c] to-transparent z-[5]"
              aria-hidden="true"
            />
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Scroll tags right"
              className="absolute right-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#051f1c]/90 text-white/90 hover:text-white hover:bg-red-600 border border-white/20 shadow-md transition-all focus:outline-hidden"
            >
              <IconChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
