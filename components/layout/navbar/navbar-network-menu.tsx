"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  IconLayoutGrid,
  IconBrandFacebook,
  IconBrandX,
  IconBrandYoutube,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandGooglePlay,
  IconBrandApple,
  IconSun,
  IconMoon,
  IconPencil,
} from "@tabler/icons-react";
import { useTenant } from "@/components/providers/tenant-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "next-themes";

const networkLinks = [
  // Row 1
  { title: "NAXATRA", dot: "bg-slate-400", href: "/" },
  { title: "हिन्दी", dot: "bg-slate-400", href: "/" },
  { title: "World", dot: "bg-blue-400", href: "/world" },
  { title: "Profit", dot: "bg-blue-400", href: "/business" },
  // Row 2
  { title: "Sports", dot: "bg-blue-500", href: "/sports" },
  { title: "Movies", dot: "bg-pink-500", href: "/entertainment" },
  { title: "Food", dot: "bg-emerald-500", href: "/lifestyle?topic=food" },
  { title: "Education", dot: "bg-cyan-400", href: "/education" },
  // Row 3
  { title: "Lifestyle", dot: "bg-amber-400", href: "/lifestyle" },
  { title: "Health", dot: "bg-blue-400", href: "/lifestyle?topic=health" },
  { title: "Tech", dot: "bg-red-500", href: "/technology" },
  { title: "Games", dot: "bg-purple-500", href: "/games" },
  // Row 4
  { title: "Shopping", dot: "bg-red-500", href: "/shopping" },
  { title: "Rajasthan", dot: "bg-cyan-400", href: "/states?region=rajasthan" },
  { title: "MPCG", dot: "bg-red-500", href: "/states?region=mp-chhattisgarh" },
  { title: "Marathi", dot: "bg-amber-400", href: "/states?region=maharashtra" },
];

export function NavbarNetworkMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { socialLinks } = useTenant();
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, isStaff } = useAuth();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* 9-Dots Grid Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex h-9 w-9 items-center justify-center rounded-md border transition-all focus:outline-hidden ${
          isOpen
            ? "bg-[#094b43] text-white border-emerald-400/50 ring-1 ring-emerald-400/40"
            : "bg-[#05221f]/90 hover:bg-[#0a423b] border-white/10 text-white/90 hover:text-white"
        }`}
        aria-label="Our Network and Apps"
        title="Our Network & Apps"
      >
        <IconLayoutGrid className="h-4 w-4" />
      </button>

      {/* Network Popover */}
      {isOpen && (
        <div
          className="fixed right-2 sm:right-6 top-14 sm:top-[58px] z-[70] w-[95vw] max-w-3xl rounded-b-xl border border-[#0d443f] bg-[#062320] text-white p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
          role="menu"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Our Network (4 Columns x 4 Rows) */}
            <div className="md:col-span-8 md:border-r md:border-[#0d443f]/70 md:pr-6">
              <h3 className="text-sm font-bold text-white mb-4 tracking-wide font-sans">
                Our Network
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {networkLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center rounded-lg border border-white/10 bg-[#082e2a] px-3 py-2 text-xs font-semibold text-white/90 hover:bg-[#0b3c37] hover:text-white transition-colors"
                  >
                    <span className={`h-2 w-2 rounded-full mr-2.5 shrink-0 ${item.dot}`} />
                    <span className="truncate">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Get App + Follow Us + Controls */}
            <div className="md:col-span-4 flex flex-col justify-between space-y-5">
              {/* App Download Links */}
              <div>
                <h3 className="text-xs font-bold text-white mb-2.5 tracking-wide">
                  Get App for Better Experience
                </h3>
                <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                  <a
                    href="https://play.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-[#082e2a] hover:bg-[#0b3c37] px-3.5 py-1.5 text-xs text-white transition-colors"
                  >
                    <IconBrandGooglePlay className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-[9px] text-white/60">Get it on</span>
                      <span className="font-bold text-[11px]">Google Play</span>
                    </div>
                  </a>

                  <a
                    href="https://apple.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-[#082e2a] hover:bg-[#0b3c37] px-3.5 py-1.5 text-xs text-white transition-colors"
                  >
                    <IconBrandApple className="h-4 w-4 text-white shrink-0" />
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-[9px] text-white/60">Download on the</span>
                      <span className="font-bold text-[11px]">App Store</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Follow Us On (Social Links) */}
              <div>
                <h3 className="text-xs font-bold text-white mb-2.5 tracking-wide">
                  Follow us on
                </h3>
                <div className="flex items-center gap-3 text-white/80">
                  <a
                    href={socialLinks?.facebook || "https://facebook.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <IconBrandFacebook className="h-5 w-5" />
                  </a>
                  <a
                    href={socialLinks?.x || "https://x.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <IconBrandX className="h-5 w-5" />
                  </a>
                  <a
                    href={socialLinks?.youtube || "https://youtube.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-rose-500 transition-colors"
                  >
                    <IconBrandYoutube className="h-5 w-5" />
                  </a>
                  <a
                    href={socialLinks?.instagram || "https://instagram.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-pink-400 transition-colors"
                  >
                    <IconBrandInstagram className="h-5 w-5" />
                  </a>
                  <a
                    href={socialLinks?.whatsapp || "https://whatsapp.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    <IconBrandWhatsapp className="h-5 w-5" />
                  </a>
                  <a
                    href={socialLinks?.linkedin || "https://linkedin.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-sky-400 transition-colors"
                  >
                    <IconBrandLinkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Bottom Quick Controls: Theme Toggle + Studio/Sign In */}
              <div className="pt-3 border-t border-[#0d443f] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-1.5 text-xs text-white/90 bg-[#082e2a] hover:bg-[#0b3c37] px-3 py-1.5 rounded-lg transition-colors"
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <IconSun className="h-3.5 w-3.5 text-amber-400" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <IconMoon className="h-3.5 w-3.5 text-sky-400" />
                      <span>Dark</span>
                    </>
                  )}
                </button>

                {isAuthenticated && isStaff ? (
                  <Link
                    href="/panel/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <IconPencil className="h-3.5 w-3.5" />
                    <span>Studio</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold bg-[#082e2a] hover:bg-[#0b3c37] text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
