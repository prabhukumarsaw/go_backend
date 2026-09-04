import { siteConfig } from "@/config/site";

export const metadata = {
  title: {
    default: "Sign in",
    template: `%s | ${siteConfig.name}`,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-surface-1 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="text-caption">Editorial CMS</p>
      </div>
      {children}
    </div>
  );
}
