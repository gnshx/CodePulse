import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalizedAnalytics, hasLinkedLearningSource } from "@/modules/learning/live-analytics";
import { generateAICoachInsights } from "@/modules/ai/service";
import Link from "next/link";
import { Bot, Sparkles, Brain, Calendar, Target, Lightbulb, Link2 } from "lucide-react";

export default async function AICoachPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const [analytics, hasLinkedSource] = await Promise.all([
    getPersonalizedAnalytics(userId),
    hasLinkedLearningSource(userId),
  ]);

  let coachReport = {
    summary: "We could not read solved-problem data from your linked account yet. Confirm your handles in Settings and try again in a moment.",
    weeklyPlan: ["Confirm your platform username", "Refresh this page", "Start the personalized plan once your solved problems load"],
    readinessLevel: "Waiting for linked-platform data",
    topPriority: "Verify your platform username",
    motivationalNote: "Once your account data is available, your plan will be tailored to it.",
  };

  if (process.env.OPENAI_API_KEY && analytics) {
    try {
      coachReport = await generateAICoachInsights(userId, analytics, session?.user?.name ?? undefined);
    } catch {}
  }

  return (
    <div>
      <div className="page-header">
        <p className="page-eyebrow">AI Intelligence Engine</p>
        <h1 className="page-title">
          <Bot size={24} color="var(--brand-primary)" /> AI Coach Insights
        </h1>
        <p className="page-description">
          Personalized performance assessment, target readiness level, and AI-tailored 7-day training plan.
        </p>
      </div>

      {!hasLinkedSource ? (
        <div className="glass-card max-w-2xl p-8 text-center" style={{ margin: "40px auto" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-elevated)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--brand-primary)" }}>
            <Bot size={28} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>
            Your AI Coach is ready when your accounts are linked
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: "0.95rem" }}>
            Add your LeetCode or Codeforces handle so your coach can analyze solved topics, volume, and contest ratings to build your plan.
          </p>
          <Link href="/dashboard/settings#platform-handles" className="btn btn-primary">
            Add Platform Usernames
          </Link>
        </div>
      ) : (
        <div className="dashboard-row-split">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Executive Summary */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--brand-gradient)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    boxShadow: "var(--glow-primary)",
                  }}
                >
                  <Brain size={20} />
                </div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Executive Performance Assessment
                </h2>
              </div>
              <p style={{ fontSize: "0.98rem", lineHeight: 1.65, color: "var(--text-primary)" }}>
                {coachReport.summary}
              </p>
            </div>

            {/* Recommended 7-Day Training Plan */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <Calendar size={18} color="var(--brand-accent)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  Recommended 7-Day Training Plan
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {coachReport.weeklyPlan.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: 14,
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--bg-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--brand-gradient)",
                        color: "#ffffff",
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <p style={{ fontSize: "0.94rem", color: "var(--text-primary)", paddingTop: 2 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Readiness & Advice */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Target Readiness
              </p>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--brand-accent)" }}>
                {coachReport.readinessLevel}
              </h3>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Top Focus Priority
              </p>
              <p style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--color-medium)" }}>
                {coachReport.topPriority}
              </p>
            </div>

            <div
              className="glass-card"
              style={{
                padding: 20,
                background: "var(--brand-glow)",
                border: "1px solid var(--bg-border-hover)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Lightbulb size={16} color="var(--brand-secondary)" />
                <p style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--brand-secondary)" }}>
                  Coach Strategy Tip
                </p>
              </div>
              <p style={{ fontSize: "0.92rem", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                &ldquo;{coachReport.motivationalNote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
