import { auth } from "@/modules/auth/config";
import { getAnalytics } from "@/modules/analytics/service";
import { prisma } from "@/shared/db/client";

// ─────────────────────────────────────────────
// Server Components for each section
// ─────────────────────────────────────────────

async function StatsGrid({ userId }: { userId: string }) {
  const analytics = await getAnalytics(userId);

  const stats = analytics
    ? [
        { label: "Total Solved", value: analytics.totalSolved, icon: "✅", color: "var(--brand-primary)" },
        { label: "Current Streak", value: `${analytics.currentStreak}d`, icon: "🔥", color: "#f59e0b" },
        { label: "Acceptance Rate", value: `${analytics.acceptanceRate}%`, icon: "🎯", color: "var(--color-easy)" },
        { label: "Longest Streak", value: `${analytics.longestStreak}d`, icon: "⚡", color: "var(--brand-accent)" },
      ]
    : [
        { label: "Total Solved", value: "—", icon: "✅", color: "var(--brand-primary)" },
        { label: "Current Streak", value: "—", icon: "🔥", color: "#f59e0b" },
        { label: "Acceptance Rate", value: "—", icon: "🎯", color: "var(--color-easy)" },
        { label: "Longest Streak", value: "—", icon: "⚡", color: "var(--brand-accent)" },
      ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
        marginBottom: 32,
      }}
    >
      {stats.map((s) => (
        <div key={s.label} className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 500, marginBottom: 8 }}>
                {s.label}
              </p>
              <p style={{ fontSize: "2.2rem", fontWeight: 900, color: s.color }}>
                {s.value}
              </p>
            </div>
            <span style={{ fontSize: "1.8rem" }}>{s.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

async function DifficultyBreakdown({ userId }: { userId: string }) {
  const analytics = await getAnalytics(userId);
  const total = analytics?.totalSolved ?? 0;

  const items = [
    { label: "Easy", value: analytics?.easySolved ?? 0, color: "var(--color-easy)", cls: "badge-easy" },
    { label: "Medium", value: analytics?.mediumSolved ?? 0, color: "var(--color-medium)", cls: "badge-medium" },
    { label: "Hard", value: analytics?.hardSolved ?? 0, color: "var(--color-hard)", cls: "badge-hard" },
  ];

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: "1rem" }}>
        📈 Difficulty Breakdown
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`badge ${item.cls}`}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 700 }}>{item.value} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span></span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function TopicMasteryCard({ userId }: { userId: string }) {
  const analytics = await getAnalytics(userId);
  const topics = Object.entries(analytics?.topicMastery ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: "1rem" }}>
        🧠 Topic Mastery
      </h3>
      {topics.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
          Connect a platform to see topic mastery
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {topics.map(([topic, score]) => (
            <div key={topic}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>{topic}</span>
                <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>{score}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function WeakAreasCard({ userId }: { userId: string }) {
  const analytics = await getAnalytics(userId);
  const weak = analytics?.weakTopics ?? [];
  const strong = analytics?.strongTopics ?? [];

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: "1rem" }}>
        ⚡ Strengths & Weaknesses
      </h3>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🟢 Strong Topics
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {strong.length > 0 ? strong.slice(0, 5).map((t) => (
            <span key={t} style={{ padding: "4px 10px", borderRadius: 99, background: "rgba(34, 197, 94, 0.1)", color: "var(--color-easy)", fontSize: "0.8rem", fontWeight: 500 }}>
              {t}
            </span>
          )) : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No data yet</span>}
        </div>
      </div>

      <div>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🔴 Focus Areas
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {weak.length > 0 ? weak.slice(0, 5).map((t) => (
            <span key={t} style={{ padding: "4px 10px", borderRadius: 99, background: "rgba(239, 68, 68, 0.1)", color: "var(--color-hard)", fontSize: "0.8rem", fontWeight: 500 }}>
              {t}
            </span>
          )) : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No data yet</span>}
        </div>
      </div>
    </div>
  );
}

async function PlatformCards({ userId }: { userId: string }) {
  const profile = await prisma.profile.findUnique({ where: { userId } });

  const platforms = [
    { key: "leetcodeUsername", name: "LeetCode", color: "#ffa116", icon: "🟡" },
    { key: "codeforcesUsername", name: "Codeforces", color: "#1a83f2", icon: "🔵" },
    { key: "gfgUsername", name: "GeeksforGeeks", color: "#2ba94b", icon: "🟢" },
    { key: "codechefUsername", name: "CodeChef", color: "#d4a574", icon: "🍴" },
  ] as const;

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>🔗 Connected Platforms</h3>
        <a href="/dashboard/settings" className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: "0.82rem" }} id="dashboard-add-platform-btn">
          + Add Platform
        </a>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {platforms.map((p) => {
          const username = profile?.[p.key as keyof typeof profile] as string | null;
          return (
            <div
              key={p.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
                border: username ? `1px solid ${p.color}30` : "1px solid var(--bg-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem" }}>{p.icon}</span>
                <div>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>{p.name}</p>
                  {username && (
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>@{username}</p>
                  )}
                </div>
              </div>
              {username ? (
                <span style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: 99, background: "rgba(34, 197, 94, 0.1)", color: "var(--color-easy)", fontWeight: 600 }}>
                  Connected
                </span>
              ) : (
                <span style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: 99, background: "var(--bg-hover)", color: "var(--text-muted)", fontWeight: 600 }}>
                  Not Connected
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>
          👋 Welcome back, {session!.user!.name?.split(" ")[0]}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Here's your competitive programming overview
        </p>
      </div>

      {/* Stats Grid */}
      <StatsGrid userId={userId} />

      {/* Middle Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <DifficultyBreakdown userId={userId} />
        <WeakAreasCard userId={userId} />
      </div>

      {/* Bottom Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}
      >
        <TopicMasteryCard userId={userId} />
        <PlatformCards userId={userId} />
      </div>
    </div>
  );
}
