import { prisma } from "@/shared/db/client";
import { CACHE_KEYS, CACHE_TTL, withCache, redis } from "@/shared/cache/redis";
import type { AnalyticsSummary } from "@/shared/types";

// ─────────────────────────────────────────────
// Topic Score Calculation
// ─────────────────────────────────────────────

function calcTopicScore(solved: number): number {
  // Logarithmic scale: 0-100
  if (solved === 0) return 0;
  if (solved >= 50) return 100;
  return Math.min(100, Math.round((Math.log(solved + 1) / Math.log(51)) * 100));
}

// ─────────────────────────────────────────────
// Core Analytics Engine
// ─────────────────────────────────────────────

export async function computeAnalytics(userId: string): Promise<AnalyticsSummary | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      submissions: { include: { problem: true } },
      ratings: { orderBy: { recordedAt: "desc" } },
    },
  });

  if (!profile) return null;

  const accepted = profile.submissions.filter((s) => s.status === "Accepted");

  // ── Difficulty breakdown ──
  let easy = 0, medium = 0, hard = 0;
  const seenProblems = new Set<string>();

  for (const sub of accepted) {
    if (seenProblems.has(sub.problemId)) continue;
    seenProblems.add(sub.problemId);

    switch (sub.problem.difficulty) {
      case "EASY":   easy++;   break;
      case "MEDIUM": medium++; break;
      case "HARD":   hard++;   break;
    }
  }

  // ── Topic mastery ──
  const topicCounts: Record<string, number> = {};
  for (const sub of accepted) {
    for (const topic of sub.problem.topics) {
      topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
    }
  }

  const topicMastery: Record<string, number> = {};
  for (const [topic, count] of Object.entries(topicCounts)) {
    topicMastery[topic] = calcTopicScore(count);
  }

  // ── Weak / Strong classification ──
  const topics = Object.entries(topicMastery);
  const weakTopics = topics.filter(([, s]) => s < 40).map(([t]) => t);
  const strongTopics = topics.filter(([, s]) => s >= 75).map(([t]) => t);

  // ── Streak calculation ──
  const dailyStats = await prisma.dailyStats.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  let currentStreak = 0, longestStreak = 0, streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dailyStats.length; i++) {
    const stat = dailyStats[i];
    const statDate = new Date(stat.date);
    statDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - statDate.getTime()) / 86400000);
    if (diffDays === i && stat.solved > 0) {
      streak++;
      if (i === 0 || i === 1) currentStreak = streak;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  // ── Acceptance rate ──
  const totalAttempted = new Set(profile.submissions.map((s) => s.problemId)).size;
  const acceptanceRate = totalAttempted > 0 ? (seenProblems.size / totalAttempted) * 100 : 0;

  // ── Platform stats ──
  const platformStats: Record<string, { solved: number; rating?: number }> = {};
  for (const sub of accepted) {
    const p = sub.problem.platform;
    if (!platformStats[p]) platformStats[p] = { solved: 0 };
    if (!seenProblems.has(`${p}:${sub.problemId}`)) {
      platformStats[p].solved++;
    }
  }

  for (const rating of profile.ratings) {
    if (!platformStats[rating.platform]) {
      platformStats[rating.platform] = { solved: 0 };
    }
    platformStats[rating.platform].rating = rating.rating;
  }

  const summary: AnalyticsSummary = {
    totalSolved: seenProblems.size,
    easySolved: easy,
    mediumSolved: medium,
    hardSolved: hard,
    currentStreak,
    longestStreak,
    acceptanceRate: Math.round(acceptanceRate * 10) / 10,
    topicMastery,
    weakTopics,
    strongTopics,
    platformStats: platformStats as AnalyticsSummary["platformStats"],
    lastActiveDate: dailyStats[0]?.date,
  };

  // Persist to DB
  await prisma.analytics.upsert({
    where: { profileId: profile.id },
    update: {
      totalSolved: summary.totalSolved,
      easySolved: summary.easySolved,
      mediumSolved: summary.mediumSolved,
      hardSolved: summary.hardSolved,
      topicMastery: summary.topicMastery,
      platformStats: summary.platformStats,
      weakTopics: summary.weakTopics,
      strongTopics: summary.strongTopics,
      currentStreak: summary.currentStreak,
      longestStreak: summary.longestStreak,
      acceptanceRate: summary.acceptanceRate,
      lastActiveDate: summary.lastActiveDate,
      lastComputedAt: new Date(),
    },
    create: {
      profileId: profile.id,
      totalSolved: summary.totalSolved,
      easySolved: summary.easySolved,
      mediumSolved: summary.mediumSolved,
      hardSolved: summary.hardSolved,
      topicMastery: summary.topicMastery,
      platformStats: summary.platformStats,
      weakTopics: summary.weakTopics,
      strongTopics: summary.strongTopics,
      currentStreak: summary.currentStreak,
      longestStreak: summary.longestStreak,
      acceptanceRate: summary.acceptanceRate,
      lastActiveDate: summary.lastActiveDate,
    },
  });

  // Invalidate cache
  if (redis) {
    await redis.del(CACHE_KEYS.userAnalytics(userId));
  }

  return summary;
}

export async function getAnalytics(userId: string): Promise<AnalyticsSummary | null> {
  return withCache(
    CACHE_KEYS.userAnalytics(userId),
    CACHE_TTL.MEDIUM,
    async () => {
      const analytics = await prisma.analytics.findFirst({
        where: { profile: { userId } },
      });
      if (!analytics) return null;

      return {
        totalSolved: analytics.totalSolved,
        easySolved: analytics.easySolved,
        mediumSolved: analytics.mediumSolved,
        hardSolved: analytics.hardSolved,
        currentStreak: analytics.currentStreak,
        longestStreak: analytics.longestStreak,
        acceptanceRate: analytics.acceptanceRate,
        topicMastery: analytics.topicMastery as Record<string, number>,
        weakTopics: analytics.weakTopics,
        strongTopics: analytics.strongTopics,
        platformStats: analytics.platformStats as AnalyticsSummary["platformStats"],
        lastActiveDate: analytics.lastActiveDate ?? undefined,
      };
    }
  );
}
