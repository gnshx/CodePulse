import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalizedAnalytics } from "@/modules/learning/live-analytics";
import { generateAICoachInsights } from "@/modules/ai/service";

export default async function AICoachPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const analytics = await getPersonalizedAnalytics(userId);

  // Fallback / Default AI report if OpenAI key is not set or empty
  let coachReport = {
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

  if (process.env.OPENAI_API_KEY && analytics) {
    try {
      coachReport = await generateAICoachInsights(userId, analytics, session?.user?.name ?? undefined);
    } catch {}
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1.5 text-3xl font-extrabold">🤖 AI Coach Insights</h1>
        <p className="text-secondary">
          Personalized assessment and AI-generated weekly training roadmap
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Executive Summary */}
          <div className="glass-card p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[2rem]">🧠</span>
              <h2 className="text-xl font-bold">Executive Assessment</h2>
            </div>
            <p className="text-[1.05rem] leading-relaxed text-primary">
              {coachReport.summary}
            </p>
          </div>

          {/* Weekly Plan */}
          <div className="glass-card p-7">
            <h2 className="mb-5 text-lg font-bold">
              📅 Recommended 7-Day Training Plan
            </h2>
            <div className="flex flex-col gap-3.5">
              {coachReport.weeklyPlan.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 rounded-[var(--radius-md)] bg-elevated p-4 transition-colors hover:bg-hover"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gradient)] text-[0.95rem] font-extrabold">
                    {i + 1}
                  </div>
                  <p className="pt-0.5 text-[1rem] text-primary">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6">
            <p className="mb-2 text-[0.9rem] text-muted">Target Readiness</p>
            <h3 className="text-lg font-extrabold text-brand-accent">
              {coachReport.readinessLevel}
            </h3>
          </div>

          <div className="glass-card p-6">
            <p className="mb-2 text-[0.9rem] text-muted">Top Focus Priority</p>
            <p className="text-[1rem] font-semibold text-medium">
              {coachReport.topPriority}
            </p>
          </div>

          <div className="glass-card bg-[linear-gradient(135deg,rgba(108,99,255,0.15),rgba(167,139,250,0.05))] p-6">
            <p className="mb-2 text-[0.9rem] font-bold text-brand-secondary">💡 Coach Advice</p>
            <p className="text-[1rem] italic text-secondary">
              &ldquo;{coachReport.motivationalNote}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
