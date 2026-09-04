"use client";

import { useState, useEffect, useCallback } from "react";
import type { ArticleListItem } from "@/types/content";

interface AffinityScores {
  [category: string]: number;
}

const STORAGE_KEY_AFFINITY = "newsroom_category_affinity";
const STORAGE_KEY_HISTORY = "newsroom_read_history";
const STORAGE_KEY_EDITION = "newsroom_user_edition";

export function useFeedPersonalization() {
  const [affinity, setAffinity] = useState<AffinityScores>({});
  const [readHistory, setReadHistory] = useState<string[]>([]);
  const [userEdition, setUserEdition] = useState<string>("national");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedAffinity = localStorage.getItem(STORAGE_KEY_AFFINITY);
      if (storedAffinity) setAffinity(JSON.parse(storedAffinity));

      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (storedHistory) setReadHistory(JSON.parse(storedHistory));

      const storedEdition = localStorage.getItem(STORAGE_KEY_EDITION);
      if (storedEdition) {
        setUserEdition(storedEdition);
      } else {
        // Auto-detect based on client timezone/locale
        const detected = autoDetectDefaultEdition();
        setUserEdition(detected);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  // Track an article read — increments weight for that article's categories
  const trackArticleRead = useCallback(
    (articleId: string, categories: string[] = []) => {
      try {
        setAffinity((prev) => {
          const updated = { ...prev };
          categories.forEach((cat) => {
            const key = cat.toLowerCase();
            updated[key] = (updated[key] || 0) + 1;
          });
          localStorage.setItem(STORAGE_KEY_AFFINITY, JSON.stringify(updated));
          return updated;
        });

        setReadHistory((prev) => {
          const updated = [articleId, ...prev.filter((id) => id !== articleId)].slice(0, 100);
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
          return updated;
        });
      } catch {
        // Ignore
      }
    },
    []
  );

  // Set selected state edition explicitly
  const setPreferredEdition = useCallback((editionSlug: string) => {
    setUserEdition(editionSlug);
    try {
      localStorage.setItem(STORAGE_KEY_EDITION, editionSlug);
    } catch {
      // Ignore
    }
  }, []);

  // YouTube-style ranking algorithm for "For You" algorithmic feed
  const rankPersonalizedArticles = useCallback(
    (articles: ArticleListItem[]): ArticleListItem[] => {
      if (!articles || articles.length === 0) return [];

      const scored = articles.map((article) => {
        let score = 0;

        // 1. Freshness boost
        const pubDate = article.published_at ? new Date(article.published_at).getTime() : 0;
        const hoursAgo = Math.max(0, (Date.now() - pubDate) / (1000 * 60 * 60));
        score += Math.max(0, 50 - hoursAgo * 2);

        // 2. Breaking & Featured signals
        if (article.is_breaking) score += 40;
        if (article.is_featured) score += 25;

        // 3. User Category Affinity match
        const cats: string[] = article.category_names || article.categories || [];
        cats.forEach((c: string) => {
          const count = affinity[c.toLowerCase()] || 0;
          score += Math.min(count * 8, 40); // Cap affinity boost to maintain diversity
        });

        // 4. View count popularity signal
        score += Math.min((article.view_count || 0) / 50, 20);

        // 5. Demote already-read articles to avoid repetitive fatigue
        if (readHistory.includes(article.id)) {
          score -= 30;
        }

        return { article, score };
      });

      scored.sort((a, b) => b.score - a.score);
      return scored.map((s) => s.article);
    },
    [affinity, readHistory]
  );

  return {
    isClient,
    affinity,
    readHistory,
    userEdition,
    setPreferredEdition,
    trackArticleRead,
    rankPersonalizedArticles,
  };
}

function autoDetectDefaultEdition(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Map timezones to states if applicable, default to national
    if (tz === "Asia/Kolkata") return "national";
    return "national";
  } catch {
    return "national";
  }
}
