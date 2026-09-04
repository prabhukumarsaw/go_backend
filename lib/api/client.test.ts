import { describe, it, expect, beforeEach } from "vitest";
import { setAccessToken, getAccessToken, clearTokens, ApiClientError } from "./client";

describe("API Client & Token Management", () => {
  beforeEach(() => {
    clearTokens();
  });

  it("stores and retrieves access token", () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken("test-jwt-token-123");
    expect(getAccessToken()).toBe("test-jwt-token-123");
  });

  it("clears access token on logout", () => {
    setAccessToken("token-to-clear");
    clearTokens();
    expect(getAccessToken()).toBeNull();
  });

  it("creates ApiClientError with status and message", () => {
    const error = new ApiClientError(404, {
      success: false,
      message: "Article not found",
    });

    expect(error.status).toBe(404);
    expect(error.message).toBe("Article not found");
    expect(error.name).toBe("ApiClientError");
  });
});
