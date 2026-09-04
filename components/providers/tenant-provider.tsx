"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteSettings, type SiteSettings, type SocialLinks } from "@/lib/api/settings";
import { siteConfig } from "@/config/site";

export interface EditionInfo {
  id: number;
  name: string;
  slug: string;
  is_national?: boolean;
}

interface SiteContextValue {
  tenants: EditionInfo[];
  activeTenant: EditionInfo | null;
  setActiveTenant: (tenant: EditionInfo) => void;
  siteName: string;
  setSiteName: (name: string) => void;
  siteMotive: string;
  setSiteMotive: (motive: string) => void;
  tagline: string;
  setTagline: (tagline: string) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  socialLinks: SocialLinks;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  settings: SiteSettings | null;
  refetchSettings: () => void;
}

const defaultSocials: SocialLinks = {
  x: "https://x.com",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  youtube: "https://youtube.com",
  whatsapp: "https://whatsapp.com",
  telegram: "https://t.me",
  linkedin: "https://linkedin.com",
};

const defaultEdition: EditionInfo = {
  id: 1,
  name: "National Desk",
  slug: "national",
  is_national: true,
};

const TenantContext = createContext<SiteContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [siteName, setSiteName] = useState<string>(siteConfig.name);
  const [siteMotive, setSiteMotive] = useState<string>(siteConfig.description);
  const [tagline, setTagline] = useState<string>(siteConfig.description);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [activeTenant, setActiveTenantState] = useState<EditionInfo>(defaultEdition);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultSocials);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>("");

  // 1. Fetch Dynamic Site Settings Live from Go Backend
  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
    staleTime: 0, // Always live
  });

  const settings = settingsData?.data || null;

  useEffect(() => {
    if (settings) {
      if (settings.name) setSiteName(settings.name);
      if (settings.tagline) setTagline(settings.tagline);
      if (settings.motive) setSiteMotive(settings.motive);
      if (settings.logo_url !== undefined) setLogoUrl(settings.logo_url || null);
      if (settings.social_links) {
        setSocialLinks((prev) => ({ ...prev, ...settings.social_links }));
      }
      setMaintenanceMode(!!settings.maintenance_mode);
      if (settings.maintenance_message) {
        setMaintenanceMessage(settings.maintenance_message);
      }
    }
  }, [settings]);

  const setActiveTenant = (tenant: EditionInfo) => {
    setActiveTenantState(tenant);
  };

  return (
    <TenantContext.Provider
      value={{
        tenants: [defaultEdition],
        activeTenant,
        setActiveTenant,
        siteName: settings?.name || siteName || "NewsRoom",
        setSiteName,
        siteMotive,
        setSiteMotive,
        tagline,
        setTagline,
        logoUrl,
        setLogoUrl,
        socialLinks,
        maintenanceMode,
        maintenanceMessage,
        settings,
        refetchSettings,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
