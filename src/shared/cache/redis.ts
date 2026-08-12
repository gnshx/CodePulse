import { Redis } from "@upstash/redis";

const hasRedisConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN &&
    !process.env.UPSTASH_REDIS_REST_URL.includes("your-url")
);

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = hasRedisConfig
  ? (globalForRedis.redis ??
    new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }))
  : null;

if (process.env.NODE_ENV !== "production" && redis) {
  globalForRedis.redis = redis;
}

// ─────────────────────────────────────────────
// Cache Keys
// ─────────────────────────────────────────────
export const CACHE_KEYS = {
  leetcodeProfile: (username: string) => `lc:profile:${username}`,
  codeforcesProfile: (username: string) => `cf:profile:${username}`,
  gfgProfile: (username: string) => `gfg:profile:${username}`,
  codechefProfile: (username: string) => `cc:profile:${username}`,
  userAnalytics: (userId: string) => `analytics:${userId}`,
  recommendations: (userId: string) => `recs:${userId}`,
  aiCoach: (userId: string) => `ai:coach:${userId}`,
} as const;

// Cache TTLs in seconds
export const CACHE_TTL = {
  SHORT: 60 * 5,        // 5 minutes
  MEDIUM: 60 * 60,      // 1 hour
  LONG: 60 * 60 * 6,   // 6 hours
  DAY: 60 * 60 * 24,   // 1 day
} as const;

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  if (!redis) {
    return fn();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {}

  const result = await fn();

  try {
    await redis.set(key, result, { ex: ttl });
  } catch {}

  return result;
}
