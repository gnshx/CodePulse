import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { refreshAllPlatforms, dailyRefreshCron } from "@/jobs/platform-refresh";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [refreshAllPlatforms, dailyRefreshCron],
});
