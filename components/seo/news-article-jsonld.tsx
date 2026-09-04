import type { Article } from "@/types/content";
import { siteConfig } from "@/config/site";

interface NewsArticleJsonLdProps {
  article: Article;
}

export function NewsArticleJsonLd({ article }: NewsArticleJsonLdProps) {
  const category = article.categories?.[0] || "News";
  const wordCount = article.body
    ? typeof article.body === "string"
      ? article.body.split(/\s+/).length
      : 500
    : 300;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || article.title,
    image: article.featured_image ? [article.featured_image] : [`${siteConfig.url}/og-default.jpg`],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.created_at,
    articleSection: category,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    wordCount: wordCount,
    author: [
      {
        "@type": "Person",
        name: article.author_name || "Newsroom Editorial Bureau",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/news/${article.slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category,
        item: `${siteConfig.url}/${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${siteConfig.url}/news/${article.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}

