"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IconMenu2, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import type { Category } from "@/types/content";

export interface NavbarMoreMenuProps {
  categories?: Category[];
}

export function NavbarMoreMenu({ categories = [] }: NavbarMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setExpandedCat(null);
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setExpandedCat(null);
      }
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
        className={`relative flex items-center gap-1.5 py-1.5 px-2 text-[13.5px] xl:text-[14px] font-semibold font-hindi whitespace-nowrap transition-all after:content-[''] after:absolute after:bottom-0 after:left-1.5 after:right-1.5 after:h-[2.5px] after:bg-red-500 after:transition-all focus:outline-hidden ${
          isOpen
            ? "text-white font-bold after:opacity-100 after:scale-x-100"
            : "text-white/90 hover:text-white after:opacity-0 hover:after:opacity-100"
        }`}
        aria-label="More categories"
      >
        <IconMenu2 className="h-4 w-4" />
        <IconChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : "text-white/70"
          }`}
        />
      </button>

      {/* Dynamic Database Driven Dropdown Menu with hover bridge */}
      {isOpen && (
        <div
          className="absolute left-0 top-full z-[70] mt-1 w-64 rounded-xl bg-[#052824] py-2.5 shadow-2xl animate-in fade-in-0 slide-in-from-top-1 duration-150 border border-[#0d443f]/60 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
          role="menu"
        >
          <div className="max-h-[75vh] overflow-y-auto scrollbar-none px-2 space-y-1">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const children = cat.children || [];
                const hasChildren = children.length > 0;
                const isExpanded = expandedCat === cat.id;

                return (
                  <div key={cat.id} className="rounded-lg hover:bg-[#083631] transition-colors">
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <Link
                        href={`/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-white hover:text-rose-400 transition-colors flex-1"
                      >
                        {cat.name}
                      </Link>

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCat(isExpanded ? null : cat.id);
                          }}
                          className="p-1 text-white/60 hover:text-white transition-colors"
                        >
                          <IconChevronRight
                            className={`h-3.5 w-3.5 transition-transform duration-150 ${
                              isExpanded ? "rotate-90 text-rose-400" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Sub-menu items from Database */}
                    {hasChildren && isExpanded && (
                      <div className="pl-4 pr-2 pb-2 pt-1 space-y-1 bg-[#041d1a]/60 rounded-b-lg border-l-2 border-rose-500/60 ml-2">
                        {children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/${cat.slug}?sub=${sub.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="block px-2 py-1 text-xs text-white/80 hover:text-white hover:bg-[#0a443d] rounded transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-white/50">
                श्रेणियां लोड हो रही हैं...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
