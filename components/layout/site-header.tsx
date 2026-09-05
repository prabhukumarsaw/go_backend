"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listCategoriesTree } from "@/lib/api/articles";
import {
  IconSearch,
  IconCloud,
} from "@tabler/icons-react";
import { useTenant } from "@/components/providers/tenant-provider";
import {
  NavbarCategoryDropdown,
  NavbarNationalMegaMenu,
  NavbarCityMegaMenu,
  NavbarMoreMenu,
  NavbarNetworkMenu,
  NavbarMobileDrawer,
  NavbarTrendingBar,
  NavbarSearchDialog,
} from "./navbar";
import type { Category } from "@/types/content";

const liveTvDropdownItems = [
  { title: "लाइव टीवी स्ट्रीम (Live)", href: "/live", badge: "LIVE" },
  { title: "प्राइम टाइम शो (Prime Time)", href: "/live?show=primetime" },
  { title: "न्यूज़ बुलेटिन (Bulletins)", href: "/live?show=bulletin" },
  { title: "खास इंटरव्यू (Interviews)", href: "/live?show=interview" },
];

const breakingDropdownItems = [
  { title: "ताज़ा बड़ी खबरें (Breaking)", href: "/", badge: "NEW" },
  { title: "टॉप 10 सुर्खियां (Top 10)", href: "/brief" },
  { title: "वायरल व ट्रेंडिंग (Viral)", href: "/viral" },
  { title: "देशभर की हलचल (National)", href: "/national" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { siteName, logoUrl } = useTenant();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [liveDateStr, setLiveDateStr] = useState("September 04, 2026 08:20 pm IST");

  // Dynamic categories tree from Go backend
  const { data: treeData } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: () => listCategoriesTree(),
    staleTime: 5 * 60 * 1000,
  });

  const allCategories: Category[] = treeData?.data || [];

  // Match backend categories to navigation desks
  const sportsCategory = allCategories.find((c) => c.slug === "sports");
  const businessCategory = allCategories.find((c) => c.slug === "business");
  const techCategory = allCategories.find((c) => c.slug === "technology");

  // Overflow categories that flow into the ☰ ⌵ More Menu
  const overflowCategories = allCategories.filter(
    (c) => !["national", "states", "jharkhand", "bihar", "sports", "entertainment", "business", "technology", "lifestyle"].includes(c.slug)
  );

  useEffect(() => {
    setMounted(true);
    const updateDateTime = () => {
      const now = new Date();
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const month = monthNames[now.getMonth()];
      const day = String(now.getDate()).padStart(2, "0");
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, "0");

      setLiveDateStr(`${month} ${day}, ${year} ${formattedHours}:${minutes} ${ampm} IST`);
    };

    updateDateTime();
    const clockInterval = setInterval(updateDateTime, 30000);

    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  // Underline helper for canonical navigation
  const getNavLinkClass = (isActive: boolean) =>
    `relative flex items-center py-2 px-2 xl:px-2.5 text-[13.5px] xl:text-[14px] font-semibold font-hindi whitespace-nowrap transition-all after:content-[''] after:absolute after:bottom-0 after:left-1.5 after:right-1.5 after:h-[2.5px] after:bg-red-500 after:transition-all focus:outline-hidden ${isActive
      ? "text-white font-bold after:opacity-100 after:scale-x-100"
      : "text-white/90 hover:text-white after:opacity-0 hover:after:opacity-100"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#072e2a] border-b border-[#0e443e] shadow-lg select-none overflow-visible">
        {/* ─── Main Full-Width Square Broadcast Navbar ─── */}
        <div className="w-full overflow-visible">
          <div className="relative mx-auto flex h-14 sm:h-[58px] max-w-[1536px] items-center justify-between px-3 sm:px-5 lg:px-6 text-white overflow-visible">

            {/* ─── LEFT: Menu + Absolute Oversized Logo (AajTak style) ─── */}
            <div className="flex items-center shrink-0">
              {/* Hamburger */}
              <NavbarMobileDrawer />

              {/* ─── Responsive Logo:
                  Mobile: cleanly contained inside navbar (h-10 w-10 / 40px)
                  Desktop (sm+): oversized absolute (h-[90px] w-[90px]) overflowing into the trending bar ─── */}
              <div className="relative ml-2 sm:ml-1.5 shrink-0 sm:self-stretch flex items-center">
                {/* Spacer on sm+: holds 90px room in flex row */}
                <div className="hidden sm:block sm:w-[90px] h-full" aria-hidden="true" />

                {/* Mobile: inline relative link. Desktop: absolute top-0 z-20. */}
                <Link
                  href="/"
                  className="sm:absolute sm:top-0 sm:left-0 z-20 group focus:outline-hidden flex items-center"
                  aria-label={`${siteName || "Naxatra News"} - Home`}
                >
                  <div className="relative h-10 w-10 sm:h-[90px] sm:w-[90px] drop-shadow-xl group-hover:scale-[1.03] transition-transform duration-200">
                    <Image
                      src={logoUrl || "/assets/logo.png"}
                      alt={siteName || "Naxatra"}
                      fill
                      sizes="(max-width: 640px) 40px, 90px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
              </div>
            </div>

            {/* ─── CENTER: Canonical Nav Desks with Dynamic Subcategories ─── */}
            <nav
              className="hidden xl:flex items-center gap-1 lg:gap-1.5 px-2 overflow-visible"
              aria-label="Primary Navigation"
            >
              {/* 1. 🔴 LIVE टीवी ⌵ */}
              <NavbarCategoryDropdown
                label="LIVE टीवी"
                href="/live"
                items={liveTvDropdownItems}
                isActive={pathname === "/live"}
                isLive
              />

              {/* 2. ताज़ातरीन ⌵ */}
              <NavbarCategoryDropdown
                label="ताज़ातरीन"
                href="/"
                items={breakingDropdownItems}
                isActive={pathname === "/"}
              />

              {/* 3. देश ⌵ (Dynamic National Mega Menu) */}
              <NavbarNationalMegaMenu isActive={pathname === "/national"} />

              {/* 4. झारखंड ⌵ (Dynamic Jharkhand & District Sub-Desks Mega Menu) */}
              <NavbarCityMegaMenu
                label="झारखंड"
                parentSlug="jharkhand"
                isActive={pathname === "/jharkhand" || pathname.startsWith("/jharkhand")}
              />

              {/* 5. बिहार ⌵ (Dynamic Bihar & 33 District Sub-Desks Mega Menu) */}
              <NavbarCityMegaMenu
                label="बिहार"
                parentSlug="bihar"
                isActive={pathname === "/bihar" || pathname.startsWith("/bihar")}
              />

              {/* 6. क्रिकेट / खेल ⌵ (Dynamic Sports Subcategories) */}
              {sportsCategory?.children && sportsCategory.children.length > 0 ? (
                <NavbarCategoryDropdown
                  label="क्रिकेट"
                  href="/sports"
                  items={sportsCategory.children.map((sub) => ({
                    title: sub.name,
                    href: `/sports?sub=${sub.slug}`,
                  }))}
                  isActive={pathname.startsWith("/sports")}
                />
              ) : (
                <Link href="/sports" className={getNavLinkClass(pathname === "/sports")}>
                  क्रिकेट
                </Link>
              )}

              {/* 7. फटाफट */}
              <Link href="/brief" className={getNavLinkClass(pathname === "/brief")}>
                फटाफट
              </Link>

              {/* 8. मनोरंजन */}
              <Link
                href="/entertainment"
                className={getNavLinkClass(pathname === "/entertainment")}
              >
                मनोरंजन
              </Link>

              {/* 9. बिजनेस ⌵ (Dynamic Business Subcategories) */}
              {businessCategory?.children && businessCategory.children.length > 0 ? (
                <NavbarCategoryDropdown
                  label="बिजनेस"
                  href="/business"
                  items={businessCategory.children.map((sub) => ({
                    title: sub.name,
                    href: `/business?sub=${sub.slug}`,
                  }))}
                  isActive={pathname.startsWith("/business")}
                />
              ) : (
                <Link href="/business" className={getNavLinkClass(pathname === "/business")}>
                  बिजनेस
                </Link>
              )}

              {/* 10. टेक ⌵ (Dynamic Tech Subcategories) */}
              {techCategory?.children && techCategory.children.length > 0 ? (
                <NavbarCategoryDropdown
                  label="टेक"
                  href="/technology"
                  items={techCategory.children.map((sub) => ({
                    title: sub.name,
                    href: `/technology?sub=${sub.slug}`,
                  }))}
                  isActive={pathname.startsWith("/technology")}
                />
              ) : (
                <Link href="/technology" className={getNavLinkClass(pathname === "/technology")}>
                  टेक
                </Link>
              )}

              {/* 11. लाइफस्टाइल */}
              <Link
                href="/lifestyle"
                className={getNavLinkClass(pathname === "/lifestyle")}
              >
                लाइफस्टाइल
              </Link>

              {/* 12. ☰ ⌵ (More Menu with dynamic backend overflow categories) */}
              <NavbarMoreMenu categories={overflowCategories} />
            </nav>

            {/* ─── RIGHT: Search + Date/Time + Weather + 9-Dots App Grid Menu ─── */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Search Icon Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden"
                aria-label="Search stories"
                title="खोजें (Ctrl+K)"
              >
                <IconSearch className="h-[18px] w-[18px]" />
              </button>

              <span className="hidden md:inline text-white/20 text-xs">|</span>

              {/* Date/Time + Weather/AQI */}
              <div className="hidden md:flex flex-col items-end leading-tight text-[10.5px] text-white/80 font-sans">
                <span suppressHydrationWarning className="font-medium text-white/90">
                  {mounted ? liveDateStr : "September 05, 2026 IST"}
                </span>
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <span>दिल्ली</span>
                  <IconCloud className="h-3 w-3 text-emerald-300" />
                  <span>27° C</span>
                  <span className="text-white/30">|</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded text-[9.5px] font-bold">
                    AQI 71
                  </span>
                </div>
              </div>

              {/* 9-Dots "Our Network" & Apps Popover */}
              <NavbarNetworkMenu />
            </div>
          </div>
        </div>

        {/* ─── Global Search Modal ─── */}
        <NavbarSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </header>

      {/* ─── Special Links / Trending Ticker ─── sits BELOW sticky navbar, scrolls with page ─── */}
      <NavbarTrendingBar />
    </>
  );
}
