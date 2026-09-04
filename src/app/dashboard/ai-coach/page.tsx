import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalizedAnalytics, hasLinkedLearningSource } from "@/modules/learning/live-analytics";
import { generateAICoachInsights } from "@/modules/ai/service";
import Link from "next/link";
import { Bot, Lightbulb } from "lucide-react";

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
      <header className="page-header">
        <p className="page-eyebrow">AI Intelligence Engine</p>
        <h1 className="page-title">AI Coach Insights</h1>
        <p className="page-description">
          Personalized performance assessment, target readiness level, and AI-tailored 7-day training plan.
        </p>
      </header>

      {!hasLinkedSource ? (
        <section className="glass-card" style={{ maxWidth: 560, margin: "var(--space-10) auto", padding: "var(--space-8)", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", display: "grid", placeItems: "center", margin: "0 auto var(--space-4)", color: "var(--brand-primary)" }}>
            <Bot size={20} />
          </div>
          <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
            AI Coach is ready
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
            Add your LeetCode or Codeforces handle so your coach can analyze solved topics, volume, and contest ratings.
          </p>
          <Link href="/dashboard/settings#platform-handles" className="btn btn-primary">
            Add Handles
          </Link>
        </section>
      ) : (
        <div className="dashboard-row-split">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {/* Executive Summary */}
            <section className="glass-card" style={{ padding: "var(--space-5)" }}>
              <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
                Performance Assessment
              </h2>
              <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.65, color: "var(--text-secondary)" }}>
                {coachReport.summary}
              </p>
            </section>

            {/* 7-Day Plan */}
            <section className="glass-card" style={{ padding: "var(--space-5)" }}>
              <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-4)" }}>
                Recommended 7-Day Plan
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {coachReport.weeklyPlan.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-3)",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--bg-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--brand-primary)",
                        color: "#ffffff",
                        fontSize: "var(--text-xs)",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </div>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Readiness & Advice */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="glass-card" style={{ padding: "var(--space-5)" }}>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-1)" }}>
                Target Readiness
              </p>
              <h3 style={{ fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--brand-accent)" }}>
                {coachReport.readinessLevel}
              </h3>
            </div>

            <div className="glass-card" style={{ padding: "var(--space-5)" }}>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-1)" }}>
                Top Focus Priority
              </p>
              <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-medium)" }}>
                {coachReport.topPriority}
              </p>
            </div>

            <div className="glass-card" style={{ padding: "var(--space-5)", background: "var(--brand-glow)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                <Lightbulb size={14} color="var(--brand-primary)" />
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Coach Tip
                </span>
              </div>
              <p style={{ fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                &ldquo;{coachReport.motivationalNote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
