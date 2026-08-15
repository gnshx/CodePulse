import axios from "axios";
import { CACHE_KEYS, CACHE_TTL, withCache } from "@/shared/cache/redis";
import type { PlatformProfile, SubmissionData } from "@/shared/types";

// ─── Deep Codeforces Analytics Type ───────────────────────────────────────────

export type CFAnalytics = {
  /** unique problems solved (deduplicated) */
  solvedCount: number;
  /** how many unique problems solved at each rating bucket (e.g. 800→12, 1000→34) */
  ratingDistribution: Record<number, number>;
  /** avg CF rating of accepted problems per topic */
  topicAvgRating: Record<string, number>;
  /** max CF rating of accepted problems per topic */
  topicMaxRating: Record<string, number>;
  /** raw topic → solved count (same as old fetchCodeforcesTopics) */
  topicCounts: Record<string, number>;
  /** highest rating problem solved */
  maxSolvedRating: number;
  /** 75th percentile rating (comfort zone upper edge) */
  p75Rating: number;
  /** recommended min rating for next practice */
  nextPracticeMin: number;
  /** recommended max rating for next practice */
  nextPracticeMax: number;
};

const CF_BASE = "https://codeforces.com/api";

export async function fetchCodeforcesProfile(username: string): Promise<PlatformProfile | null> {
  return withCache(
    CACHE_KEYS.codeforcesProfile(username),
    CACHE_TTL.MEDIUM,
    async () => {
      try {
        const [infoRes, ratingRes] = await Promise.all([
          axios.get(`${CF_BASE}/user.info?handles=${username}`, { timeout: 10000 }),
          axios.get(`${CF_BASE}/user.rating?handle=${username}`, { timeout: 10000 }),
        ]);

        const user = infoRes.data?.result?.[0];
        if (!user) return null;

        return {
          platform: "CODEFORCES",
          username,
          totalSolved: 0, // Calculated separately from submissions
          rating: user.rating,
          rank: user.rank,
          avatarUrl: user.titlePhoto,
          profileUrl: `https://codeforces.com/profile/${username}`,
        } satisfies PlatformProfile;
      } catch {
        return null;
      }
    }
  );
}

export async function fetchCodeforcesSubmissions(
  username: string,
  count = 500
): Promise<SubmissionData[]> {
  return withCache(
    `cf:submissions:${username}`,
    CACHE_TTL.SHORT,
    async () => {
      try {
        const res = await axios.get(
          `${CF_BASE}/user.status?handle=${username}&count=${count}`,
          { timeout: 15000 }
        );
        const submissions = res.data?.result ?? [];

        return submissions.map((s: any) => ({
          platformId: String(s.id),
          platform: "CODEFORCES" as const,
          status: s.verdict === "OK" ? "Accepted" : s.verdict,
          language: s.programmingLanguage,
          submittedAt: new Date(s.creationTimeSeconds * 1000),
        }));
      } catch {
        return [];
      }
    }
  );
}

export async function fetchCodeforcesTopics(username: string): Promise<Record<string, number>> {
  return withCache(
    `cf:topics:${username}`,
    CACHE_TTL.LONG,
    async () => {
      try {
        const res = await axios.get(
          `${CF_BASE}/user.status?handle=${username}&count=1000`,
          { timeout: 15000 }
        );
        const submissions: any[] = res.data?.result ?? [];

        const accepted = submissions.filter((s) => s.verdict === "OK");
        const topicCount: Record<string, number> = {};

        for (const sub of accepted) {
          const tags: string[] = sub.problem?.tags ?? [];
          for (const tag of tags) {
            topicCount[tag] = (topicCount[tag] ?? 0) + 1;
          }
        }
        return topicCount;
      } catch {
        return {};
      }
    }
  );
}

export async function fetchCodeforcesRatingHistory(username: string) {
  return withCache(
    `cf:rating:${username}`,
    CACHE_TTL.LONG,
    async () => {
      try {
        const res = await axios.get(
          `${CF_BASE}/user.rating?handle=${username}`,
          { timeout: 10000 }
        );
        return (res.data?.result ?? []).map((r: any) => ({
          contestName: r.contestName,
          contestId: String(r.contestId),
          rating: r.newRating,
          rank: r.rank,
          recordedAt: new Date(r.ratingUpdateTimeSeconds * 1000),
        }));
      } catch {
        return [];
      }
    }
  );
}

