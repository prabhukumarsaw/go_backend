import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected Newsroom & Studio Routes
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/panel",
  "/studio",
  "/articles",
  "/categories",
  "/tags",
  "/media",
  "/comments",
  "/analytics",
  "/users",
  "/roles",
  "/seo",
  "/settings",
];

// Auth Pages
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  // 1. Unauthenticated reader attempting to access protected Studio/CMS
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user visiting /login or /register -> redirect to dashboard
  if (isAuthPage && token) {
    const destination = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    const redirectUrl = new URL(destination.startsWith("/") ? destination : "/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
