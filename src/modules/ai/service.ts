import OpenAI from "openai";
import { withCache, CACHE_KEYS, CACHE_TTL } from "@/shared/cache/redis";
import type { AnalyticsSummary } from "@/shared/types";

export interface AICoachResponse {
  summary: string;
  weeklyPlan: string[];
  readinessLevel: string;
  topPriority: string;
  motivationalNote: string;
}

export async function generateAICoachInsights(
  userId: string,
  analytics: AnalyticsSummary,
  userName?: string
): Promise<AICoachResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  const fallbackResponse: AICoachResponse = {
    summary: "Your progress shows strong fundamentals in basic data structures. You are ready to tackle medium-level Dynamic Programming and Graph algorithms.",
    weeklyPlan: [
      "Days 1-2: 1D Dynamic Programming & Knapsack variants",
      "Days 3-4: Breadth-First Search & Depth-First Search on 2D Grids",
      "Days 5-7: Codeforces Div. 2 Virtual Contest & Error Analysis",
    ],
    readinessLevel: "Ready for Codeforces Div. 2 B/C-level problems",
    topPriority: "Focus on 2D Dynamic Programming & memoization patterns",
    motivationalNote: "Consistency is key — keep your daily streak alive!",
  };

  if (!apiKey || apiKey.startsWith("sk-...")) {
    return fallbackResponse;
  }

  return withCache(
    CACHE_KEYS.aiCoach(userId),
    CACHE_TTL.DAY,
    async () => {
      try {
        const openai = new OpenAI({ apiKey });

        const prompt = `
You are an expert competitive programming coach. Analyze this user's coding statistics and provide personalized, actionable advice.

User: ${userName ?? "Coder"}

Statistics:
- Total Problems Solved: ${analytics.totalSolved}
- Easy: ${analytics.easySolved} | Medium: ${analytics.mediumSolved} | Hard: ${analytics.hardSolved}
- Current Streak: ${analytics.currentStreak} days
- Acceptance Rate: ${analytics.acceptanceRate}%

Topic Mastery (0-100 score):
${Object.entries(analytics.topicMastery)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)
  .map(([topic, score]) => `  - ${topic}: ${score}%`)
  .join("\n")}

Weak Topics: ${analytics.weakTopics.slice(0, 5).join(", ")}
Strong Topics: ${analytics.strongTopics.slice(0, 5).join(", ")}

Codeforces Rating: ${(analytics.platformStats as any)?.CODEFORCES?.rating ?? "Not connected"}

Respond with a JSON object with these exact keys:
{
  "summary": "2-3 sentence overall assessment",
  "weeklyPlan": ["Day 1-2: ...", "Day 3-4: ...", "Day 5-7: ..."],
  "readinessLevel": "e.g. 'Ready for Codeforces Div. 2 C-level problems'",
  "topPriority": "The single most impactful thing to work on",
  "motivationalNote": "A short, personalized motivational message"
}
`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const raw = completion.choices[0]?.message?.content ?? "{}";
        return JSON.parse(raw) as AICoachResponse;
      } catch {
        return fallbackResponse;
      }
    }
  );
}
