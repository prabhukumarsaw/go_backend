import { PersonalizedHomeFeed } from "@/components/feed/personalized-home-feed";
import { WebsiteJsonLd } from "@/components/seo/website-jsonld";
import {
  listArticles,
  listBreakingNews,
  listFeaturedNews,
  listTrendingNews,
} from "@/lib/api/articles";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "NewsRoom — Breaking News, In-Depth Analysis & Hyperlocal Editions",
  description:
    "India's next-generation news platform delivering verified breaking news, investigative journalism, live election coverage, and state reporting across 37 regional desks.",
  openGraph: {
    title: "NewsRoom — Verified Breaking News & Regional Desks",
    description: "Verified breaking news and hyperlocal state coverage across India.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
};

export default async function HomePage() {
  let breakingArticles: any[] = [];
  let featuredArticles: any[] = [];
  let trendingArticles: any[] = [];
  let latestArticles: any[] = [];

  try {
    const [breakingRes, featuredRes, trendingRes, latestRes] = await Promise.allSettled([
      listBreakingNews(4),
      listFeaturedNews(4),
      listTrendingNews(6),
      listArticles({ per_page: 12 }),
    ]);

    if (breakingRes.status === "fulfilled" && breakingRes.value?.data) {
      breakingArticles = breakingRes.value.data;
    }
    if (featuredRes.status === "fulfilled" && featuredRes.value?.data) {
      featuredArticles = featuredRes.value.data;
    }
    if (trendingRes.status === "fulfilled" && trendingRes.value?.data) {
      trendingArticles = trendingRes.value.data;
    }
    if (latestRes.status === "fulfilled" && latestRes.value?.data) {
      latestArticles = latestRes.value.data;
      if (featuredArticles.length === 0 && latestArticles.length > 0) {
        featuredArticles = latestArticles.slice(0, 3);
        latestArticles = latestArticles.slice(3);
      }
    }
  } catch {
    // Graceful fallback for offline / bootstrapping
  }

  return (
    <>
      <WebsiteJsonLd />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PersonalizedHomeFeed
          initialBreaking={breakingArticles}
          initialFeatured={featuredArticles}
          initialTrending={trendingArticles}
          initialLatest={latestArticles}
        />
      </main>
    </>
  );
}
