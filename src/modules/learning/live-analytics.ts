import { prisma } from "@/shared/db/client";
import { fetchLeetCodeProfile, fetchLeetCodeTopics } from "@/modules/leetcode/service";
import { fetchCodeforcesAnalytics, fetchCodeforcesProfile } from "@/modules/codeforces/service";
import type { AnalyticsSummary } from "@/shared/types";

function masteryFromSolved(solved: number) {
  if (solved <= 0) return 0;
  return Math.min(100, Math.round((Math.log(solved + 1) / Math.log(51)) * 100));
}

/**
 * A fresh, user-specific view of the public platform data.  This deliberately
 * lives alongside persisted analytics: new accounts get useful values as soon
 * as a handle is saved, before the background import has completed.
 */
export async function getLiveAnalytics(userId: string): Promise<AnalyticsSummary | null> {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return null;

  const [leetcode, leetcodeTopics, codeforces, codeforcesAnalytics] = await Promise.all([
    profile.leetcodeUsername ? fetchLeetCodeProfile(profile.leetcodeUsername) : Promise.resolve(null),
    profile.leetcodeUsername ? fetchLeetCodeTopics(profile.leetcodeUsername) : Promise.resolve({}),
    profile.codeforcesUsername ? fetchCodeforcesProfile(profile.codeforcesUsername) : Promise.resolve(null),
    profile.codeforcesUsername ? fetchCodeforcesAnalytics(profile.codeforcesUsername) : Promise.resolve(null),
  ]);

  const topicCounts: Record<string, number> = { ...leetcodeTopics };
  for (const [topic, count] of Object.entries(codeforcesAnalytics?.topicCounts ?? {})) {
    topicCounts[topic] = (topicCounts[topic] ?? 0) + count;
  }

  const topicMastery = Object.fromEntries(
    Object.entries(topicCounts).map(([topic, count]) => [topic, masteryFromSolved(count)])
  );
  const sortedTopics = Object.entries(topicMastery).sort(([, left], [, right]) => left - right);
  const totalSolved = (leetcode?.totalSolved ?? 0) + (codeforcesAnalytics?.solvedCount ?? 0);

  return {
    totalSolved,
    // LeetCode's public profile endpoint does not expose its per-difficulty
    // totals; do not invent them. Persisted imports fill these when available.
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    currentStreak: 0,
    longestStreak: 0,
    acceptanceRate: 0,
    topicMastery,
    weakTopics: sortedTopics.filter(([, score]) => score < 40).map(([topic]) => topic),
    strongTopics: sortedTopics.filter(([, score]) => score >= 75).map(([topic]) => topic),
    platformStats: {
      LEETCODE: { solved: leetcode?.totalSolved ?? 0 },
      CODEFORCES: { solved: codeforcesAnalytics?.solvedCount ?? 0, rating: codeforces?.rating },
      CODECHEF: { solved: 0 },
      GFG: { solved: 0 },
      ATCODER: { solved: 0 },
    },
  };
}

export async function getPersonalizedAnalytics(userId: string) {
  const { getAnalytics } = await import("@/modules/analytics/service");
  const [stored, live] = await Promise.all([getAnalytics(userId), getLiveAnalytics(userId)]);

  // Prefer live platform figures whenever a handle supplies them; retain
  // imported streak/difficulty history where it is richer.
  if (!live || live.totalSolved === 0) return stored;
  return {
    ...live,
    easySolved: stored?.easySolved ?? live.easySolved,
    mediumSolved: stored?.mediumSolved ?? live.mediumSolved,
    hardSolved: stored?.hardSolved ?? live.hardSolved,
    currentStreak: stored?.currentStreak ?? 0,
    longestStreak: stored?.longestStreak ?? 0,
    acceptanceRate: stored?.acceptanceRate ?? 0,
  };
}
