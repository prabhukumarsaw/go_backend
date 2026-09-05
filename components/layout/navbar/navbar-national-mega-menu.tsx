"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconChevronDown } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { listArticles, listCategoriesTree } from "@/lib/api/articles";
import type { Category } from "@/types/content";

interface NationalMegaMenuProps {
  isActive?: boolean;
}

export function NavbarNationalMegaMenu({ isActive = false }: NationalMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Dynamic categories fetched from backend database
  const { data: treeData } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: () => listCategoriesTree(),
    staleTime: 5 * 60 * 1000,
  });

  const categories: Category[] = treeData?.data || [];
  const nationalCategory = categories.find((c) => c.slug === "national" || c.name === "भारत");

  // Regional state sub-desks under भारत
  const regionalDesks: Category[] = nationalCategory?.children || [];

  // 2. Real articles fetched from backend database
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ["national-articles"],
    queryFn: () => listArticles({ per_page: 4, category: "national" }),
    staleTime: 2 * 60 * 1000,
  });

  const articles = articlesData?.data || [];

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`relative flex items-center gap-1 py-1.5 px-2 text-[13.5px] xl:text-[14px] font-semibold font-hindi whitespace-nowrap transition-all after:content-[''] after:absolute after:bottom-0 after:left-1.5 after:right-1.5 after:h-[2.5px] after:bg-red-500 after:transition-all focus:outline-hidden ${
          isOpen || isActive
            ? "text-white font-bold after:opacity-100 after:scale-x-100"
            : "text-white/90 hover:text-white after:opacity-0 hover:after:opacity-100"
        }`}
      >
        <span>{nationalCategory?.name || "देश"}</span>
        <IconChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : "text-white/70"
          }`}
        />
      </button>

      {/* Dynamic National Mega Menu Dropdown */}
      {isOpen && (
        <div
          className="fixed left-0 right-0 z-[70] mx-auto w-full max-w-[1536px] px-3 sm:px-6 lg:px-8 top-14 sm:top-[58px] before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
          role="menu"
        >
          <div className="rounded-b-xl border border-t-0 border-[#0d443f] bg-[#062320] text-white p-6 shadow-2xl animate-in fade-in-0 slide-in-from-top-1 duration-150">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: राज्य डेस्क (State Sub-Desks from DB) */}
              <div className="col-span-4 border-r border-[#0d443f]/60 pr-6">
                <h3 className="text-sm font-bold text-rose-500 mb-3 tracking-wide">
                  राज्य व क्षेत्रीय डेस्क ({regionalDesks.length} राज्य)
                </h3>
                {regionalDesks.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-y-2 gap-x-4 max-h-72 overflow-y-auto scrollbar-none pr-1">
                    {regionalDesks.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/national?sub=${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block text-xs text-white/90 hover:text-rose-400 font-medium transition-colors py-0.5 truncate"
                          title={item.name}
                        >
                          • {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-white/50 py-2">लोड हो रहा है...</div>
                )}
              </div>

              {/* Right Section: ताज़ातरीन राष्ट्रीय खबरें (Live Articles from DB) */}
              <div className="col-span-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-rose-500 tracking-wide">
                    ताज़ातरीन राष्ट्रीय खबरें (National Headlines)
                  </h3>
                  <Link
                    href="/national"
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] text-white/70 hover:text-white font-medium transition-colors"
                  >
                    सभी खबरें देखें &rarr;
                  </Link>
                </div>

                {articlesLoading ? (
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col space-y-2 animate-pulse">
                        <div className="aspect-video w-full rounded-lg bg-white/10" />
                        <div className="h-3 w-3/4 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : articles.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {articles.map((article) => {
                      const articleUrl = `/article/${article.slug}`;
                      const imgUrl = (article as any).featured_image_url || "/assets/newsplaceholder.webp";
                      return (
                        <Link
                          key={article.id}
                          href={articleUrl}
                          onClick={() => setIsOpen(false)}
                          className="group flex flex-col space-y-2"
                        >
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/40 border border-white/10 shadow-xs">
                            <Image
                              src={imgUrl}
                              alt={article.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 220px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <p className="line-clamp-2 text-xs font-semibold text-white/90 group-hover:text-rose-400 leading-snug transition-colors">
                            {article.title}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-white/60">
                    राष्ट्रीय डेस्क से नई खबरें जल्द उपलब्ध होंगी।
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
