import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The TypeScript compiler API is stable in TypeScript 5.x and avoids the
  // Next 16 CLI parser path, which can fail while reading `tsc --showConfig`.
  experimental: {
    useTypeScriptCli: false,
    webpackBuildWorker: false,
  },
  // Prisma v7 + Next.js 16 compatibility
  serverExternalPackages: ["@prisma/client", ".prisma"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**"],
  },
};

export default nextConfig;
