import axios from "axios";
import { CACHE_KEYS, CACHE_TTL, withCache } from "@/shared/cache/redis";
import type { PlatformProfile, SubmissionData } from "@/shared/types";

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
