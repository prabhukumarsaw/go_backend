"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconMenu2,
  IconX,
  IconSearch,
  IconPencil,
  IconSun,
  IconMoon,
  IconChevronRight,
  IconFlame,
  IconDeviceTv,
} from "@tabler/icons-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/components/providers/auth-provider";
import { useTenant } from "@/components/providers/tenant-provider";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { listCategoriesTree } from "@/lib/api/articles";
import type { Category } from "@/types/content";

const editionPills = [
  { name: "National", active: true },
  { name: "Hindi", active: false },
  { name: "English", active: false },
  { name: "Regional", active: false },
];

export function NavbarMobileDrawer() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedCatId, setExpandedCatId] = useState<number | null>(null);
  const router = useRouter();
  const { siteName, logoUrl } = useTenant();
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, isStaff } = useAuth();

  // Dynamic categories tree fetched from database API
  const { data: treeData, isLoading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: () => listCategoriesTree(),
    staleTime: 5 * 60 * 1000,
  });

  const categories: Category[] = treeData?.data || [];
  const quickCategories = categories.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Direct button — avoids SheetTrigger render prop issues on mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden"
        aria-label="Open Navigation Menu"
        aria-expanded={open}
        aria-controls="mobile-navigation-drawer"
      >
        <IconMenu2 className="h-5 w-5" />
      </button>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[82vw] max-w-[340px] p-0 flex flex-col h-full bg-[#181d1c] text-white border-r border-[#0d3834] overflow-hidden"
      >
        {/* Drawer Header: Logo + Green Circular Close Button */}
        <div className="flex h-14 items-center justify-between px-4 bg-[#072e2a] shrink-0 border-b border-[#0d3834]/60">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >
            <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded">
              <Image
                src={logoUrl || "/assets/logo.png"}
                alt={siteName || "Naxatra News"}
                fill
                sizes="36px"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif font-black text-sm text-white">
                NAXATRA
              </span>
              <span className="text-[10px] font-bold text-amber-400">
                समाचार +
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#07473e] hover:bg-[#09574c] text-white transition-colors"
            aria-label="Close menu"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-none">
          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center rounded-full border border-white/20 bg-[#222827] px-3.5 py-2">
              <IconSearch className="h-4 w-4 text-white/60 mr-2 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="समाचार, वीडियो या विषय खोजें..."
                className="w-full bg-transparent text-xs text-white placeholder:text-white/50 focus:outline-hidden"
              />
            </div>
          </form>

          {/* Language / Edition Switcher */}
          <div>
            <div className="text-xs font-semibold text-white/90 mb-2 font-mono text-[10px] uppercase tracking-wider text-white/60">
              भाषा / संस्करण
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-white/80">
              {editionPills.map((lang) => (
                <button
                  key={lang.name}
                  type="button"
                  className={`transition-colors font-medium text-xs ${
                    lang.active ? "text-amber-400 font-bold" : "hover:text-white"
                  }`}
                >
                  • {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick News Access: Live TV + Dynamic Top Categories */}
          <div className="border-t border-white/10 pt-4">
            <div className="text-[10px] font-bold tracking-wider uppercase text-white/60 mb-3 font-mono">
              प्रमुख डेस्क (Quick Desks)
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <Link
                href="/live"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded-lg bg-[#222827] p-2 text-rose-400 font-bold hover:bg-[#2c3433] transition-colors"
              >
                <IconDeviceTv className="h-4 w-4 shrink-0" />
                <span className="truncate">LIVE टीवी</span>
              </Link>

              {quickCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#222827] p-2 text-white/90 hover:text-white hover:bg-[#2c3433] transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Complete 3-Tier Category Tree from Database */}
          <div className="border-t border-white/10 pt-4">
            <div className="text-[10px] font-bold tracking-wider uppercase text-white/60 mb-3 font-mono">
              सभी श्रेणियां व उप-श्रेणियां (All Categories & Desks)
            </div>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-white/50 animate-pulse">
                श्रेणियां लोड हो रही हैं...
              </div>
            ) : categories.length > 0 ? (
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const children = cat.children || [];
                  const hasChildren = children.length > 0;
                  const isExpanded = expandedCatId === cat.id;

                  return (
                    <div key={cat.id} className="rounded-lg bg-[#222827] overflow-hidden">
                      <div className="flex items-center justify-between p-2">
                        <Link
                          href={`/${cat.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-xs font-semibold text-white/95 hover:text-rose-400 transition-colors flex-1"
                        >
                          {cat.name}
                        </Link>

                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                            className="p-1 text-white/60 hover:text-white"
                            aria-label={`Toggle ${cat.name}`}
                          >
                            <IconChevronRight
                              className={`h-3.5 w-3.5 transition-transform duration-150 ${
                                isExpanded ? "rotate-90 text-rose-400" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Sub-menu (Level 2) and Child-menu (Level 3) pills */}
                      {hasChildren && isExpanded && (
                        <div className="flex flex-wrap gap-1.5 p-2 pt-1 bg-[#181d1c] border-t border-white/10">
                          {children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/${cat.slug}?sub=${sub.slug}`}
                              onClick={() => setOpen(false)}
                              className="text-[11px] rounded-md bg-[#252f2d] px-2.5 py-1 text-white/80 hover:text-white hover:bg-[#07473e] transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-white/50 py-2">
                श्रेणियां उपलब्ध नहीं हैं।
              </div>
            )}
          </div>

          {/* MORE LINKS Section */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="text-[10px] font-bold tracking-wider uppercase text-white/60 mb-2 font-mono">
              MORE LINKS
            </div>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="block text-xs text-white/80 hover:text-white transition-colors"
            >
              हमारे बारे में (About Us)
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block text-xs text-white/80 hover:text-white transition-colors"
            >
              संपर्क करें (Contact Us)
            </Link>
            <Link
              href="/privacy"
              onClick={() => setOpen(false)}
              className="block text-xs text-white/80 hover:text-white transition-colors"
            >
              गोपनीयता नीति (Privacy Policy)
            </Link>
          </div>
        </div>

        {/* Drawer Bottom Controls */}
        <div className="border-t border-[#0d3834] p-3 bg-[#0d1615] shrink-0 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-[#1a2322] px-3 py-1.5 rounded-md"
          >
            {resolvedTheme === "dark" ? (
              <>
                <IconSun className="h-3.5 w-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <IconMoon className="h-3.5 w-3.5 text-sky-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {isAuthenticated && isStaff ? (
            <Link
              href="/panel/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              <IconPencil className="h-3.5 w-3.5" />
              <span>Studio</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold bg-[#1a2322] hover:bg-[#253230] text-white px-3 py-1.5 rounded-md transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
