"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { IconMoon, IconSun, IconBell, IconExternalLink, IconPencilPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardBreadcrumbs } from "@/components/layout/breadcrumbs";

export function DashboardHeader() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-3 sm:px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-2 overflow-hidden">
        <SidebarTrigger className="-ml-1 h-9 w-9" />
        <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />

        <div className="hidden sm:flex items-center">
          <DashboardBreadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick New Article button on mobile */}
        <Button
          size="sm"
          className="h-8 text-xs font-medium md:hidden"
          render={<Link href="/studio/new" />}
        >
          <IconPencilPlus className="h-3.5 w-3.5 mr-1" />
          Write
        </Button>

        {/* View live public reader site */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          render={<Link href="/" target="_blank" rel="noreferrer" />}
        >
          <span>View Site</span>
          <IconExternalLink className="h-3.5 w-3.5 opacity-70" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          aria-label="Toggle theme"
        >
          <IconSun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <IconMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}

