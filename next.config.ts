import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API and static upload requests to the Go backend
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/api/v1/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8080/uploads/:path*",
      },
      {
        source: "/media/:path*",
        destination: "http://localhost:8080/media/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
