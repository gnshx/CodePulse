import { auth } from "@/modules/auth/config";
import { getAnalytics } from "@/modules/analytics/service";
import { prisma } from "@/shared/db/client";
import type { Profile } from "@prisma/client";
import { fetchLeetCodeProfile, fetchLeetCodeTopics } from "@/modules/leetcode/service";
import {
  fetchCodeforcesProfile,
  fetchCodeforcesAnalytics,
  type CFAnalytics,
} from "@/modules/codeforces/service";

// ─────────────────────────────────────────────
// Shared data — fetched once, passed to every component
// ─────────────────────────────────────────────

type AllData = {
  lc: Awaited<ReturnType<typeof fetchLeetCodeProfile>>;
  cf: Awaited<ReturnType<typeof fetchCodeforcesProfile>>;
  lcTopics: Record<string, number>;
  cfA: CFAnalytics;                          // full CF deep analytics
};

async function fetchAllData(
  profile: Pick<Profile, "leetcodeUsername" | "codeforcesUsername"> | null
): Promise<AllData> {
  const [lc, cf, lcTopics, cfA] = await Promise.all([
    profile?.leetcodeUsername
      ? fetchLeetCodeProfile(profile.leetcodeUsername)
      : Promise.resolve(null),
    profile?.codeforcesUsername
      ? fetchCodeforcesProfile(profile.codeforcesUsername)
      : Promise.resolve(null),
    profile?.leetcodeUsername
      ? fetchLeetCodeTopics(profile.leetcodeUsername)
      : Promise.resolve({}),
    profile?.codeforcesUsername
      ? fetchCodeforcesAnalytics(profile.codeforcesUsername)
      : Promise.resolve({
          solvedCount: 0,
          ratingDistribution: {},
          topicAvgRating: {},
          topicMaxRating: {},
          topicCounts: {},
          maxSolvedRating: 0,
          p75Rating: 0,
          nextPracticeMin: 0,
          nextPracticeMax: 0,
        } as CFAnalytics),
  ]);
  return { lc, cf, lcTopics, cfA };
}

// ─────────────────────────────────────────────
// Helper: rating colour & label
// ─────────────────────────────────────────────
function ratingColor(r: number) {
  if (r < 1200) return "#94a3b8";
  if (r < 1400) return "#10b981";
  if (r < 1600) return "#06b6d4";
  if (r < 1900) return "#3b82f6";
  if (r < 2100) return "#a855f7";
  if (r < 2400) return "#f59e0b";
  return "#ef4444";
}

function ratingLabel(r: number) {
  if (r < 1200) return "Newbie";
  if (r < 1400) return "Pupil";
  if (r < 1600) return "Specialist";
  if (r < 1900) return "Expert";
  if (r < 2100) return "Candidate Master";
  if (r < 2400) return "Master";
  return "Grandmaster";
}

// ─────────────────────────────────────────────
// Top stats row
// ─────────────────────────────────────────────

