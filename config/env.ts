/**
 * Type-safe environment variable access.
 * Client-side variables must be prefixed with NEXT_PUBLIC_.
 */
export const env = {
  // Server-only
  API_URL: process.env.API_URL || "http://localhost:8080",

  // Client-safe
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_MEDIA_URL:
    process.env.NEXT_PUBLIC_MEDIA_URL || "http://localhost:8080/media",
} as const;
