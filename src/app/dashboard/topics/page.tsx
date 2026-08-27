import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalizedAnalytics, hasLinkedLearningSource } from "@/modules/learning/live-analytics";
import Link from "next/link";
import { Brain, Link2, RefreshCw, CheckCircle2, AlertTriangle, Flame } from "lucide-react";

export default async function TopicsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const [analytics, hasLinkedSource] = await Promise.all([
    getPersonalizedAnalytics(userId),
    hasLinkedLearningSource(userId),
  ]);

  const topicEntries = Object.entries(analytics?.topicMastery ?? {}).sort(([, a], [, b]) => b - a);

  return (
    <div>
      <div className="page-header">
        <p className="page-eyebrow">Intelligence</p>
        <h1 className="page-title">
          <Brain size={24} color="var(--brand-secondary)" /> Topic Mastery Analysis
        </h1>
        <p className="page-description">
          Algorithmic proficiency metrics dynamically computed from your connected coding accounts.
        </p>
      </div>

      {!hasLinkedSource ? (
        <div className="glass-card max-w-2xl p-8 text-center" style={{ margin: "40px auto" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-elevated)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--brand-primary)" }}>
            <Link2 size={28} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>
            Link your coding accounts to unlock topic intelligence
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: "0.95rem" }}>
            Connect LeetCode or Codeforces in Settings so we can analyze solved problems, mastery levels, and focus areas.
          </p>
          <Link href="/dashboard/settings#platform-handles" className="btn btn-primary">
            Connect Platform Handles
          </Link>
        </div>
      ) : topicEntries.length === 0 ? (
        <div className="glass-card max-w-2xl p-8 text-center" style={{ margin: "40px auto", color: "var(--text-secondary)" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-elevated)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--brand-accent)" }}>
            <RefreshCw size={28} className="animate-spin" />
          </div>
          <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>Data Syncing In Progress</p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: 6, maxWidth: 460, marginInline: "auto" }}>
            We could not find solved-problem topic data for this account yet. Verify your handles in Settings or wait a moment for the sync to complete.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {topicEntries.map(([topic, score]) => {
            let badgeCls = "badge-easy";
            let statusText = "Mastered";
            let StatusIcon = CheckCircle2;
            if (score < 40) {
              badgeCls = "badge-hard";
              statusText = "Needs Practice";
              StatusIcon = AlertTriangle;
            } else if (score < 70) {
              badgeCls = "badge-medium";
              statusText = "Developing";
              StatusIcon = Flame;
            }

            return (
              <div key={topic} className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", textTransform: "capitalize" }}>
                    {topic}
                  </h3>
                  <span className={`badge ${badgeCls}`}>
                    <StatusIcon size={12} /> {statusText}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.84rem", color: "var(--text-muted)", fontWeight: 600 }}>Mastery Index</span>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--brand-secondary)" }} className="tabular-nums">{score}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${score}%`,
                      background:
                        score >= 70
                          ? "var(--color-easy)"
                          : score >= 40
                          ? "var(--color-medium)"
                          : "var(--color-hard)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
