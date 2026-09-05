"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";

export interface DropdownItem {
  title: string;
  href: string;
  badge?: string;
}

interface NavbarCategoryDropdownProps {
  label: string;
  href?: string;
  items: DropdownItem[];
  isActive?: boolean;
  align?: "left" | "right";
  isLive?: boolean;
}

export function NavbarCategoryDropdown({
  label,
  href,
  items,
  isActive = false,
  align = "left",
  isLive = false,
}: NavbarCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      ref={dropdownRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {href ? (
        <Link
          href={href}
          onClick={() => setIsOpen(false)}
          className={`relative flex items-center gap-1 py-1.5 px-2 text-[13px] xl:text-[14px] font-semibold font-hindi whitespace-nowrap transition-all after:content-[''] after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2px] after:bg-red-500 after:transition-opacity focus:outline-hidden ${
            isActive || isOpen
              ? "text-white font-bold after:opacity-100"
              : "text-white/90 hover:text-white after:opacity-0 hover:after:opacity-100"
          }`}
        >
          {isLive && (
            <span className="relative flex h-2 w-2 mr-1 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
          )}
          <span>{label}</span>
          <IconChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : "text-white/70"
            }`}
          />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`relative flex items-center gap-1 py-1.5 px-2 text-[13px] xl:text-[14px] font-semibold font-hindi whitespace-nowrap transition-all after:content-[''] after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2px] after:bg-red-500 after:transition-opacity focus:outline-hidden ${
            isActive || isOpen
              ? "text-white font-bold after:opacity-100"
              : "text-white/90 hover:text-white after:opacity-0 hover:after:opacity-100"
          }`}
        >
          {isLive && (
            <span className="relative flex h-2 w-2 mr-1 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
          )}
          <span>{label}</span>
          <IconChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : "text-white/70"
            }`}
          />
        </button>
      )}

      {/* Dropdown Menu with hover bridge */}
      {isOpen && (
        <div
          className={`absolute top-full z-[70] mt-1 w-52 rounded-xl border border-[#0d443f] bg-[#062320] py-2 shadow-2xl animate-in fade-in-0 slide-in-from-top-1 duration-150 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="menu"
        >
          <div className="max-h-80 overflow-y-auto divide-y divide-[#0d443f]/30">
            {items.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-xs font-medium text-white/90 hover:bg-[#0b3834] hover:text-white transition-colors"
              >
                <span>{item.title}</span>
                {item.badge && (
                  <span className="rounded bg-rose-600/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
