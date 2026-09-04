import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { prisma } from "@/shared/db/client";
import { fetchCodeforcesRatingHistory } from "@/modules/codeforces/service";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

type ContestRating = {
  contestName: string;
  contestId: string;
  rating: number;
  rank: number;
  recordedAt: Date;
};

function getRatingBadgeColor(r: number) {
  if (r < 1200) return "var(--text-muted)";
  if (r < 1400) return "var(--color-easy)";
  if (r < 1600) return "var(--color-info)";
  if (r < 1900) return "var(--brand-primary)";
  if (r < 2100) return "var(--brand-secondary)";
  if (r < 2400) return "var(--color-medium)";
  return "var(--color-hard)";
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
      <header className="page-header">
        <p className="page-eyebrow">Performance Tracking</p>
        <h1 className="page-title">Contest Performance</h1>
        <p className="page-description">
          Rating history, rank progress, and contest logs from live competitive programming contests.
        </p>
      </header>

      <div className="dashboard-row-split">
        {/* Rating History List */}
        <section className="glass-card" style={{ padding: "var(--space-5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)" }}>
                Codeforces Rating Logs
              </h2>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>Recent contest rating changes</p>
            </div>
            <span className="badge platform-codeforces">Codeforces</span>
          </div>

          {cfHistory.length === 0 ? (
            <div style={{ padding: "var(--space-8) var(--space-4)", textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", display: "grid", placeItems: "center", margin: "0 auto var(--space-3)", color: "var(--text-muted)" }}>
                <AlertCircle size={20} />
              </div>
              <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "var(--text-body)" }}>No contest history found</p>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)", marginTop: 4 }}>
                Link your Codeforces handle to load past contest ratings and ranks.
              </p>
              <Link href="/dashboard/settings#platform-handles" className="btn btn-secondary btn-sm">
                Link Codeforces Handle
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {cfHistory.slice(0, 10).map((c) => {
                const color = getRatingBadgeColor(c.rating);
                return (
                  <div
                    key={c.contestId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--bg-border)",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
                        {c.contestName}
                      </p>
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        Rank #{c.rank.toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "var(--text-h3)",
                          fontWeight: 700,
                          color: color,
                          fontFamily: "var(--font-mono)",
                        }}
                        className="tabular-nums"
                      >
                        {c.rating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Highlights Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="glass-card" style={{ padding: "var(--space-5)" }}>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
              Peak Rating
            </p>
            <p style={{ fontSize: "var(--text-metric)", fontWeight: 700, fontFamily: "var(--font-mono)", color: peakRating ? getRatingBadgeColor(peakRating) : "var(--text-muted)" }} className="tabular-nums">
              {peakRating ?? "—"}
            </p>
          </div>

          <div className="glass-card" style={{ padding: "var(--space-5)" }}>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
              Contests Participated
            </p>
            <p style={{ fontSize: "var(--text-metric)", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }} className="tabular-nums">
              {cfHistory.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
