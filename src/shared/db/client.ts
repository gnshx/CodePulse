import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function normalizeConnectionString(rawUrl?: string) {
  if (!rawUrl) return "postgresql://user:password@localhost:5432/better_cp?schema=public";
  
  // Handle database passwords that contain unescaped '@' characters
  const match = rawUrl.match(/^(postgresql:\/\/[^:]+:)(.*)(@[^@]+:\d+\/.*)$/);
  if (match) {
    const [, prefix, password, suffix] = match;
    return `${prefix}${encodeURIComponent(password)}${suffix}`;
  }
  return rawUrl;
}

const connectionString = normalizeConnectionString(process.env.DATABASE_URL);
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
