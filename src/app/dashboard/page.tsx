import { auth } from "@/modules/auth/config";
import { getAnalytics } from "@/modules/analytics/service";
import { prisma } from "@/shared/db/client";
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

async function fetchAllData(profile: any): Promise<AllData> {
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
// Helper: rating colour
// ─────────────────────────────────────────────
function ratingColor(r: number) {
  if (r < 1200) return "#808080";
  if (r < 1400) return "#008000";
  if (r < 1600) return "#03a89e";
  if (r < 1900) return "#0000ff";
  if (r < 2100) return "#aa00aa";
  if (r < 2400) return "#ff8c00";
  return "#ff0000";
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
  const cfSolved = cfA.solvedCount;                        // from deep analytics, deduplicated
  // Linked profiles are the source of truth between background imports.
  const totalSolved = lcSolved + cfSolved || analytics?.totalSolved || 0;
  const currentStreak = analytics?.currentStreak ?? 0;
  const longestStreak = analytics?.longestStreak ?? 0;

  const statCards = [
    {
      label: "Total Solved",
      value: totalSolved || "—",
      sub: lcSolved && cfSolved ? `LC ${lcSolved} + CF ${cfSolved}` : undefined,
      icon: "✅",
      color: "var(--brand-primary)",
    },
    {
      label: "LeetCode",
      value: lcSolved || "—",
      sub: lc?.rank ? `Rank ${lc.rank}` : "Not connected",
      icon: "🟡",
      color: "#ffa116",
    },
    {
      label: "Codeforces",
      value: cf?.rating ?? "—",
      sub: cf?.rating ? ratingLabel(cf.rating) : "Not connected",
      icon: "🔵",
      color: cf?.rating ? ratingColor(cf.rating) : "var(--text-muted)",
    },
    {
      label: "Streak",
      value: currentStreak ? `${currentStreak}d` : "—",
      sub: longestStreak ? `Best: ${longestStreak}d` : undefined,
      icon: "🔥",
      color: "#f59e0b",
    },
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
      {statCards.map((s) => (
        <div key={s.label} className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600, marginBottom: 6 }}>
                {s.label}
              </p>
              <p style={{ fontSize: "2rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>
                {s.value}
              </p>
              {s.sub && (
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: 6 }}>{s.sub}</p>
              )}
            </div>
            <span style={{ fontSize: "1.8rem" }}>{s.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Difficulty Breakdown  (LeetCode only, approximated)
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
    <div className="glass-card" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>📈 Difficulty Breakdown</h3>
        <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>LeetCode</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className={`badge ${item.cls}`}>{item.label}</span>
                <span style={{ fontWeight: 700 }}>
                  {item.value}{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span>
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
// CF Rating Distribution  +  Next Practice Recommendation
// ─────────────────────────────────────────────

function CFRatingDistribution({ cfA, cfUsername }: { cfA: CFAnalytics; cfUsername: string | null }) {
  if (!cfUsername) {
    return (
      <div className="glass-card" style={{ padding: 28 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>🎯 CF Rating Distribution</h3>
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "32px 0", fontSize: "0.9rem" }}>
          Connect Codeforces to see your rating breakdown
        </p>
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
    <div className="glass-card" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>🎯 CF Rating Distribution</h3>
        <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
          {solvedCount} unique solved · max {maxSolvedRating}
        </span>
      </div>

      {/* Next-practice banner */}
      {nextPracticeMin > 0 && (
        <div
          style={{
            margin: "14px 0 20px",
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,255,0.08))",
            border: "1px solid rgba(108,99,255,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🚀</span>
          <div>
            <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Recommended Next Target
            </p>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              Practice{" "}
              <strong style={{ color: ratingColor(nextPracticeMin) }}>{nextPracticeMin}</strong>
              {" – "}
              <strong style={{ color: ratingColor(nextPracticeMax) }}>{nextPracticeMax}</strong>
              {" "}rated problems (Div 2 B/C range)
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    color: ratingColor(bucket),
                    minWidth: 44,
                  }}
                >
                  {bucket}
                </span>
                <span style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
                  {count} {isTarget && "← target"}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: isTarget
                      ? "linear-gradient(90deg, var(--brand-primary), var(--brand-accent))"
                      : ratingColor(bucket),
                    opacity: isTarget ? 1 : 0.7,
                  }}
                />
              </div>
            </div>
          );
        })}
        {sortedBuckets.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0", fontSize: "0.9rem" }}>
            No rated problem data found yet
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Combined Topic Mastery  (LC + CF, with CF avg-rating tag)
// ─────────────────────────────────────────────

async function TopicMasteryCard({
  userId,
  data,
}: {
  userId: string;
  data: AllData;
}) {
  const analytics = await getAnalytics(userId);
  let topicMastery: Record<string, number> = analytics?.topicMastery ?? {};

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
    .slice(0, 10);

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>🧠 Topic Mastery</h3>
        <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>Combined LC + CF</span>
      </div>

      {topics.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
          Connect a platform to see topic mastery
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {topics.map(([topic, score]) => {
            const fromLC = (lcTopics[topic] ?? 0) > 0;
            const fromCF = (cfTopics[topic] ?? 0) > 0;
            const avgRating = cfA.topicAvgRating[topic];
            const maxRating = cfA.topicMaxRating[topic];

            return (
              <div key={topic}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  {/* Left: name + platform tags + CF rating badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.96rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                      {topic}
                    </span>
                    {fromLC && (
                      <span style={{ fontSize: "0.76rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(255,161,22,0.15)", color: "#c66a00" }}>
                        LC
                      </span>
                    )}
                    {fromCF && (
                      <span style={{ fontSize: "0.76rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(26,131,242,0.15)", color: "#1769c2" }}>
                        CF
                      </span>
                    )}
                    {avgRating && (
                      <span
                        style={{
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: `${ratingColor(avgRating)}18`,
                          color: ratingColor(avgRating),
                        }}
                        title={`Max solved: ${maxRating}`}
                      >
                        ~{avgRating} avg
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, flexShrink: 0 }}>{score}%</span>
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
// Strengths & Weaknesses  +  CF next-practice insight
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

  // Top CF topics by avg rating (for "deep" insight)
  const cfTopicsByAvgRating = Object.entries(cfA.topicAvgRating)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="glass-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Strengths */}
      <div>
        <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🟢 Strong Topics
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {strong.length > 0
            ? strong.slice(0, 6).map((t) => (
                <span key={t} style={{ padding: "5px 11px", borderRadius: 99, background: "rgba(34,197,94,0.1)", color: "var(--color-easy)", fontSize: "0.9rem", fontWeight: 600, textTransform: "capitalize" }}>
                  {t}
                </span>
              ))
            : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No data yet</span>}
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🔴 Focus Areas
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {weak.length > 0
            ? weak.slice(0, 6).map((t) => (
                <span key={t} style={{ padding: "5px 11px", borderRadius: 99, background: "rgba(239,68,68,0.1)", color: "var(--color-hard)", fontSize: "0.9rem", fontWeight: 600, textTransform: "capitalize" }}>
                  {t}
                </span>
              ))
            : <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No data yet</span>}
        </div>
      </div>

      {/* CF topic difficulty insight */}
      {cfTopicsByAvgRating.length > 0 && (
        <div>
          <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginBottom: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🔵 Your Hardest CF Topics
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cfTopicsByAvgRating.map(([topic, avg]) => (
              <div key={topic} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.92rem", textTransform: "capitalize", color: "var(--text-secondary)" }}>
                  {topic}
                </span>
                <span
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: `${ratingColor(avg)}18`,
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

      {/* Next Practice CTA */}
      {cfA.nextPracticeMin > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(108,99,255,0.08)",
            border: "1px solid rgba(108,99,255,0.2)",
          }}
        >
          <p style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 4 }}>🎯 Next Practice Target</p>
          <p style={{ fontSize: "0.94rem", color: "var(--text-secondary)" }}>
            You're comfortable up to{" "}
            <strong style={{ color: ratingColor(cfA.p75Rating) }}>{cfA.p75Rating}</strong>.
            Push to{" "}
            <strong style={{ color: ratingColor(cfA.nextPracticeMin) }}>
              {cfA.nextPracticeMin}–{cfA.nextPracticeMax}
            </strong>{" "}
            rated problems to level up.
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

  // One shared fetch — all components read from this
  const data = await fetchAllData(profile);

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

      {/* Row 1: Platform stat cards */}
      <StatsGrid userId={userId} data={data} />

      {/* Row 2: LC Difficulty  |  CF Rating Distribution */}
      <div className="dashboard-row-2col">
        <DifficultyBreakdown userId={userId} data={data} />
        <CFRatingDistribution cfA={data.cfA} cfUsername={profile?.codeforcesUsername ?? null} />
      </div>

      {/* Row 3: Topic Mastery  |  Insights + Next Practice */}
      <div className="dashboard-row-split">
        <TopicMasteryCard userId={userId} data={data} />
        <InsightsCard userId={userId} data={data} />
      </div>
    </div>
  );
}
