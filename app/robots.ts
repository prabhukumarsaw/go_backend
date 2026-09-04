import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/panel/",
          "/dashboard/",
          "/studio/",
          "/api/",
          "/login",
          "/register",
          "/settings",
        ],
      },
      {
        userAgent: "Googlebot-News",
        allow: ["/news/", "/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/news/", "/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
