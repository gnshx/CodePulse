import { inngest } from "@/lib/inngest";
import { prisma } from "@/shared/db/client";

export async function triggerPlatformSync(userId: string) {
  await prisma.refreshLog.create({
    data: {
      userId,
      platform: "LEETCODE",
      status: "pending",
      startedAt: new Date(),
    },
  });

  await inngest.send({
    name: "platform/refresh.requested",
    data: { userId },
  });
}

export async function getSyncStatus(userId: string) {
  return prisma.refreshLog.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: 10,
  });
}
