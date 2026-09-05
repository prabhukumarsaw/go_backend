"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconKeyboard,
  IconX,
  IconHistory,
  IconTrash,
  IconFlame,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { listTrendingTags } from "@/lib/api/articles";

interface NavbarSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RECENT_SEARCHES_KEY = "naxatra_recent_searches";

// Curated popular news topics matching broadcast standard (from reference image)
const defaultRecommendations = [
  "नेपाल",
  "राशिफल",
  "नरेंद्र मोदी",
  "उत्तर प्रदेश",
  "बॉलीवुड",
  "वायरल वीडियो",
  "पाकिस्तान",
  "पंचायत नक्षत्र न्यूज़",
  "उत्तर प्रदेश विधानसभा चुनाव 2027",
  "योगी आदित्यनाथ",
  "पंचायत विशेष",
  "बिहार राजनीति",
  "क्रिकेट",
  "मौसम अपडेट",
];

export function NavbarSearchDialog({ open, onOpenChange }: NavbarSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  const loadRecentSearches = useCallback(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 6));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save term to recent searches
  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage write errors
    }
  };

  const removeSingleRecent = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== termToRemove);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllRecent = () => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Dynamic trending tags from backend API
  const { data: tagsData } = useQuery({
    queryKey: ["search-dialog-tags"],
    queryFn: () => listTrendingTags(10),
    staleTime: 5 * 60 * 1000,
  });

  const dynamicTags = tagsData?.data?.map((t) => t.name) || [];

  // Merge dynamic tags with curated recommendations (deduplicated)
  const recommendations = Array.from(
    new Set([...dynamicTags, ...defaultRecommendations])
  ).slice(0, 14);

  // Focus input & load searches when opened
  useEffect(() => {
    if (open) {
      loadRecentSearches();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [open, loadRecentSearches]);

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K and ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    saveRecentSearch(cleanQuery);
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
  };

  const handleSelectTerm = (term: string) => {
    saveRecentSearch(term);
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // Real-time matching suggestions when typing
  const isTyping = query.trim().length > 0;
  const filteredRecommendations = isTyping
    ? recommendations.filter((r) =>
        r.toLowerCase().includes(query.trim().toLowerCase())
      )
    : recommendations;

  if (!open) return null;

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Slide-down Search Bar & Recommendation Pills Panel (AajTak Broadcast Style) */}
      <div
        className="fixed top-0 left-0 right-0 z-[100] bg-white text-gray-900 border-b border-gray-200 shadow-2xl py-6 px-4 sm:px-8 transition-all animate-in fade-in-0 slide-in-from-top-4 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="खोजें (Search)"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header Row: Search Input + SEARCH Button + Close Button */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 sm:gap-3 w-full">
            {/* Input Box with Left Search Icon & Right Keyboard Icon */}
            <div className="relative flex-1 flex items-center bg-[#f8f9fa] border border-gray-200 rounded-md px-3.5 py-2 sm:py-2.5 focus-within:border-gray-400 focus-within:bg-white transition-colors shadow-2xs">
              <IconSearch className="h-5 w-5 text-gray-400 mr-2.5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="यहाँ खोजें..."
                className="w-full bg-transparent text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-hidden font-hindi"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                title="ऑन-स्क्रीन कीबोर्ड / फ़ोकस"
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2 shrink-0 focus:outline-hidden"
              >
                <IconKeyboard className="h-5 w-5" />
              </button>
            </div>

            {/* Red SEARCH Button */}
            <button
              type="submit"
              className="bg-[#cc0000] hover:bg-[#b30000] active:scale-[0.98] text-white font-black text-xs sm:text-sm tracking-wider uppercase px-5 sm:px-8 py-2.5 sm:py-3 rounded-md shadow-xs transition-all shrink-0 cursor-pointer"
            >
              SEARCH
            </button>

            {/* Close Button (✕) */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0 focus:outline-hidden"
              aria-label="बंद करें (Close)"
            >
              <IconX className="h-5 w-5" />
            </button>
          </form>

          {/* While typing: Live Search Action & Filtered Suggestions */}
          {isTyping ? (
            <div className="pt-1 space-y-3">
              {/* Quick Search Action */}
              <div
                onClick={handleSearch}
                className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100/80 border border-red-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-red-900 font-medium font-hindi">
                  <IconSearch className="h-4 w-4 text-red-600 shrink-0" />
                  <span>
                    <strong>&ldquo;{query.trim()}&rdquo;</strong> के लिए सभी समाचार खोजें
                  </span>
                </div>
                <span className="text-[11px] font-mono bg-red-200/60 text-red-800 px-2 py-0.5 rounded font-bold">
                  Enter ↵
                </span>
              </div>

              {/* Filtered Topic Matches */}
              {filteredRecommendations.length > 0 ? (
                <div>
                  <div className="text-xs font-bold text-gray-500 font-hindi mb-2">
                    मिलते-जुलते विषय ({filteredRecommendations.length})
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {filteredRecommendations.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleSelectTerm(topic)}
                        className="rounded-full border border-red-200 bg-red-50/50 hover:bg-red-600 hover:text-white text-gray-800 text-xs sm:text-[13px] font-semibold font-hindi px-3.5 sm:px-4 py-1.5 transition-all shadow-2xs cursor-pointer"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 font-hindi py-1">
                  कोई विशिष्ट टैग नहीं मिला — सीधे <strong>Enter</strong> दबाकर या लाल <strong>SEARCH</strong> बटन दबाकर खोजें।
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recent Searches Section (if any saved) */}
              {recentSearches.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 font-hindi">
                      <IconHistory className="h-3.5 w-3.5 text-gray-400" />
                      <span>हाल की खोजें (Recent Searches)</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[11px] text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 focus:outline-hidden cursor-pointer"
                      title="सभी हाल की खोजें हटाएं"
                    >
                      <IconTrash className="h-3 w-3" />
                      <span>हटाएं</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleSelectTerm(term)}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 px-3 py-1 text-xs text-gray-800 font-medium font-hindi cursor-pointer transition-all shadow-2xs"
                      >
                        <IconHistory className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeSingleRecent(e, term)}
                          className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors focus:outline-hidden"
                          title="हटाएं"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation / Trending Topics Pills Section (AajTak Style) */}
              <div className="pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 font-hindi mb-2">
                  <IconFlame className="h-3.5 w-3.5 text-red-500" />
                  <span>ट्रेंडिंग विषय व सिफारिशें</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {recommendations.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleSelectTerm(topic)}
                      className="rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 text-gray-800 text-xs sm:text-[13px] font-medium font-hindi px-3.5 sm:px-4 py-1.5 transition-all shadow-2xs hover:shadow-xs focus:outline-hidden cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