async function StatsGrid({
  userId,
  data,
}: {
  userId: string;
  data: AllData;
}) {
  const analytics = await getAnalytics(userId);
  const { lc, cf, cfA } = data;

  const lcSolved = lc?.totalSolved ?? 0;
  const cfSolved = cfA.solvedCount;
  const totalSolved = lcSolved + cfSolved || analytics?.totalSolved || 0;
  const currentStreak = analytics?.currentStreak ?? 0;
  const longestStreak = analytics?.longestStreak ?? 0;

  const statCards = [
    {
      label: "Total Solved",
      value: totalSolved || "—",
      sub: lcSolved && cfSolved ? `LC ${lcSolved} · CF ${cfSolved}` : "Cross-platform total",
      icon: "⚡",
      color: "var(--brand-primary)",
      badge: totalSolved > 0 ? "Active" : undefined,
    },
    {
      label: "LeetCode",
      value: lcSolved || "—",
      sub: lc?.rank ? `Global Rank #${lc.rank.toLocaleString()}` : "Not connected",
      icon: "🟡",
      color: "#ffa116",
      badge: lcSolved > 0 ? "Synced" : undefined,
    },
    {
      label: "Codeforces",
      value: cf?.rating ?? "—",
      sub: cf?.rating ? ratingLabel(cf.rating) : "Not connected",
      icon: "🔵",
      color: cf?.rating ? ratingColor(cf.rating) : "var(--text-muted)",
      badge: cf?.rating ? `Max ${cfA.maxSolvedRating || cf.rating}` : undefined,
    },
    {
      label: "Current Streak",
      value: currentStreak ? `${currentStreak}d` : "0d",
      sub: longestStreak ? `Personal Best: ${longestStreak}d` : "Consistency score",
      icon: "🔥",
      color: "#f59e0b",
      badge: currentStreak > 0 ? "On Fire" : undefined,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 20,
        marginBottom: 28,
      }}
    >
      {statCards.map((s) => (
        <div key={s.label} className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span className="stat-label">{s.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {s.badge && <span className="badge badge-primary">{s.badge}</span>}
              <span style={{ fontSize: "1.2rem", opacity: 0.9 }}>{s.icon}</span>
            </div>
          </div>
          <div className="stat-value" style={{ color: s.color }}>
            {s.value}
          </div>
          {s.sub && (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 8, fontWeight: 500 }}>
              {s.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Difficulty Breakdown (LeetCode)
// ─────────────────────────────────────────────

async function DifficultyBreakdown({
  userId,
  data,
}: {
  userId: string;
  data: AllData;
}) {
  const analytics = await getAnalytics(userId);
  const { lc } = data;

  let easy = analytics?.easySolved ?? 0;
  let medium = analytics?.mediumSolved ?? 0;
  let hard = analytics?.hardSolved ?? 0;

  if (!analytics && lc) {
    const total = lc.totalSolved ?? 0;
    easy = Math.round(total * 0.4);
    medium = Math.round(total * 0.45);
    hard = total - easy - medium;
  }

  const total = easy + medium + hard;
  const items = [
    { label: "Easy", value: easy, color: "var(--color-easy)", cls: "badge-easy" },
    { label: "Medium", value: medium, color: "var(--color-medium)", cls: "badge-medium" },
    { label: "Hard", value: hard, color: "var(--color-hard)", cls: "badge-hard" },
  ];

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)" }}>📈 Difficulty Distribution</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>LeetCode problem breakdown</p>
        </div>
        <span className="badge badge-info">LeetCode</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span className={`badge ${item.cls}`}>{item.label}</span>
                <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>
                  {item.value}{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "0.84rem" }}>({pct}%)</span>
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: item.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CF Rating Distribution + Recommendation
// ─────────────────────────────────────────────

function CFRatingDistribution({ cfA, cfUsername }: { cfA: CFAnalytics; cfUsername: string | null }) {
  if (!cfUsername) {
    return (
      <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.05rem" }}>🎯 CF Rating Distribution</h3>
          <span className="badge badge-medium">Disconnected</span>
        </div>
        <div style={{ textAlign: "center", padding: "36px 16px" }}>
          <p style={{ fontSize: "2rem", marginBottom: 8 }}>📊</p>
          <p style={{ color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4 }}>Codeforces Account Unlinked</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.86rem" }}>
            Add your Codeforces handle in Settings to unlock rating distributions & target recommendations.
          </p>
        </div>
      </div>
    );
  }

  const dist = cfA.ratingDistribution;
  const sortedBuckets = Object.entries(dist)
    .map(([r, c]) => [Number(r), c] as [number, number])
    .sort(([a], [b]) => a - b);

  const maxCount = Math.max(...sortedBuckets.map(([, c]) => c), 1);
  const { nextPracticeMin, nextPracticeMax, maxSolvedRating, solvedCount } = cfA;

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)" }}>🎯 CF Rating Distribution</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {solvedCount} unique solved · Peak {maxSolvedRating || "—"}
          </p>
        </div>
        <span className="badge badge-primary">Codeforces</span>
      </div>

      {nextPracticeMin > 0 && (
        <div
          style={{
            margin: "0 0 20px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--brand-glow)",
            border: "1px solid var(--bg-border-hover)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>🚀</span>
          <div>
            <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Recommended Next Target
            </p>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
              Practice{" "}
              <strong style={{ color: ratingColor(nextPracticeMin) }}>{nextPracticeMin}</strong>
              {" – "}
              <strong style={{ color: ratingColor(nextPracticeMax) }}>{nextPracticeMax}</strong>
              {" "}rated problems
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sortedBuckets.map(([bucket, count]) => {
          const pct = Math.round((count / maxCount) * 100);
          const isTarget = bucket >= nextPracticeMin && bucket <= nextPracticeMax;
          return (
            <div key={bucket}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: ratingColor(bucket),
                  }}
                >
                  {bucket}
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  {count} {isTarget && <span style={{ color: "var(--brand-accent)", fontWeight: 700 }}>← Target</span>}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: isTarget ? "var(--brand-gradient)" : ratingColor(bucket),
                  }}
                />
              </div>
            </div>
          );
        })}
        {sortedBuckets.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0", fontSize: "0.88rem" }}>
            No rated problem data found yet
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Combined Topic Mastery
// ─────────────────────────────────────────────

async function TopicMasteryCard({
  userId,
  data,
}: {
  userId: string;
  data: AllData;
}) {
  const analytics = await getAnalytics(userId);
  const topicMastery: Record<string, number> = analytics?.topicMastery ?? {};

  const { lcTopics, cfA } = data;
  const cfTopics = cfA.topicCounts;

  if (Object.keys(topicMastery).length === 0) {
    const merged: Record<string, number> = { ...lcTopics };
    for (const [topic, count] of Object.entries(cfTopics)) {
      merged[topic] = (merged[topic] ?? 0) + count;
    }
    for (const [topic, count] of Object.entries(merged)) {
      if (count === 0) topicMastery[topic] = 0;
      else if (count >= 50) topicMastery[topic] = 100;
      else topicMastery[topic] = Math.min(100, Math.round((Math.log(count + 1) / Math.log(51)) * 100));
    }
  }

  const topics = Object.entries(topicMastery)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)" }}>🧠 Topic Mastery Intelligence</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Cross-platform algorithmic proficiency</p>
        </div>
        <span className="badge badge-primary">LC + CF</span>
      </div>

      {topics.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0", fontSize: "0.9rem" }}>
          Link a profile to start tracking topic mastery
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {topics.map(([topic, score]) => {
            const fromLC = (lcTopics[topic] ?? 0) > 0;
            const fromCF = (cfTopics[topic] ?? 0) > 0;
            const avgRating = cfA.topicAvgRating[topic];

            return (
              <div key={topic}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>
                      {topic}
                    </span>
                    {fromLC && (
                      <span className="badge platform-leetcode" style={{ padding: "1px 6px", fontSize: "0.72rem" }}>
                        LC
                      </span>
                    )}
                    {fromCF && (
                      <span className="badge platform-codeforces" style={{ padding: "1px 6px", fontSize: "0.72rem" }}>
                        CF
                      </span>
                    )}
                    {avgRating && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: `${ratingColor(avgRating)}18`,
                          color: ratingColor(avgRating),
                        }}
                      >
                        ~{avgRating} avg
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--brand-secondary)" }}>{score}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${score}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Strengths & Weaknesses Insights
// ─────────────────────────────────────────────

async function InsightsCard({
  userId,
  data,
}: {
  userId: string;
  data: AllData;
}) {
  const analytics = await getAnalytics(userId);
  let weak = analytics?.weakTopics ?? [];
  let strong = analytics?.strongTopics ?? [];

  const { lcTopics, cfA } = data;
  const cfTopics = cfA.topicCounts;

  if (weak.length === 0 && strong.length === 0) {
    const merged: Record<string, number> = { ...lcTopics };
    for (const [topic, count] of Object.entries(cfTopics)) {
      merged[topic] = (merged[topic] ?? 0) + count;
    }
    const scored = Object.entries(merged).map(([topic, count]) => {
      let score = 0;
      if (count >= 50) score = 100;
      else if (count > 0) score = Math.min(100, Math.round((Math.log(count + 1) / Math.log(51)) * 100));
      return [topic, score] as const;
    });
    weak = scored.filter(([, s]) => s < 40).map(([t]) => t);
    strong = scored.filter(([, s]) => s >= 75).map(([t]) => t);
  }

  const cfTopicsByAvgRating = Object.entries(cfA.topicAvgRating)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Strengths */}
      <div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🟢 Strong Topics
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {strong.length > 0
            ? strong.slice(0, 6).map((t) => (
                <span key={t} className="badge badge-easy" style={{ textTransform: "capitalize", fontSize: "0.84rem" }}>
                  {t}
                </span>
              ))
            : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No mastered topics yet</span>}
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🔴 Focus Areas
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {weak.length > 0
            ? weak.slice(0, 6).map((t) => (
                <span key={t} className="badge badge-hard" style={{ textTransform: "capitalize", fontSize: "0.84rem" }}>
                  {t}
                </span>
              ))
            : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No weak areas identified</span>}
        </div>
      </div>

      {/* Hardest CF Topics */}
      {cfTopicsByAvgRating.length > 0 && (
        <div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            🔵 Hardest CF Topics
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cfTopicsByAvgRating.map(([topic, avg]) => (
              <div key={topic} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.88rem", textTransform: "capitalize", color: "var(--text-secondary)", fontWeight: 500 }}>
                  {topic}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: `${ratingColor(avg)}15`,
                    color: ratingColor(avg),
                  }}
                >
                  ~{avg}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target recommendation CTA */}
      {cfA.nextPracticeMin > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
          }}
        >
          <p style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 4, color: "var(--brand-accent)" }}>🎯 Practice Recommendation</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Current comfort level:{" "}
            <strong style={{ color: ratingColor(cfA.p75Rating) }}>{cfA.p75Rating}</strong> rating.
            Target range:{" "}
            <strong style={{ color: ratingColor(cfA.nextPracticeMin) }}>
              {cfA.nextPracticeMin}–{cfA.nextPracticeMax}
            </strong>.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const data = await fetchAllData(profile);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <p className="page-eyebrow">Command Center</p>
        <h1 className="page-title">
          <span>👋</span> Welcome back, {session!.user!.name?.split(" ")[0]}
        </h1>
        <p className="page-description">
          Real-time competitive programming intelligence and rating analytics.
        </p>
      </div>

      {/* Row 1: Platform stat cards */}
      <StatsGrid userId={userId} data={data} />

      {/* Row 2: LC Difficulty | CF Rating Distribution */}
      <div className="dashboard-row-2col">
        <DifficultyBreakdown userId={userId} data={data} />
        <CFRatingDistribution cfA={data.cfA} cfUsername={profile?.codeforcesUsername ?? null} />
      </div>

      {/* Row 3: Topic Mastery | Insights + Next Practice */}
      <div className="dashboard-row-split">
        <TopicMasteryCard userId={userId} data={data} />
        <InsightsCard userId={userId} data={data} />
      </div>
    </div>
  );
}
