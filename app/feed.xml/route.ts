import { siteConfig } from "@/config/site";
import { listArticles } from "@/lib/api/articles";

export async function GET() {
  const baseUrl = siteConfig.url;

  let articles: any[] = [];
  try {
    const res = await listArticles({ per_page: 50 });
    articles = res?.data || [];
  } catch {
    // Backend offline fallback
  }

  const items = articles
    .map((article: any) => {
      const pubDate = article.published_at
        ? new Date(article.published_at).toUTCString()
        : new Date(article.created_at).toUTCString();

      const category = article.categories?.[0] || "News";

      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/news/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/news/${article.slug}</guid>
      <description><![CDATA[${article.excerpt || article.title}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${category}</category>
      <dc:creator>${article.author_name || "NewsRoom Staff"}</dc:creator>${
        article.featured_image
          ? `
      <media:content url="${article.featured_image}" medium="image" />`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NewsRoom — Breaking News &amp; Live Coverage</title>
    <link>${baseUrl}</link>
    <description>India's next-generation verified news platform with hyperlocal state editions.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>NewsRoom</title>
      <link>${baseUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
