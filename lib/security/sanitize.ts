/**
 * Security & Sanitization Utilities for Editorial Newsroom.
 */

/**
 * Escapes unsafe characters for HTML output.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates whether a URL is safe (http, https, or relative protocol).
 * Prevents javascript: and data: XSS vectors.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return true;
  }
  return false;
}

/**
 * Strips dangerous tags and attributes from rich text HTML.
 */
export function sanitizeRichText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^"']*/gi, "");
}
