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

function personalizedFallback(analytics: AnalyticsSummary, userName?: string): AICoachResponse {
  const focus = analytics.weakTopics[0] ?? "core problem-solving patterns";
  const nextFocus = analytics.weakTopics[1] ?? "implementation accuracy";
  const rating = analytics.platformStats.CODEFORCES?.rating;
  const volume = analytics.totalSolved;
  return {
    summary: `${userName ?? "Your"} profile shows ${volume} solved problems. Your next biggest opportunity is ${focus}; build consistency there before increasing difficulty.`,
    weeklyPlan: [
      `Days 1–2: solve 3 ${focus} problems and write down the pattern used.`,
      `Days 3–4: solve 3 ${nextFocus} problems one level above your comfort zone.`,
      "Days 5–7: review missed solutions, repeat one problem without help, then take a timed virtual contest.",
    ],
    readinessLevel: rating ? `Build from your current Codeforces rating of ${rating}` : `Build from ${volume} solved problems`,
    topPriority: `Turn ${focus} into a reliable pattern through deliberate practice.`,
    motivationalNote: "Small daily reviews compound into contest-level strength.",
  };
}

export async function generateAICoachInsights(
  userId: string,
  analytics: AnalyticsSummary,
  userName?: string
): Promise<AICoachResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  const fallbackResponse = personalizedFallback(analytics, userName);

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

Codeforces Rating: ${analytics.platformStats.CODEFORCES?.rating ?? "Not connected"}

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
