export const siteConfig = {
  name: "NewsRoom",
  description: "Professional editorial news platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  apiPrefix: "/api/v1",
  defaultLanguage: "en",
  defaultTenant: 1,
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  media: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    acceptedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    acceptedVideoTypes: ["video/mp4", "video/webm"],
  },
} as const;

export type SiteConfig = typeof siteConfig;
