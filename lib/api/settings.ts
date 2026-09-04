import { apiClient, getAccessToken } from "./client";
import { env } from "@/config/env";
import type { ApiResponse } from "@/types/api";

export interface SocialLinks {
  x: string;
  instagram: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  telegram: string;
  linkedin: string;
}

export interface SecuritySettings {
  session_timeout_mins: number;
  max_login_attempts: number;
  enforce_mfa: boolean;
  ip_whitelist: string;
}

export interface APISettings {
  base_url: string;
  rate_limit_per_minute: number;
  webhook_url: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  motive: string;
  logo_url: string;
  favicon_url: string;
  default_language: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  social_links: SocialLinks;
  security: SecuritySettings;
  api: APISettings;
  updated_at?: string;
}

// Fetch public/current site settings
export async function getSiteSettings(): Promise<ApiResponse<SiteSettings>> {
  return apiClient.get<ApiResponse<SiteSettings>>("/settings");
}

// Update site settings (Admin / Staff)
export async function updateSiteSettings(
  input: Partial<SiteSettings>
): Promise<ApiResponse<SiteSettings>> {
  return apiClient.patch<ApiResponse<SiteSettings>>("/admin/settings", input);
}

// Helper to trigger browser attachment download with auth bearer token
export async function downloadBackup(
  endpoint: "database" | "media" | "snapshot",
  defaultFilename: string
) {
  const token = getAccessToken();
  const url = `${env.NEXT_PUBLIC_API_URL}/api/v1/admin/backup/${endpoint}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${endpoint} backup`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = defaultFilename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}
