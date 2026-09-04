import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { RouteGuard } from "@/components/auth/route-guard";

export const metadata = {
  title: {
    default: "Newsroom Panel",
    template: "%s | Newsroom CMS",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requireStaff={true}>
      <SidebarProvider defaultOpen={true}>
        <DashboardSidebar />
        <SidebarInset className="min-w-0 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full p-3.5 sm:p-5 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </RouteGuard>
  );
}
