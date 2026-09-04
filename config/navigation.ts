import {
  IconDashboard,
  IconArticle,
  IconCategory,
  IconTag,
  IconPhoto,
  IconUsers,
  IconShield,
  IconChartBar,
  IconSettings,
  IconMessage,
  IconSeo,
} from "@tabler/icons-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: string;
  children?: NavItem[];
}

export const dashboardNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/panel/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Articles",
    href: "/panel/articles",
    icon: IconArticle,
    permission: "content.read",
  },
  {
    title: "Categories",
    href: "/panel/categories",
    icon: IconCategory,
    permission: "content.read",
  },
  {
    title: "Tags",
    href: "/panel/tags",
    icon: IconTag,
    permission: "content.read",
  },
  {
    title: "Media",
    href: "/panel/media",
    icon: IconPhoto,
    permission: "media.read",
  },
  {
    title: "Comments",
    href: "/panel/comments",
    icon: IconMessage,
    permission: "moderation.read",
  },
  {
    title: "Analytics",
    href: "/panel/analytics",
    icon: IconChartBar,
    permission: "analytics.read",
  },
  {
    title: "SEO",
    href: "/panel/seo",
    icon: IconSeo,
    permission: "seo.read",
  },
  {
    title: "Users",
    href: "/panel/users",
    icon: IconUsers,
    permission: "iam.read",
  },
  {
    title: "Roles",
    href: "/panel/roles",
    icon: IconShield,
    permission: "iam.read",
  },
  {
    title: "Settings",
    href: "/panel/settings",
    icon: IconSettings,
    permission: "settings.read",
  },
];

export const publicNavigation: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Politics", href: "/politics" },
  { title: "Business", href: "/business" },
  { title: "Technology", href: "/technology" },
  { title: "Entertainment", href: "/entertainment" },
  { title: "Sports", href: "/sports" },
  { title: "Opinion", href: "/opinion" },
];
