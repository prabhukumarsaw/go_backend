import { Inter, Playfair_Display, Geist_Mono, Mukta } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { TenantProvider } from "@/components/providers/tenant-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CommandMenu } from "@/components/shared/command-menu";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-hindi",
  display: "swap",
});

export const metadata = {
  title: {
    default: "NewsRoom — Breaking News, In-Depth Analysis & Live Coverage",
    template: "%s | NewsRoom",
  },
  description:
    "India's next-generation news platform delivering verified breaking news, investigative journalism, live election coverage, and hyperlocal state reporting across 37 editions.",
  keywords: [
    "news",
    "breaking news",
    "india news",
    "live coverage",
    "elections",
    "journalism",
    "editorial",
  ],
  authors: [{ name: "NewsRoom Editorial" }],
  creator: "NewsRoom",
  publisher: "NewsRoom Media Network",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "NewsRoom",
    title: "NewsRoom — Breaking News & Live Coverage",
    description:
      "India's next-generation verified news platform with 37 state editions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsRoom",
    description: "Breaking news & live coverage across India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        playfair.variable,
        fontMono.variable,
        "font-sans",
      )}
    >
      <body>
        <ThemeProvider>
          <QueryProvider>
            <TenantProvider>
              <AuthProvider>
                <NuqsAdapter>
                  <TooltipProvider>{children}</TooltipProvider>
                  <CommandMenu />
                  <Toaster />
                </NuqsAdapter>
              </AuthProvider>
            </TenantProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