// ─── Deep Analytics (rating distribution + per-topic avg rating + next-practice) ───

const CF_ANALYTICS_EMPTY: CFAnalytics = {
  solvedCount: 0,
  ratingDistribution: {},
  topicAvgRating: {},
  topicMaxRating: {},
  topicCounts: {},
  maxSolvedRating: 0,
  p75Rating: 0,
  nextPracticeMin: 0,
  nextPracticeMax: 0,
};

export async function fetchCodeforcesAnalytics(username: string): Promise<CFAnalytics> {
  return withCache(
    `cf:deep:${username}`,
    CACHE_TTL.LONG,
    async () => {
      try {
        const res = await axios.get(
          `${CF_BASE}/user.status?handle=${username}&count=2000`,
          { timeout: 20000 }
        );
        const submissions: any[] = res.data?.result ?? [];

        // Deduplicate: one accepted entry per unique problem
        const seen = new Set<string>();
        const accepted: any[] = [];
        for (const sub of submissions) {
          if (sub.verdict !== "OK") continue;
          const key = `${sub.problem.contestId ?? "?"}-${sub.problem.index}`;
          if (!seen.has(key)) {
            seen.add(key);
            accepted.push(sub);
          }
        }

        const ratingDistribution: Record<number, number> = {};
        const topicRatingSums: Record<string, number> = {};
        const topicRatingCounts: Record<string, number> = {};
        const topicMaxRating: Record<string, number> = {};
        const topicCounts: Record<string, number> = {};
        const allRatings: number[] = [];

        for (const sub of accepted) {
          const rating: number | undefined = sub.problem?.rating;
          const tags: string[] = sub.problem?.tags ?? [];

          // Rating bucket (round down to nearest 100)
          if (rating && rating > 0) {
            const bucket = Math.floor(rating / 100) * 100;
            ratingDistribution[bucket] = (ratingDistribution[bucket] ?? 0) + 1;
            allRatings.push(rating);
          }

          for (const tag of tags) {
            topicCounts[tag] = (topicCounts[tag] ?? 0) + 1;
            if (rating && rating > 0) {
              topicRatingSums[tag] = (topicRatingSums[tag] ?? 0) + rating;
              topicRatingCounts[tag] = (topicRatingCounts[tag] ?? 0) + 1;
              topicMaxRating[tag] = Math.max(topicMaxRating[tag] ?? 0, rating);
            }
          }
        }

        // Per-topic average rating
        const topicAvgRating: Record<string, number> = {};
        for (const tag of Object.keys(topicRatingSums)) {
          topicAvgRating[tag] = Math.round(topicRatingSums[tag] / topicRatingCounts[tag]);
        }

        // Sort ratings for percentile
        allRatings.sort((a, b) => a - b);
        const solvedCount = accepted.length;
        const maxSolvedRating = allRatings[allRatings.length - 1] ?? 0;
        const p75idx = Math.max(0, Math.floor(allRatings.length * 0.75) - 1);
        const p75Rating = allRatings[p75idx] ?? 0;

        // "Next practice" = highest bucket with >=3 solves + 100–300 above
        const sortedBuckets = Object.entries(ratingDistribution)
          .map(([r, c]) => [Number(r), c] as [number, number])
          .sort(([a], [b]) => a - b);

        let maxComfortableBucket = 800;
        for (const [bucket, count] of sortedBuckets) {
          if (count >= 3) maxComfortableBucket = bucket;
        }
        const nextPracticeMin = maxComfortableBucket + 100;
        const nextPracticeMax = maxComfortableBucket + 300;

        return {
          solvedCount,
          ratingDistribution,
          topicAvgRating,
          topicMaxRating,
          topicCounts,
          maxSolvedRating,
          p75Rating,
          nextPracticeMin,
          nextPracticeMax,
        } satisfies CFAnalytics;
      } catch {
        return CF_ANALYTICS_EMPTY;
      }
    }
  );
}
