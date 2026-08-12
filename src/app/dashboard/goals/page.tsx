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
    <div>
      <div className="mb-8">
        <h1 className="mb-1.5 text-3xl font-extrabold">🎯 Goals & Badges</h1>
        <p className="text-secondary">
          Set personal targets, track your streaks, and unlock achievement badges
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Goals List */}
        <div className="glass-card p-7">
          <h2 className="mb-5 text-lg font-bold">
            📌 Active Goals
          </h2>

          <div className="flex flex-col gap-5">
            {DUMMY_GOALS.map((g) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex justify-between text-[0.9rem]">
                    <span className="font-semibold">{g.title}</span>
                    <span className="font-bold text-brand-secondary">
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card p-7">
          <h2 className="mb-5 text-lg font-bold">
            🎖️ Achievement Badges
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((a, i) => (
              <div
                key={i}
                className={`rounded-[var(--radius-md)] border p-4 transition-all ${
                  a.unlocked
                    ? "border-brand-primary/30 bg-elevated"
                    : "border-[var(--bg-border)] bg-[var(--bg-base)] opacity-50"
                }`}
              >
                <span className="mb-2 block text-3xl">{a.icon}</span>
                <p className="mb-1 text-[0.9rem] font-bold">{a.title}</p>
                <p className="text-[0.75rem] text-muted">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
