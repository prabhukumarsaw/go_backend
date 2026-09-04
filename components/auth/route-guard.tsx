"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { IconShieldLock, IconArrowLeft, IconLogin } from "@tabler/icons-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";

interface RouteGuardProps {
  children: React.ReactNode;
  requireStaff?: boolean;
}

export function RouteGuard({ children, requireStaff = true }: RouteGuardProps) {
  const { user, isLoading, isAuthenticated, isStaff } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <LoadingState message="Verifying newsroom security credentials…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <LoadingState message="Redirecting to secure login…" />
      </div>
    );
  }

  // If user is authenticated but not a staff member
  if (requireStaff && !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-md w-full text-center p-6 sm:p-8 space-y-6 border shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <IconShieldLock className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight font-serif text-foreground">
              403 — Staff Access Required
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account (<span className="font-mono text-foreground">{user?.email}</span>) does not have staff or editorial privileges to access the Newsroom CMS and Studio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button variant="outline" size="sm" render={<Link href="/" />}>
              <IconArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Return to Homepage
            </Button>
            <Button size="sm" render={<Link href="/login" />}>
              <IconLogin className="mr-1.5 h-3.5 w-3.5" />
              Sign In as Staff
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
