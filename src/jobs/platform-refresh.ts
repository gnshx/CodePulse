import { inngest } from "@/lib/inngest";
import { prisma } from "@/shared/db/client";
import { fetchLeetCodeProfile, fetchLeetCodeSubmissions, fetchLeetCodeTopics } from "@/modules/leetcode/service";
import { fetchCodeforcesProfile, fetchCodeforcesSubmissions, fetchCodeforcesRatingHistory } from "@/modules/codeforces/service";
import { computeAnalytics } from "@/modules/analytics/service";

// ─────────────────────────────────────────────
// Refresh All Platforms for a User
// ─────────────────────────────────────────────
export const refreshAllPlatforms = inngest.createFunction(
  {
    id: "refresh-all-platforms",
    name: "Refresh All Platform Data",
    concurrency: { limit: 5 },
    retries: 2,
  },
  { event: "platform/refresh.requested" },
  async ({ event, step }) => {
    const { userId } = event.data;

    const profile = await step.run("fetch-profile", async () => {
      return prisma.profile.findUnique({ where: { userId } });
    });

    if (!profile) throw new Error(`Profile not found for user ${userId}`);

    // Run platform fetches in parallel steps
    const results = await Promise.allSettled([
      profile.leetcodeUsername
        ? step.run("fetch-leetcode", async () => {
            await fetchLeetCodeProfile(profile.leetcodeUsername!);
            await fetchLeetCodeTopics(profile.leetcodeUsername!);
            await fetchLeetCodeSubmissions(profile.leetcodeUsername!);
          })
        : Promise.resolve(),

      profile.codeforcesUsername
        ? step.run("fetch-codeforces", async () => {
            await fetchCodeforcesProfile(profile.codeforcesUsername!);
            await fetchCodeforcesSubmissions(profile.codeforcesUsername!);
            await fetchCodeforcesRatingHistory(profile.codeforcesUsername!);
          })
        : Promise.resolve(),
    ]);

    // Recompute analytics
    await step.run("compute-analytics", async () => {
      await computeAnalytics(userId);
    });

    await step.run("log-completion", async () => {
      await prisma.refreshLog.updateMany({
        where: { userId, status: "pending" },
        data: { status: "success", endedAt: new Date() },
      });
    });

    return { success: true, results: results.length };
  }
);

// ─────────────────────────────────────────────
// Daily Scheduled Refresh (Cron)
// ─────────────────────────────────────────────
export const dailyRefreshCron = inngest.createFunction(
  { id: "daily-refresh-cron", name: "Daily Data Refresh (2 AM)" },
  { cron: "0 2 * * *" },
  async ({ step }) => {
    const users = await step.run("get-active-users", async () => {
      return prisma.user.findMany({
        where: { profile: { isNot: null } },
        select: { id: true },
        take: 500,
      });
    });

    // Fan out refresh events
    for (const user of users) {
      await step.sendEvent(`refresh-user-${user.id}`, {
        name: "platform/refresh.requested",
        data: { userId: user.id },
      });
    }

    return { dispatched: users.length };
  }
);
