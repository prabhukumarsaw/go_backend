"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { IconArrowLeft, IconMoon, IconSun } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { RouteGuard } from "@/components/auth/route-guard";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <RouteGuard requireStaff={true}>
      <div className="flex min-h-svh flex-col">
        {/* Minimal studio header */}
        <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" render={<Link href="/panel/articles" />}>
              <IconArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to articles</span>
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              {siteConfig.name} Studio
            </span>
          </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <IconSun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <IconMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      {/* Studio content */}
      <main className="flex-1">{children}</main>
    </div>
  </RouteGuard>
  );
}
