"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  IconChevronUp,
  IconLogout,
  IconSettings,
  IconPencilPlus,
  IconLayoutDashboard,
  IconArticle,
  IconPhoto,
  IconFolder,
  IconTag,
  IconUsers,
  IconShield,
  IconChartBar,
  IconSearch,
  IconMessage,
  IconBroadcast,
  IconLock,
  IconBuilding,
  IconBell,
  IconCoin,
  IconMapPin,
  IconFolderOpen,
} from "@tabler/icons-react";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/components/providers/auth-provider";
import { useTenant } from "@/components/providers/tenant-provider";
import { Button } from "@/components/ui/button";
import { listMenus, type MenuItem } from "@/lib/api/iam";

// Dynamic Icon dictionary mapped directly to PostgreSQL icon column values
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "layout-dashboard": IconLayoutDashboard,
  "dashboard": IconLayoutDashboard,
  "file-text": IconArticle,
  "articles": IconArticle,
  "layers": IconPencilPlus,
  "stories": IconPencilPlus,
  "radio": IconBroadcast,
  "live_blogs": IconBroadcast,
  "live-blogs": IconBroadcast,
  "image": IconPhoto,
  "media_library": IconPhoto,
  "media-library": IconPhoto,
  "folder": IconFolder,
  "categories": IconFolder,
  "tag": IconTag,
  "tags": IconTag,
  "message-circle": IconMessage,
  "comments": IconMessage,
  "users": IconUsers,
  "shield": IconShield,
  "roles": IconShield,
  "lock": IconLock,
  "permissions": IconLock,
  "bar-chart": IconChartBar,
  "analytics": IconChartBar,
  "search": IconSearch,
  "seo": IconSearch,
  "settings": IconSettings,
  "building": IconBuilding,
  "tenants": IconBuilding,
  "bell": IconBell,
  "notifications": IconBell,
  "credit-card": IconCoin,
  "ad_slots": IconCoin,
  "map-pin": IconMapPin,
  "districts": IconMapPin,
};

function getMenuIcon(item: MenuItem) {
  if (item.icon && ICON_MAP[item.icon]) return ICON_MAP[item.icon];
  if (item.name && ICON_MAP[item.name]) return ICON_MAP[item.name];
  return IconFolderOpen;
}

function getMenuHref(item: MenuItem) {
  if (item.path && item.path.trim()) return item.path;
  const cleanName = item.name.toLowerCase().replace(/_/g, "-");
  if (cleanName === "stories") return "/studio/new";
  if (cleanName === "live-blogs") return "/panel/liveblog";
  if (cleanName === "media-library") return "/panel/media";
  return `/panel/${cleanName}`;
}

function formatMenuLabel(item: MenuItem): string {
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    articles: "Articles",
    categories: "Categories",
    tags: "Tags",
    media_library: "Media",
    live_blogs: "Live Blog",
    web_stories: "Web Stories",
    epaper: "E-Paper",
    comments: "Comments",
    roles: "Roles & Permissions",
    users: "Team & Staff",
    analytics: "Analytics",
    settings: "Settings",
  };
  return (item.name && map[item.name.toLowerCase()]) || item.label || item.name;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { siteName } = useTenant();
  const { open, isMobile, setOpenMobile } = useSidebar();

  // Dynamic menu query
  const { data: menusData, isLoading } = useQuery({
    queryKey: ["menus"],
    queryFn: () => listMenus(),
  });

  const menus: MenuItem[] = Array.isArray(menusData?.data)
    ? menusData.data
    : Array.isArray(menusData)
    ? (menusData as any)
    : [];

  // Group menus dynamically
  const seenHrefs = new Set<string>();
  const editorialMenus: MenuItem[] = [];
  const governanceMenus: MenuItem[] = [];

  for (const m of menus) {
    if (m.is_active === false) continue;
    const href = getMenuHref(m);
    if (seenHrefs.has(href)) continue;
    seenHrefs.add(href);

    // Editorial modules sort_order <= 8; management 9+
    if ((m.sort_order ?? 0) <= 8) {
      editorialMenus.push(m);
    } else {
      governanceMenus.push(m);
    }
  }

  function isActive(href: string) {
    if (href === "/panel/dashboard") return pathname === "/panel/dashboard" || pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const initials = user?.display_name
    ? user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/panel/dashboard" onClick={handleNavClick} />}>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold shadow-xs">
                {siteName ? siteName.slice(0, 2).toUpperCase() : "BV"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold truncate max-w-[140px]">
                  {siteName || siteConfig.name}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  Newsroom Panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Fast Action CTA */}
        <div className="p-3">
          <Button
            className="w-full text-xs font-semibold shadow-xs"
            size="sm"
            render={<Link href="/studio/new" onClick={handleNavClick} />}
          >
            <IconPencilPlus className="mr-2 h-4 w-4" />
            {open && "New Article"}
          </Button>
        </div>

        {/* Section 1: Editorial & Content */}
        {isLoading && menus.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Loading navigation…
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            {editorialMenus.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Content
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {editorialMenus.map((item) => {
                      const IconComponent = getMenuIcon(item);
                      const href = getMenuHref(item);
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive(href)}
                            tooltip={formatMenuLabel(item)}
                            className="min-h-[38px]"
                            render={<Link href={href} onClick={handleNavClick} />}
                          >
                            <IconComponent className="h-4 w-4" />
                            <span className="text-sm">{formatMenuLabel(item)}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {governanceMenus.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Management
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {governanceMenus.map((item) => {
                      const IconComponent = getMenuIcon(item);
                      const href = getMenuHref(item);
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive(href)}
                            tooltip={formatMenuLabel(item)}
                            className="min-h-[38px]"
                            render={<Link href={href} onClick={handleNavClick} />}
                          >
                            <IconComponent className="h-4 w-4" />
                            <span className="text-sm">{formatMenuLabel(item)}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="min-h-[44px]" />}>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium truncate">
                    {user?.display_name || "Staff Member"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </span>
                </div>
                <IconChevronUp className="ml-auto h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem render={<Link href="/panel/settings" onClick={handleNavClick} />}>
                  <IconSettings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => logout()}
                >
                  <IconLogout className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
