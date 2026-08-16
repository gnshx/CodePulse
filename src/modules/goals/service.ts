import { prisma } from "@/shared/db/client";
import { getAnalytics } from "@/modules/analytics/service";
import type { AnalyticsSummary } from "@/shared/types";

const ACHIEVEMENTS = [
  { title: "First Solve", description: "Solved your first programming problem", icon: "🌱", threshold: 1 },
  { title: "Problem Solver", description: "Solved 25 problems across connected platforms", icon: "⚔️", threshold: 25 },
  { title: "Centurion", description: "Solved 100 problems across connected platforms", icon: "💯", threshold: 100 },
];

export async function getPersonalProgress(userId: string, currentAnalytics?: AnalyticsSummary | null) {
  const analytics = currentAnalytics ?? await getAnalytics(userId);
  const totalSolved = analytics?.totalSolved ?? 0;
  const existingGoals = await prisma.goal.findMany({ where: { userId } });

  if (existingGoals.length === 0) {
    const streak = analytics?.currentStreak ?? 0;
    const mediumSolved = analytics?.mediumSolved ?? 0;
    const targetSolved = totalSolved < 25 ? 25 : totalSolved + 25;
    await prisma.goal.createMany({ data: [
      { userId, title: "Build your problem-solving foundation", target: targetSolved, current: totalSolved, unit: "problems", isCompleted: totalSolved >= targetSolved },
      { userId, title: "Maintain a 7-day solve streak", target: 7, current: streak, unit: "days", isCompleted: streak >= 7 },
      { userId, title: "Solve medium-difficulty problems", target: 20, current: mediumSolved, unit: "problems", isCompleted: mediumSolved >= 20 },
    ] });
  }

  const existingAchievements = await prisma.achievement.findMany({
    where: { userId }, select: { title: true },
  });
  const unlockedTitles = new Set(existingAchievements.map((achievement) => achievement.title));
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (item) => totalSolved >= item.threshold && !unlockedTitles.has(item.title)
  );
  if (newlyUnlocked.length) {
    await prisma.achievement.createMany({ data: newlyUnlocked.map((item) => ({
      userId, title: item.title, description: item.description, icon: item.icon,
    })) });
  }

  const [savedGoals, achievements] = await Promise.all([
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.achievement.findMany({ where: { userId } }),
  ]);
  // Goal progress follows the latest linked-platform stats even between imports.
  const goals = savedGoals.map((goal) => {
    const current = goal.unit === "days" ? (analytics?.currentStreak ?? 0)
      : goal.title.toLowerCase().includes("medium") ? (analytics?.mediumSolved ?? 0)
      : analytics?.totalSolved ?? 0;
    return { ...goal, current, isCompleted: current >= goal.target };
  });
  return { goals, achievements };
}
