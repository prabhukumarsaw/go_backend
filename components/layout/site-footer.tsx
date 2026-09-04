"use client";

import Link from "next/link";
import {
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandYoutube,
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { useTenant } from "@/components/providers/tenant-provider";
import { useQuery } from "@tanstack/react-query";
import { listCategories } from "@/lib/api/articles";
import { publicNavigation } from "@/config/navigation";

export function SiteFooter() {
  const { siteName, siteMotive, tagline, socialLinks, logoUrl } = useTenant();

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const categories = catData?.data || [];
  const sections =
    categories.length > 0
      ? categories.slice(0, 8).map((c) => ({
          title: c.name,
          href: `/${c.slug}`,
        }))
      : publicNavigation.slice(0, 6);

  return (
    <footer className="border-t bg-card/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand & Socials */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteName} className="h-7 w-auto object-contain" />
              ) : null}
              <span>{siteName}</span>
            </Link>

            <p className="max-w-md text-xs text-muted-foreground leading-relaxed">
              {tagline || siteMotive || "Independent, Verified & Fearless Journalism across Indian States."}
            </p>

            {/* Live Social Channels */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {socialLinks.x && (
                <a
                  href={socialLinks.x}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="X (Twitter)"
                >
                  <IconBrandX className="h-4 w-4" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10 transition-colors"
                  title="Instagram"
                >
                  <IconBrandInstagram className="h-4 w-4" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                  title="Facebook"
                >
                  <IconBrandFacebook className="h-4 w-4" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="YouTube"
                >
                  <IconBrandYoutube className="h-4 w-4" />
                </a>
              )}
              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  title="WhatsApp Channel"
                >
                  <IconBrandWhatsapp className="h-4 w-4" />
                </a>
              )}
              {socialLinks.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
                  title="Telegram"
                >
                  <IconBrandTelegram className="h-4 w-4" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground hover:text-blue-600 hover:bg-blue-600/10 transition-colors"
                  title="LinkedIn"
                >
                  <IconBrandLinkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Sections */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-foreground mb-3">
              Editorial Sections
            </h3>
            <ul className="grid gap-2">
              {sections.map((item, idx) => (
                <li key={`${item.href}-${idx}`}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Governance */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-foreground mb-3">
              Governance & Policies
            </h3>
            <ul className="grid gap-2 text-xs">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  Editorial Charter & Standards
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Grievance Redressal (IT Rules 2021)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service & Syndicate
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved. Registered Digital News Publisher.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Edition: National</span>
            <span>•</span>
            <span>DPDP Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
