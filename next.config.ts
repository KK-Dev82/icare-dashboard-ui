import type { NextConfig } from "next";

// API routing is handled by nginx (icare-dashboard.uat-system.com → /api/* → icare-app-api).
// Do NOT add a `rewrites()` here: `next.config.ts` is evaluated at build time,
// so any `process.env.*` reads would be frozen into the image and ignored at runtime.

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
    ],
  },
};

export default nextConfig;
