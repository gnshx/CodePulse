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
import {
  Zap,
  Flame,
  Trophy,
  Target,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Code2,
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────
// Shared data — fetched once, passed to every component
// ─────────────────────────────────────────────

type AllData = {
  lc: Awaited<ReturnType<typeof fetchLeetCodeProfile>>;
  cf: Awaited<ReturnType<typeof fetchCodeforcesProfile>>;
  lcTopics: Record<string, number>;
  cfA: CFAnalytics;
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
  if (r < 1200) return "var(--text-muted)";
  if (r < 1400) return "var(--color-easy)";
  if (r < 1600) return "var(--color-info)";
  if (r < 1900) return "#818cf8";
  if (r < 2100) return "var(--brand-secondary)";
  if (r < 2400) return "var(--color-medium)";
  return "var(--color-hard)";
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
// Stats Grid
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
      value: totalSolved ? totalSolved.toLocaleString() : "—",
      sub: lcSolved && cfSolved ? `LC ${lcSolved} · CF ${cfSolved}` : "Cross-platform total",
      icon: <Zap size={16} />,
      accentColor: "var(--brand-primary)",
    },
    {
      label: "LeetCode",
      value: lcSolved ? lcSolved.toLocaleString() : "—",
      sub: lc?.rank ? `Rank #${lc.rank.toLocaleString()}` : "Not connected",
      icon: <Code2 size={16} />,
      accentColor: "#ffa116",
    },
    {
      label: "Codeforces",
      value: cf?.rating ? cf.rating.toLocaleString() : "—",
      sub: cf?.rating ? ratingLabel(cf.rating) : "Not connected",
      icon: <Trophy size={16} />,
      accentColor: cf?.rating ? ratingColor(cf.rating) : "var(--text-muted)",
    },
    {
      label: "Streak",
      value: currentStreak ? `${currentStreak}d` : "0d",
      sub: longestStreak ? `Best: ${longestStreak}d` : "Start solving to build a streak",
      icon: <Flame size={16} />,
      accentColor: "var(--color-medium)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "var(--space-4)",
        marginBottom: "var(--space-6)",
      }}
    >
      {statCards.map((s) => (
        <div key={s.label} className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <span className="stat-label">{s.label}</span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-elevated)",
                display: "grid",
                placeItems: "center",
                color: s.accentColor,
              }}
            >
              {s.icon}
            </div>
          </div>
          <div className="stat-value tabular-nums" style={{ color: s.accentColor }}>
            {s.value}
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-2)", fontWeight: 400 }}>
            {s.sub}
          </p>
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
    <section className="glass-card" style={{ padding: "var(--space-5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: "var(--text-h3)", color: "var(--text-primary)" }}>Difficulty Breakdown</h3>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>LeetCode problem distribution</p>
        </div>
        <span className="badge platform-leetcode">LeetCode</span>
      </div>

      {/* Segmented bar */}
      {total > 0 && (
        <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", marginBottom: "var(--space-4)", background: "var(--bg-elevated)" }}>
          {items.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            return pct > 0 ? (
              <div key={item.label} style={{ width: `${pct}%`, background: item.color, transition: "width 0.6s var(--ease-out)" }} />
            ) : null;
          })}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{item.label}</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
                {item.value} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// CF Rating Distribution + Recommendation
// ─────────────────────────────────────────────

function CFRatingDistribution({ cfA, cfUsername }: { cfA: CFAnalytics; cfUsername: string | null }) {
  if (!cfUsername) {
    return (
      <section className="glass-card" style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "var(--space-8) var(--space-4)" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-elevated)", display: "grid", placeItems: "center", margin: "0 auto var(--space-3)", color: "var(--text-muted)" }}>
            <Target size={20} />
          </div>
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "var(--text-body)", marginBottom: "var(--space-1)" }}>Codeforces not linked</p>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: 320, margin: "0 auto var(--space-4)" }}>
            Add your handle in Settings to see rating distributions and practice targets.
          </p>
          <Link href="/dashboard/settings#platform-handles" className="btn btn-secondary btn-sm">
            Link Handle
          </Link>
        </div>
      </section>
    );
  }

  const dist = cfA.ratingDistribution;
  const sortedBuckets = Object.entries(dist)
    .map(([r, c]) => [Number(r), c] as [number, number])
    .sort(([a], [b]) => a - b);

  const maxCount = Math.max(...sortedBuckets.map(([, c]) => c), 1);
  const { nextPracticeMin, nextPracticeMax, solvedCount } = cfA;

  return (
    <section className="glass-card" style={{ padding: "var(--space-5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: "var(--text-h3)", color: "var(--text-primary)" }}>Rating Distribution</h3>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{solvedCount} solved problems</p>
        </div>
        <span className="badge platform-codeforces">Codeforces</span>
      </div>

      {nextPracticeMin > 0 && (
        <div
          style={{
            margin: `0 0 var(--space-4)`,
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <TrendingUp size={14} color="var(--brand-primary)" />
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Practice target: <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-primary)" }}>{nextPracticeMin}–{nextPracticeMax}</span>
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {sortedBuckets.map(([bucket, count]) => {
          const pct = Math.round((count / maxCount) * 100);
          const isTarget = bucket >= nextPracticeMin && bucket <= nextPracticeMax;
          return (
            <div key={bucket} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", fontWeight: 500, color: ratingColor(bucket), width: 36, textAlign: "right" }}>
                {bucket}
              </span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--bg-elevated)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3,
                    background: isTarget ? "var(--brand-primary)" : ratingColor(bucket),
                    transition: "width 0.6s var(--ease-out)",
                  }}
                />
              </div>
              <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", color: "var(--text-muted)", width: 24, textAlign: "right" }}>
                {count}
              </span>
            </div>
          );
        })}
        {sortedBuckets.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-5) 0", fontSize: "var(--text-sm)" }}>
            No rated problems found yet
          </p>
        )}
      </div>
    </section>
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
    <section className="glass-card" style={{ padding: "var(--space-5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: "var(--text-h3)", color: "var(--text-primary)" }}>Topic Mastery</h3>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>Algorithmic proficiency</p>
        </div>
        <Link href="/dashboard/topics" className="btn btn-ghost btn-sm" style={{ fontSize: "var(--text-xs)" }}>
          View All <ArrowRight size={12} />
        </Link>
      </div>

      {topics.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-6) 0", fontSize: "var(--text-sm)" }}>
          Link a profile to start tracking topic mastery
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {topics.map(([topic, score]) => {
            const barColor = score >= 70 ? "var(--color-easy)" : score >= 40 ? "var(--color-medium)" : "var(--color-hard)";
            return (
              <div key={topic}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 450, color: "var(--text-primary)", textTransform: "capitalize" }}>
                    {topic}
                  </span>
                  <span style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text-secondary)" }}>
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
    </section>
  );
}

// ─────────────────────────────────────────────
// Insights — Strengths, Weaknesses, Next Move
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

  // Find top weak topic for "Next Best Move"
  const topWeakTopic = weak[0];

  return (
    <section className="glass-card" style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Next Best Move — the defining feature */}
      {topWeakTopic && (
        <div
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
            <Sparkles size={14} color="var(--brand-primary)" />
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--brand-primary)" }}>
              Next Best Move
            </span>
          </div>
          <p style={{ fontSize: "var(--text-body)", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize", marginBottom: "var(--space-1)" }}>
            {topWeakTopic}
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Your weakest area — focus here for the highest impact improvement.
          </p>
          <Link href="/dashboard/roadmap" className="btn btn-primary btn-sm" style={{ marginTop: "var(--space-3)" }}>
            Start Practice <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Strengths */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <ShieldCheck size={14} color="var(--color-easy)" />
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
            Strong Topics
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {strong.length > 0
            ? strong.slice(0, 5).map((t) => (
                <span key={t} className="badge badge-easy" style={{ textTransform: "capitalize", fontSize: "var(--text-xs)" }}>
                  {t}
                </span>
              ))
            : <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No mastered topics yet</span>}
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <Target size={14} color="var(--color-hard)" />
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
            Focus Areas
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {weak.length > 0
            ? weak.slice(0, 5).map((t) => (
                <span key={t} className="badge badge-hard" style={{ textTransform: "capitalize", fontSize: "var(--text-xs)" }}>
                  {t}
                </span>
              ))
            : <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No weak areas identified</span>}
        </div>
      </div>
    </section>
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

  const firstName = session!.user!.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Header */}
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <span className="badge badge-primary" style={{ fontSize: "var(--text-xs)", marginBottom: "var(--space-2)", display: "inline-flex" }}>
            Eat. Sleep. Code. Repeat.
          </span>
          <h1 className="page-title" style={{ gap: "var(--space-2)" }}>
            {greeting}, {firstName}
          </h1>
          <p className="page-description">
            Your competitive programming performance at a glance.
          </p>
        </div>

        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            fontSize: "var(--text-xs)",
            color: "var(--text-secondary)",
            fontStyle: "italic",
            maxWidth: 360,
          }}
        >
          &ldquo;Talk is cheap. Show me the code.&rdquo; — Linus Torvalds
        </div>
      </header>

      {/* Stats Grid */}
      <StatsGrid userId={userId} data={data} />

      {/* Difficulty + CF Rating */}
      <div className="dashboard-row-2col">
        <DifficultyBreakdown userId={userId} data={data} />
        <CFRatingDistribution cfA={data.cfA} cfUsername={profile?.codeforcesUsername ?? null} />
      </div>

      {/* Topic Mastery + Insights */}
      <div className="dashboard-row-split">
        <TopicMasteryCard userId={userId} data={data} />
        <InsightsCard userId={userId} data={data} />
      </div>
    </div>
  );
}
