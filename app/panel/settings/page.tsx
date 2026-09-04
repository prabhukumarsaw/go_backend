"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconSettings,
  IconShield,
  IconServer,
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandYoutube,
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconBrandLinkedin,
  IconDatabase,
  IconDownload,
  IconPhoto,
  IconArchive,
  IconCheck,
  IconAlertTriangle,
  IconLoader2,
  IconExternalLink,
  IconWorld,
  IconKey,
  IconRefresh,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSiteSettings,
  updateSiteSettings,
  downloadBackup,
  type SiteSettings,
} from "@/lib/api/settings";
import { useTenant } from "@/components/providers/tenant-provider";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { refetchSettings, tenants, activeTenant, setActiveTenant } = useTenant();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
  });

  const [formData, setFormData] = useState<SiteSettings>({
    name: "NewsRoom",
    tagline: "Independent, Verified & Fearless Journalism",
    motive: "Delivering credible news and investigative journalism across all state editions in India.",
    logo_url: "",
    favicon_url: "",
    default_language: "en",
    maintenance_mode: false,
    maintenance_message: "We are currently performing scheduled maintenance. News updates will resume shortly.",
    social_links: {
      x: "https://x.com/newsroom",
      instagram: "https://instagram.com/newsroom",
      facebook: "https://facebook.com/newsroom",
      youtube: "https://youtube.com/@newsroom",
      whatsapp: "https://whatsapp.com/channel/newsroom",
      telegram: "https://t.me/newsroom",
      linkedin: "https://linkedin.com/company/newsroom",
    },
    security: {
      session_timeout_mins: 10080,
      max_login_attempts: 5,
      enforce_mfa: false,
      ip_whitelist: "",
    },
    api: {
      base_url: "http://localhost:8080/api/v1",
      rate_limit_per_minute: 300,
      webhook_url: "",
    },
  });

  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (settingsData?.data) {
      setFormData(settingsData.data);
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: (input: Partial<SiteSettings>) => updateSiteSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      refetchSettings();
      toast.success("Platform settings updated & synchronized successfully!");
    },
    onError: () => {
      toast.error("Failed to update platform settings.");
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleDownloadBackup = async (
    type: "database" | "media" | "snapshot",
    filename: string
  ) => {
    setDownloading(type);
    try {
      await downloadBackup(type, filename);
      toast.success(`${type.toUpperCase()} export downloaded successfully!`);
    } catch {
      toast.error(`Failed to export ${type} backup.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure site identity, branding, social channels, and database backups.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || isLoading}
          size="sm"
          className="h-8 shadow-xs shrink-0 font-medium"
        >
          {updateMutation.isPending ? (
            <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <IconCheck className="mr-1.5 h-3.5 w-3.5" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Tabs Container */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full h-auto p-1 gap-1">
          <TabsTrigger value="general" className="text-xs py-1.5">
            <IconSettings className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" />
            General
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs py-1.5">
            <IconWorld className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" />
            Social Links
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs py-1.5">
            <IconServer className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" />
            API
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs py-1.5">
            <IconShield className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" />
            Security
          </TabsTrigger>
          <TabsTrigger value="backups" className="text-xs py-1.5">
            <IconDatabase className="mr-1.5 h-3.5 w-3.5 hidden sm:inline" />
            Backups
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: General & Publication Branding ─── */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publication Identity</CardTitle>
              <CardDescription className="text-xs">
                Configure platform name, motive, and logo dynamically broadcast across desktop & mobile readers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="platform-name" className="text-xs font-semibold">
                    Platform / Publication Name
                  </Label>
                  <Input
                    id="platform-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="default-lang" className="text-xs font-semibold">
                    Default Language
                  </Label>
                  <Select
                    value={formData.default_language}
                    onValueChange={(val) =>
                      setFormData({ ...formData, default_language: val || "en" })
                    }
                  >
                    <SelectTrigger id="default-lang" className="text-xs">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (India)</SelectItem>
                      <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                      <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                      <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                      <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editorial-tagline" className="text-xs font-semibold">
                  Editorial Tagline
                </Label>
                <Input
                  id="editorial-tagline"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="publication-motive" className="text-xs font-semibold">
                  Editorial Motive & Mission Statement
                </Label>
                <Textarea
                  id="publication-motive"
                  value={formData.motive}
                  onChange={(e) =>
                    setFormData({ ...formData, motive: e.target.value })
                  }
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>

              {/* Logo URL with Live Preview */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="logo-url" className="text-xs font-semibold">
                    Dynamic Logo URL
                  </Label>
                  <Input
                    id="logo-url"
                    value={formData.logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, logo_url: e.target.value })
                    }
                    placeholder="https://... or /uploads/..."
                    className="text-xs font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to use default typographical logo.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Live Logo Preview</Label>
                  <div className="h-10 rounded-md border bg-muted/40 flex items-center px-4">
                    {formData.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.logo_url}
                        alt="Preview"
                        className="h-6 w-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold">{formData.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: Social Media & Broadcast Channels ─── */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Media & Broadcast Channels</CardTitle>
              <CardDescription className="text-xs">
                Configure verified URLs and broadcasting channels for audience syndication across footers, articles, and author cards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* X */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <IconBrandX className="h-4 w-4" /> X (formerly Twitter)
                  </Label>
                  <Input
                    value={formData.social_links?.x || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, x: e.target.value },
                      })
                    }
                    className="text-xs font-mono"
                    placeholder="https://x.com/username"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-pink-500">
                    <IconBrandInstagram className="h-4 w-4" /> Instagram Profile
                  </Label>
                  <Input
                    value={formData.social_links?.instagram || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          instagram: e.target.value,
                        },
                      })
                    }
                    className="text-xs font-mono"
                    placeholder="https://instagram.com/handle"
                  />
                </div>

                {/* Facebook */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-blue-500">
                    <IconBrandFacebook className="h-4 w-4" /> Facebook Page
                  </Label>
                  <Input
                    value={formData.social_links?.facebook || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          facebook: e.target.value,
                        },
                      })
                    }
                    className="text-xs font-mono"
                    placeholder="https://facebook.com/page"
                  />
                </div>

                {/* YouTube */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-red-500">
                    <IconBrandYoutube className="h-4 w-4" /> YouTube Channel
                  </Label>
                  <Input
                    value={formData.social_links?.youtube || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          youtube: e.target.value,
                        },
                      })
                    }
                    className="text-xs font-mono"
                    placeholder="https://youtube.com/@channel"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-emerald-500">
                    <IconBrandWhatsapp className="h-4 w-4" /> WhatsApp Channel / Community
                  </Label>
                  <Input
                    value={formData.social_links?.whatsapp || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          whatsapp: e.target.value,
                        },
                      })
                    }
                    className="text-xs font-mono"
                    placeholder="https://whatsapp.com/channel/..."
                  />
                </div>

                {/* Telegram */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-sky-500">
                    <IconBrandTelegram className="h-4 w-4" /> Telegram News Broadcast
                  </Label>
                  <Input
                    value={formData.social_links?.telegram || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          telegram: e.target.value,
                        },
                      })
                    }
                    className="text-xs font-mono"
                    placeholder="https://t.me/channel"
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-blue-600">
                    <IconBrandLinkedin className="h-4 w-4" /> LinkedIn Company Page
                  </Label>
                  <Input
                    value={formData.social_links?.linkedin || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        social_links: {
                          ...formData.social_links,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    className="text-xs font-mono"
                    placeholder="https://linkedin.com/company/name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 3: API & System Architecture ─── */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Gateway & System Architecture</CardTitle>
              <CardDescription className="text-xs">
                Manage backend endpoints, Edge CDN caching rules, and unified newsroom architecture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Label className="text-xs font-semibold text-primary">Newsroom Architecture</Label>
                <p className="text-xs text-muted-foreground">
                  Global Single-Domain Newsroom with Advanced Hierarchical Taxonomy Tree (State &gt; District &gt; City + Topics).
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="api-base" className="text-xs font-semibold">
                    API Base URL
                  </Label>
                  <Input
                    id="api-base"
                    value={formData.api?.base_url || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        api: { ...formData.api, base_url: e.target.value },
                      })
                    }
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rate-limit" className="text-xs font-semibold">
                    Rate Limit (Requests / Minute)
                  </Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={formData.api?.rate_limit_per_minute || 300}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        api: {
                          ...formData.api,
                          rate_limit_per_minute: parseInt(e.target.value) || 300,
                        },
                      })
                    }
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="webhook-url" className="text-xs font-semibold">
                  Publishing Webhook URL (Discord / Slack / Telegram Bot)
                </Label>
                <Input
                  id="webhook-url"
                  value={formData.api?.webhook_url || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      api: { ...formData.api, webhook_url: e.target.value },
                    })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                  className="text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 4: Security & Maintenance Mode ─── */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security & Maintenance Controls</CardTitle>
              <CardDescription className="text-xs">
                Control public accessibility, maintenance banners, and newsroom authentication policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconAlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">Maintenance Mode</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When active, a prominent banner is shown to public readers and write APIs can be throttled.
                  </p>
                </div>
                <Switch
                  checked={formData.maintenance_mode}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, maintenance_mode: checked })
                  }
                />
              </div>

              {formData.maintenance_mode && (
                <div className="space-y-1.5">
                  <Label htmlFor="maint-msg" className="text-xs font-semibold">
                    Maintenance Announcement Message
                  </Label>
                  <Input
                    id="maint-msg"
                    value={formData.maintenance_message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenance_message: e.target.value,
                      })
                    }
                    className="text-xs"
                  />
                </div>
              )}

              {/* Security Policy */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="session-timeout" className="text-xs font-semibold">
                    Staff Session Timeout (Minutes)
                  </Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={formData.security?.session_timeout_mins || 10080}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        security: {
                          ...formData.security,
                          session_timeout_mins: parseInt(e.target.value) || 10080,
                        },
                      })
                    }
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="max-attempts" className="text-xs font-semibold">
                    Max Login Attempts Before Lockout
                  </Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    value={formData.security?.max_login_attempts || 5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        security: {
                          ...formData.security,
                          max_login_attempts: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 5: Backups & Disaster Recovery ─── */}
        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconDatabase className="h-5 w-5 text-primary" />
                Disaster Recovery & Data Export
              </CardTitle>
              <CardDescription className="text-xs">
                Export full database tables, cloud media registries, and platform snapshots for local offline archiving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* 1. PostgreSQL .DUMP Archive */}
                <div className="flex flex-col justify-between p-4 rounded-lg border bg-card/60 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                      <IconDatabase className="h-4 w-4 text-emerald-500" />
                      PostgreSQL Dump Archive (.dump)
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Full native PostgreSQL database dump archive (.dump). Compatible with pg_restore, psql, and RDS.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={downloading === "database"}
                    onClick={() =>
                      handleDownloadBackup(
                        "database",
                        `newsroom_postgres_backup_${new Date().toISOString().slice(0, 10)}.dump`
                      )
                    }
                  >
                    {downloading === "database" ? (
                      <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <IconDownload className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Download PostgreSQL .DUMP Backup
                  </Button>
                </div>

                {/* 2. Media Asset ZIP Archive */}
                <div className="flex flex-col justify-between p-4 rounded-lg border bg-card/60 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                      <IconPhoto className="h-4 w-4 text-sky-500" />
                      Media Assets Archive (.zip)
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Complete compressed ZIP package containing all uploaded media files on disk and manifest.json.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={downloading === "media"}
                    onClick={() =>
                      handleDownloadBackup(
                        "media",
                        `newsroom_media_archive_${new Date().toISOString().slice(0, 10)}.zip`
                      )
                    }
                  >
                    {downloading === "media" ? (
                      <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <IconDownload className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Download Media .ZIP Archive
                  </Button>
                </div>

                {/* 3. Full Platform Snapshot */}
                <div className="flex flex-col justify-between p-4 rounded-lg border bg-card/60 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                      <IconArchive className="h-4 w-4 text-amber-500" />
                      System Snapshot (.json)
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Consolidated platform snapshot containing schema version, telemetry summary counts, and parameters.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={downloading === "snapshot"}
                    onClick={() =>
                      handleDownloadBackup(
                        "snapshot",
                        `newsroom_full_snapshot_${new Date().toISOString().slice(0, 10)}.json`
                      )
                    }
                  >
                    {downloading === "snapshot" ? (
                      <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <IconDownload className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Export System Snapshot
                  </Button>
                </div>
              </div>

              <div className="p-3.5 rounded-md border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
                <span>Last automated backup status: <strong className="text-emerald-500 font-mono">HEALTHY</strong></span>
                <span className="font-mono text-[11px]">Format: PostgreSQL .SQL / Media .ZIP / Snapshot .JSON</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
