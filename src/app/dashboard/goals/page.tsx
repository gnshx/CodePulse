import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalProgress } from "@/modules/goals/service";
import type { Goal, Achievement } from "@/shared/types";
import { getPersonalizedAnalytics } from "@/modules/learning/live-analytics";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const analytics = await getPersonalizedAnalytics(session.user.id);
  const progress = await getPersonalProgress(session.user.id, analytics);
  const achievements = progress.achievements;

  return (
    <div className="dashboard-page goals-page">
      <header className="page-header">
        <p className="page-eyebrow">Personal progress</p>
        <h1 className="page-title"><span aria-hidden="true">🎯</span> Goals &amp; Badges</h1>
        <p className="page-description">
          Set personal targets, track your streaks, and unlock achievement badges
        </p>
      </header>

      <div className="goals-layout">
        {/* Goals List */}
        <section className="glass-card dashboard-card goals-card">
          <div className="card-heading">
            <div>
              <p className="card-eyebrow">This week</p>
              <h2>📌 Active Goals</h2>
            </div>
            <span className="card-count">{progress.goals.length} goals</span>
          </div>

          <div className="goal-list">
            {progress.goals.map((g: Goal) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <article key={g.id} className="goal-item">
                  <div className="goal-item-header">
                    <span className="goal-title">{g.title}</span>
                    <span className={`goal-value ${g.isCompleted ? "is-complete" : ""}`}>
                      {g.current} / {g.target} {g.unit}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: g.isCompleted ? "var(--color-easy)" : "var(--brand-gradient)",
                      }}
                    />
                  </div>
                  <div className="goal-progress-caption">
                    <span>{pct}% complete</span>
                    {g.isCompleted && <span>Completed</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Achievements */}
        <section className="glass-card dashboard-card achievements-card">
          <div className="card-heading">
            <div>
              <p className="card-eyebrow">Your collection</p>
              <h2>🎖️ Achievement Badges</h2>
            </div>
            <span className="card-count">{achievements.length} unlocked</span>
          </div>

            <div className="achievements-grid">
            {achievements.length ? achievements.map((a: Achievement) => (
              <article key={a.title} className="achievement-card is-unlocked">
                <span className="achievement-icon" aria-hidden="true">{a.icon}</span>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.description}</p>
                </div>
                <span className="achievement-status">Unlocked</span>
              </article>
            )) : <p className="text-muted">Solve your first linked-platform problem to unlock badges.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
