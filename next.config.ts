import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma v7 + Next.js 16 compatibility
  serverExternalPackages: ["@prisma/client", ".prisma"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**"],
  },
};

export default nextConfig;
