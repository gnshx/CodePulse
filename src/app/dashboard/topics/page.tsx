import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalizedAnalytics, hasLinkedLearningSource } from "@/modules/learning/live-analytics";
import Link from "next/link";
import { Link2, RefreshCw, CheckCircle2, AlertTriangle, Flame } from "lucide-react";

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
      <header className="page-header">
        <p className="page-eyebrow">Intelligence</p>
        <h1 className="page-title">Topic Mastery</h1>
        <p className="page-description">
          Algorithmic proficiency metrics dynamically computed from your connected coding accounts.
        </p>
      </header>

      {!hasLinkedSource ? (
        <section className="glass-card" style={{ maxWidth: 560, margin: "var(--space-10) auto", padding: "var(--space-8)", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", display: "grid", placeItems: "center", margin: "0 auto var(--space-4)", color: "var(--brand-primary)" }}>
            <Link2 size={20} />
          </div>
          <h2 style={{ fontSize: "var(--text-h2)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
            Link your coding accounts
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
            Connect LeetCode or Codeforces in Settings to enable real-time topic mastery analysis and focus area detection.
          </p>
          <Link href="/dashboard/settings#platform-handles" className="btn btn-primary">
            Connect Platforms
          </Link>
        </section>
      ) : topicEntries.length === 0 ? (
        <section className="glass-card" style={{ maxWidth: 560, margin: "var(--space-10) auto", padding: "var(--space-8)", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", display: "grid", placeItems: "center", margin: "0 auto var(--space-4)", color: "var(--brand-accent)" }}>
            <RefreshCw size={20} className="animate-spin" />
          </div>
          <h2 style={{ fontWeight: 600, fontSize: "var(--text-h2)", color: "var(--text-primary)" }}>Syncing Account Data</h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "var(--space-2)", maxWidth: 420, marginInline: "auto" }}>
            Problem history is syncing from your connected handles. Refresh in a few moments to view your topic breakdown.
          </p>
        </section>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
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

            const barColor = score >= 70 ? "var(--color-easy)" : score >= 40 ? "var(--color-medium)" : "var(--color-hard)";

            return (
              <div key={topic} className="glass-card" style={{ padding: "var(--space-5)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                  <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>
                    {topic}
                  </h3>
                  <span className={`badge ${badgeCls}`} style={{ fontSize: "var(--text-xs)" }}>
                    <StatusIcon size={11} /> {statusText}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>Mastery Index</span>
                  <span style={{ fontSize: "var(--text-h2)", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }} className="tabular-nums">
                    {score}%
                  </span>
                </div>

                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${score}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
