import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { prisma } from "@/shared/db/client";
import { fetchCodeforcesRatingHistory } from "@/modules/codeforces/service";
import Link from "next/link";

type ContestRating = {
  contestName: string;
  contestId: string;
  rating: number;
  rank: number;
  recordedAt: Date;
};

function getRatingBadgeColor(r: number) {
  if (r < 1200) return "#94a3b8";
  if (r < 1400) return "#10b981";
  if (r < 1600) return "#06b6d4";
  if (r < 1900) return "#3b82f6";
  if (r < 2100) return "#a855f7";
  if (r < 2400) return "#f59e0b";
  return "#ef4444";
}

export default async function ContestsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const cfHistory: ContestRating[] = profile?.codeforcesUsername
    ? await fetchCodeforcesRatingHistory(profile.codeforcesUsername)
    : [];

  const peakRating = cfHistory.length > 0 ? Math.max(...cfHistory.map((c) => c.rating)) : null;

  return (
    <div>
      <div className="page-header">
        <p className="page-eyebrow">Performance Tracking</p>
        <h1 className="page-title">
          <span>🏆</span> Contest Performance
        </h1>
        <p className="page-description">
          Rating history, rank progress, and contest logs from live competitive programming contests.
        </p>
      </div>

      <div className="dashboard-row-split">
        {/* Rating History List */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                📈 Codeforces Rating Logs
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Recent contest rating changes</p>
            </div>
            <span className="badge platform-codeforces">Codeforces</span>
          </div>

          {cfHistory.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <p style={{ fontSize: "2rem", marginBottom: 8 }}>📊</p>
              <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>No contest history found</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.86rem", marginBottom: 16, marginTop: 4 }}>
                Link your Codeforces handle to load past contest ratings and ranks.
              </p>
              <Link href="/dashboard/settings#platform-handles" className="btn btn-secondary btn-sm">
                Link Codeforces Handle ↗
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cfHistory.slice(0, 10).map((c) => {
                const color = getRatingBadgeColor(c.rating);
                return (
                  <div
                    key={c.contestId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--bg-border)",
                      transition: "border-color 0.2s ease",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "0.94rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {c.contestName}
                      </p>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Rank: <strong style={{ color: "var(--text-secondary)" }}>#{c.rank.toLocaleString()}</strong>
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 800,
                          color: color,
                        }}
                      >
                        {c.rating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contest Highlights Sidebar */}
        <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            ✨ Contest Highlights
          </h2>

          <div
            style={{
              padding: 20,
              borderRadius: "var(--radius-md)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--bg-border-hover)",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Peak Rating
            </p>
            <p style={{ fontSize: "2.2rem", fontWeight: 900, color: peakRating ? getRatingBadgeColor(peakRating) : "var(--text-muted)" }}>
              {peakRating ?? "—"}
            </p>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: "var(--radius-md)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--bg-border)",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Contests Participated
            </p>
            <p style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--brand-accent)" }}>
              {cfHistory.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
