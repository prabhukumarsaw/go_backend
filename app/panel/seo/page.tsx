"use client";

import { useState } from "react";
import {
  IconSearch,
  IconWorld,
  IconFileCode,
  IconCheck,
  IconExternalLink,
  IconBrandGoogle,
  IconRefresh,
} from "@tabler/icons-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/components/providers/tenant-provider";

export default function SEOPage() {
  const { siteName, tagline } = useTenant();
  const [metaTitle, setMetaTitle] = useState(`${siteName} - ${tagline}`);
  const [metaDescription, setMetaDescription] = useState(
    "Delivering independent, verified, and fearless breaking news coverage across all state editions in India."
  );
  const [slug, setSlug] = useState("lok-sabha-special-report");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const canonicalUrl = `${baseUrl}/news/${slug}`;

  // JSON-LD NewsArticle structured data schema
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": metaTitle,
    "description": metaDescription,
    "image": [`${baseUrl}/og-image.png`],
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "author": [
      {
        "@type": "Person",
        "name": "Editorial Bureau",
        "jobTitle": "Special Correspondent",
      },
    ],
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": siteName,
      "url": baseUrl,
    },
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="SEO & Social Sharing"
        description="Preview Google search results, social share cards, and article structured data."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium"
            render={<Link href="/sitemap.xml" target="_blank" />}
          >
            <IconFileCode className="mr-1.5 h-3.5 w-3.5" />
            Sitemap
            <IconExternalLink className="ml-1 h-3 w-3 opacity-60" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium"
            render={<Link href="/robots.txt" target="_blank" />}
          >
            Robots.txt
            <IconExternalLink className="ml-1 h-3 w-3 opacity-60" />
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="simulator" className="text-xs">
            Google Snippet Simulator
          </TabsTrigger>
          <TabsTrigger value="jsonld" className="text-xs">
            JSON-LD News Schema
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">
            Sitemap & Crawl Audit
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Google Search Simulator ─── */}
        <TabsContent value="simulator" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Controls */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <IconSearch className="h-4 w-4 text-primary" />
                  Meta Metadata Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <Label htmlFor="seo-title" className="font-semibold">
                      SEO Meta Title
                    </Label>
                    <span
                      className={`font-mono text-[11px] ${
                        metaTitle.length > 60
                          ? "text-amber-500 font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {metaTitle.length} / 60 chars
                    </span>
                  </div>
                  <Input
                    id="seo-title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <Label htmlFor="seo-slug" className="font-semibold">
                      Canonical Path / Slug
                    </Label>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      Strict lower-kebab
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                    <span>/news/</span>
                    <Input
                      id="seo-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <Label htmlFor="seo-desc" className="font-semibold">
                      Search Description (Snippet)
                    </Label>
                    <span
                      className={`font-mono text-[11px] ${
                        metaDescription.length > 160
                          ? "text-amber-500 font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {metaDescription.length} / 160 chars
                    </span>
                  </div>
                  <Textarea
                    id="seo-desc"
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="text-xs resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Live Search Engine Result Preview */}
            <div className="space-y-4">
              <Card className="shadow-xs border-primary/20 bg-card">
                <CardHeader className="pb-2 border-b bg-muted/20">
                  <CardTitle className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <IconBrandGoogle className="h-4 w-4 text-primary" />
                    Google Search Result (SERP) Live Mock
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/20 text-primary font-bold text-[9px] flex items-center justify-center">
                      NV
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate">
                      {canonicalUrl}
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-blue-500 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
                    {metaTitle || "Headline Title"}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {metaDescription ||
                      "Search snippet description will appear here..."}
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-500">
                      ✓ Indexed
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Fast Mobile Ready
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Social OpenGraph Preview Card */}
              <Card className="shadow-xs bg-card">
                <CardHeader className="pb-2 border-b bg-muted/20">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Social Card Preview (OpenGraph / Twitter)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="h-28 w-full rounded-lg bg-muted/40 border flex items-center justify-center text-xs font-mono text-muted-foreground">
                    [Featured Image: 1200 × 630 px]
                  </div>
                  <div className="text-xs font-bold text-foreground truncate">
                    {metaTitle}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {metaDescription}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/70 uppercase">
                    {baseUrl.replace(/^https?:\/\//, "")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Tab 2: JSON-LD Structured Data ─── */}
        <TabsContent value="jsonld" className="space-y-4 pt-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <IconFileCode className="h-4 w-4 text-amber-500" />
                  Schema.org NewsArticle JSON-LD Output
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Embedded in Next.js Server Component header tags for Google News discovery.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono text-emerald-500">
                <IconCheck className="mr-1 h-3 w-3" /> Valid Schema
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <pre className="p-4 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(jsonLdSchema, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 3: Sitemap & Crawl Audit ─── */}
        <TabsContent value="audit" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sitemap Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-xl font-bold font-mono text-emerald-500 flex items-center gap-1.5">
                  <IconCheck className="h-5 w-5" /> 200 OK (Live)
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Dynamic route at <code className="text-foreground">/sitemap.xml</code>
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Robots Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-xl font-bold font-mono text-emerald-500 flex items-center gap-1.5">
                  <IconCheck className="h-5 w-5" /> Active Rules
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Allows Googlebot & protects `/panel/*`
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Canonical URLs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-xl font-bold font-mono text-emerald-500 flex items-center gap-1.5">
                  <IconCheck className="h-5 w-5" /> Auto-Generated
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Prevents duplicate content penalties
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
