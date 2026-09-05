"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { listCategoriesTree } from "@/lib/api/articles";
import type { Category } from "@/types/content";

interface CityMegaMenuProps {
  label?: string;
  parentSlug?: string;
  isActive?: boolean;
}

export function NavbarCityMegaMenu({
  label = "बिहार",
  parentSlug = "bihar",
  isActive = false,
}: CityMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch dynamic categories tree directly from database API
  const { data: treeData, isLoading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: () => listCategoriesTree(),
    staleTime: 5 * 60 * 1000,
  });

  const allCategories: Category[] = treeData?.data || [];
  const parentCategory = allCategories.find(
    (c) => c.slug === parentSlug
  );
  const districtSubDesks: Category[] = parentCategory?.children || [];

  // Split into major districts (first 6) and other district desks
  const majorDistricts = districtSubDesks.slice(0, 6);
  const otherDistricts = districtSubDesks.slice(6);

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
      ref={containerRef}
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
        <span>{parentCategory?.name || label}</span>
        <IconChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : "text-white/70"
          }`}
        />
      </button>

      {/* Dynamic District Mega Menu Dropdown */}
      {isOpen && (
        <div
          className="fixed left-0 right-0 z-[70] mx-auto w-full max-w-[1536px] px-3 sm:px-6 lg:px-8 top-14 sm:top-[58px] before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
          role="menu"
        >
          <div className="rounded-b-xl border border-t-0 border-[#0d443f] bg-[#062320] text-white p-6 shadow-2xl animate-in fade-in-0 slide-in-from-top-1 duration-150">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-white/50 animate-pulse font-hindi">
                जिला डेस्क लोड हो रहे हैं...
              </div>
            ) : districtSubDesks.length > 0 ? (
              <div className="grid grid-cols-12 gap-8">
                {/* Left Column: प्रमुख जिला केंद्र (Major Districts from DB) */}
                <div className="col-span-4 border-r border-[#0d443f]/60 pr-6">
                  <h3 className="text-sm font-bold text-rose-500 mb-3 tracking-wide">
                    प्रमुख जिला केंद्र ({parentCategory?.name || label})
                  </h3>
                  <ul className="space-y-2">
                    {majorDistricts.map((district) => (
                      <li key={district.id}>
                        <Link
                          href={`/${parentSlug}?sub=${district.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block text-xs text-white/90 hover:text-rose-400 font-medium transition-colors py-0.5"
                        >
                          {district.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Section: सभी जिला डेस्क (All District Sub-Desks from DB) */}
                <div className="col-span-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-rose-500 tracking-wide">
                      सभी जिला व क्षेत्रीय डेस्क ({districtSubDesks.length} जिले)
                    </h3>
                    <Link
                      href={`/${parentSlug}`}
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] text-white/70 hover:text-white font-medium transition-colors"
                    >
                      सभी जिले देखें &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-y-2.5 gap-x-6 max-h-64 overflow-y-auto scrollbar-none pr-1">
                    {otherDistricts.map((district) => (
                      <Link
                        key={district.id}
                        href={`/${parentSlug}?sub=${district.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-white/85 hover:text-rose-400 font-medium transition-colors py-0.5 truncate"
                        title={district.name}
                      >
                        {district.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-white/60">
                कोई जिला डेस्क उपलब्ध नहीं है।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
