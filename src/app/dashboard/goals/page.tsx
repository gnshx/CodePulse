import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";

const DUMMY_GOALS = [
  { id: "1", title: "Solve 50 Dynamic Programming Problems", target: 50, current: 28, unit: "problems", isCompleted: false },
  { id: "2", title: "Maintain a 14-Day Solve Streak", target: 14, current: 7, unit: "days", isCompleted: false },
  { id: "3", title: "Reach 1400 Rating on Codeforces", target: 1400, current: 1250, unit: "rating", isCompleted: false },
  { id: "4", title: "Solve 100 Medium Difficulty Problems", target: 100, current: 100, unit: "problems", isCompleted: true },
];

const ACHIEVEMENTS = [
  { icon: "🔥", title: "Streak Master", desc: "Maintained a 7-day problem solving streak", unlocked: true },
  { icon: "⚔️", title: "Problem Solver", desc: "Solved over 100 problems across platforms", unlocked: true },
  { icon: "🧩", title: "Graph Explorer", desc: "Solved 25 Graph & Tree problems", unlocked: true },
  { icon: "🏆", title: "Contest Ready", desc: "Participated in your first live contest", unlocked: false },
];

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

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
            <span className="card-count">{DUMMY_GOALS.length} goals</span>
          </div>

          <div className="goal-list">
            {DUMMY_GOALS.map((g) => {
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
            <span className="card-count">{ACHIEVEMENTS.filter((item) => item.unlocked).length} unlocked</span>
          </div>

          <div className="achievements-grid">
            {ACHIEVEMENTS.map((a) => (
              <article key={a.title} className={`achievement-card ${a.unlocked ? "is-unlocked" : "is-locked"}`}>
                <span className="achievement-icon" aria-hidden="true">{a.icon}</span>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
                <span className="achievement-status">{a.unlocked ? "Unlocked" : "Locked"}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
