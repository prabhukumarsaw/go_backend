"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import {
  IconSearch,
  IconMoon,
  IconSun,
  IconMenu2,
  IconPencil,
  IconMapPin,
  IconCalendar,
  IconCommand,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { publicNavigation } from "@/config/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useTenant } from "@/components/providers/tenant-provider";
import { listCategories } from "@/lib/api/articles";
import { useState, useEffect } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, isStaff } = useAuth();
  const { siteName, logoUrl, tenants, activeTenant, setActiveTenant } = useTenant();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Fetch dynamic categories from Go backend
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const categories = categoriesData?.data || [];

  // Build primary nav items dynamically from Level 1 root categories
  const primaryCategories = categories.filter((c) => !c.level || c.level === 1);

  const navItems = [
    { title: "Home", href: "/" },
    ...(primaryCategories.length > 0
      ? primaryCategories.map((cat) => ({
          title: cat.name,
          href: `/${cat.slug}`,
        }))
      : publicNavigation.filter((item) => item.href !== "/")),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-xs">
      {/* ─── Micro Top Utility Bar (Date + Edition Indicator) ─── */}
      <div className="border-b border-border/40 bg-muted/30 text-[11px] text-muted-foreground hidden sm:block">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 font-mono">
          <div className="flex items-center gap-2">
            <IconCalendar className="h-3 w-3 text-primary/70" />
            <span>{currentDateStr || "National Editorial Wire"}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Edition Indicator */}
            <div className="flex items-center gap-1.5">
              <IconMapPin className="h-3 w-3 text-rose-500" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                Edition:
              </span>
              <span className="font-semibold text-foreground">
                All India (National Desk)
              </span>
            </div>

            <span className="text-border">|</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live News Wire
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main Branding Bar ─── */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <IconMenu2 className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-14 items-center border-b px-4">
              <Link
                href="/"
                className="text-lg font-bold tracking-tight font-serif"
                onClick={() => setMobileOpen(false)}
              >
                {siteName}
              </Link>
            </div>
            <nav className="grid gap-1 p-4">
              {navItems.map((item, idx) => (
                <Link
                  key={`${item.href}-${idx}`}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname === item.href
                      ? "bg-accent font-semibold text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Dynamic Logo & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-2xl font-black tracking-tight font-serif hover:opacity-90 transition-opacity"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold shadow-xs">
                N
              </span>
            )}
            <span>{siteName}</span>
          </Link>

          {activeTenant && (
            <Badge variant="outline" className="hidden xl:inline-flex text-[10px] font-mono uppercase bg-muted/40">
              {activeTenant.name}
            </Badge>
          )}
        </div>

        {/* Actions Strip */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
            render={<Link href="/search" />}
          >
            <IconSearch className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Search stories...</span>
            <kbd className="pointer-events-none hidden h-4 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium opacity-100 md:flex">
              <IconCommand className="h-2.5 w-2.5" />K
            </kbd>
          </Button>

          <Button variant="ghost" size="icon" className="sm:hidden" render={<Link href="/search" />}>
            <IconSearch className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <IconSun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <IconMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated && isStaff ? (
            <Button variant="default" size="sm" className="ml-2 font-semibold text-xs" render={<Link href="/panel/dashboard" />}>
              <IconPencil className="mr-1.5 h-3.5 w-3.5" />
              Studio
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="ml-2 text-xs font-semibold" render={<Link href="/login" />}>
              Sign in
            </Button>
          )}
        </div>
      </div>

      {/* ─── Navigation bar — desktop ─── */}
      <nav className="mx-auto hidden max-w-7xl border-t border-border/40 md:block overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 px-4 sm:px-6 lg:px-8">
          {navItems.map((item, idx) => (
            <Link
              key={`${item.href}-${idx}`}
              href={item.href}
              className={`relative py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors whitespace-nowrap ${
                pathname === item.href
                  ? "text-primary border-b-2 border-primary -mb-px font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

