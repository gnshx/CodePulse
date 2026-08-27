import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalProgress } from "@/modules/goals/service";
import type { Goal, Achievement } from "@/shared/types";
import { getPersonalizedAnalytics } from "@/modules/learning/live-analytics";
import { Target, Award, CheckCircle2, Flame, Zap, ShieldCheck } from "lucide-react";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const analytics = await getPersonalizedAnalytics(session.user.id);
  const progress: { goals: Goal[]; achievements: Achievement[] } = await getPersonalProgress(session.user.id, analytics);
  const achievements = progress.achievements;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <p className="page-eyebrow">Personal Performance</p>
        <h1 className="page-title">
          <Target size={24} color="var(--brand-primary)" /> Goals &amp; Achievements
        </h1>
        <p className="page-description">
          Set weekly targets, track streak consistency, and unlock performance badges.
        </p>
      </header>

      <div className="dashboard-row-split">
        {/* Active Goals Section */}
        <section className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Active Weekly Goals
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Target progress for this week</p>
            </div>
            <span className="badge badge-primary">{progress.goals.length} Goals</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {progress.goals.map((g: Goal) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div
                  key={g.id}
                  style={{
                    padding: 16,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{g.title}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 800, color: g.isCompleted ? "var(--color-easy)" : "var(--brand-secondary)" }} className="tabular-nums">
                      {g.current} / {g.target} {g.unit}
                    </span>
                  </div>

                  <div className="progress-bar" style={{ height: 8 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: g.isCompleted ? "var(--color-easy)" : "var(--brand-gradient)",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>
                    <span className="tabular-nums">{pct}% complete</span>
                    {g.isCompleted && (
                      <span style={{ color: "var(--color-easy)", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Achievement Badges Section */}
        <section className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Achievement Badges
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Milestones unlocked</p>
            </div>
            <span className="badge badge-info">{achievements.length} Unlocked</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {achievements.length ? (
              achievements.map((a: Achievement) => (
                <div
                  key={a.title}
                  style={{
                    padding: 16,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border-hover)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand-glow)", display: "grid", placeItems: "center", color: "var(--brand-primary)" }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                      {a.title}
                    </h3>
                    <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {a.description}
                    </p>
                  </div>
                  <span className="badge badge-easy" style={{ width: "fit-content", marginTop: "auto" }}>
                    <CheckCircle2 size={12} /> Unlocked
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "30px 0", gridColumn: "1 / -1" }}>
                Solve your first linked-platform problem to unlock badges.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
