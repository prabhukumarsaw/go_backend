import { describe, it, expect } from "vitest";
import { escapeHtml, isSafeUrl, sanitizeRichText } from "./sanitize";

describe("Security & Sanitization Utilities", () => {
  describe("escapeHtml", () => {
    it("escapes special HTML characters", () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
      );
      expect(escapeHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#039;s");
    });
  });

  describe("isSafeUrl", () => {
    it("allows standard http/https URLs", () => {
      expect(isSafeUrl("https://newsroom.com")).toBe(true);
      expect(isSafeUrl("http://localhost:8080/media/pic.jpg")).toBe(true);
      expect(isSafeUrl("/news/breaking")).toBe(true);
    });

    it("rejects dangerous javascript: and data: URLs", () => {
      expect(isSafeUrl("javascript:alert(1)")).toBe(false);
      expect(isSafeUrl("JAVASCRIPT:alert(1)")).toBe(false);
      expect(isSafeUrl("data:text/html,<script>")).toBe(false);
      expect(isSafeUrl(null)).toBe(false);
      expect(isSafeUrl("")).toBe(false);
    });
  });

  describe("sanitizeRichText", () => {
    it("strips script tags and inline event handlers", () => {
      const input = '<p>Breaking News</p><script>evil()</script><img src="x" onerror="alert(1)">';
      const output = sanitizeRichText(input);
      expect(output).not.toContain("<script>");
      expect(output).not.toContain("onerror");
      expect(output).toContain("<p>Breaking News</p>");
    });
  });
});
