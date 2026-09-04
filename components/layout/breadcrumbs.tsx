"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment, useMemo } from "react";

function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname();

  const segments = useMemo(() => {
    const parts = pathname
      .split("/")
      .filter(Boolean)
      // Filter out route group markers
      .filter((p) => !p.startsWith("(") && !p.endsWith(")"));

    return parts.map((part, index) => ({
      label: formatSegment(part),
      href: "/" + parts.slice(0, index + 1).join("/"),
      isLast: index === parts.length - 1,
    }));
  }, [pathname]);

  if (segments.length <= 1) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => (
          <Fragment key={segment.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {segment.isLast ? (
                <BreadcrumbPage>{segment.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={segment.href} />}>
                  {segment.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
