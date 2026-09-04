import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalProgress } from "@/modules/goals/service";
import type { Goal, Achievement } from "@/shared/types";
import { getPersonalizedAnalytics } from "@/modules/learning/live-analytics";
import { Award, CheckCircle2 } from "lucide-react";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const analytics = await getPersonalizedAnalytics(session.user.id);
  const progress: { goals: Goal[]; achievements: Achievement[] } = await getPersonalProgress(session.user.id, analytics);
  const achievements = progress.achievements;

  return (
    <div>
      <header className="page-header">
        <p className="page-eyebrow">Personal Performance</p>
        <h1 className="page-title">Goals & Achievements</h1>
        <p className="page-description">
          Set weekly targets, track streak consistency, and unlock performance badges.
        </p>
      </header>

      <div className="dashboard-row-split">
        {/* Active Goals Section */}
        <section className="glass-card" style={{ padding: "var(--space-5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)" }}>
                Active Weekly Goals
              </h2>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>Target progress for this week</p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: "var(--text-xs)" }}>{progress.goals.length} Active</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {progress.goals.map((g: Goal) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div
                  key={g.id}
                  style={{
                    padding: "var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)" }}>{g.title}</span>
                    <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", fontWeight: 600, color: g.isCompleted ? "var(--color-easy)" : "var(--brand-primary)" }} className="tabular-nums">
                      {g.current} / {g.target} {g.unit}
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: g.isCompleted ? "var(--color-easy)" : "var(--brand-primary)",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                    <span className="tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>{pct}% complete</span>
                    {g.isCompleted && (
                      <span style={{ color: "var(--color-easy)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={11} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Achievement Badges Section */}
        <section className="glass-card" style={{ padding: "var(--space-5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)" }}>
                Achievement Badges
              </h2>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>Milestones unlocked</p>
            </div>
            <span className="badge badge-info" style={{ fontSize: "var(--text-xs)" }}>{achievements.length} Unlocked</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)" }}>
            {achievements.length ? (
              achievements.map((a: Achievement) => (
                <div
                  key={a.title}
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", background: "var(--brand-primary-muted)", display: "grid", placeItems: "center", color: "var(--brand-primary)" }}>
                    <Award size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                      {a.title}
                    </h3>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.4 }}>
                      {a.description}
                    </p>
                  </div>
                  <span className="badge badge-easy" style={{ width: "fit-content", marginTop: "auto", fontSize: "var(--text-xs)" }}>
                    <CheckCircle2 size={11} /> Unlocked
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center", padding: "var(--space-6) 0", gridColumn: "1 / -1" }}>
                Solve your first linked-platform problem to unlock badges.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
