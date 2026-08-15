import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { prisma } from "@/shared/db/client";
import { fetchCodeforcesRatingHistory } from "@/modules/codeforces/service";

export default async function ContestsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const cfHistory = profile?.codeforcesUsername ? await fetchCodeforcesRatingHistory(profile.codeforcesUsername) : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1.5 text-3xl font-extrabold">🏆 Contest Performance</h1>
        <p className="text-secondary">
          Rating trajectory and performance logs from live coding contests
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="glass-card p-7">
          <h2 className="mb-5 text-lg font-bold">
            📈 Rating History (Codeforces)
          </h2>
          {cfHistory.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <p className="mb-2 text-[2rem]">📊</p>
              <p>No contest history found or Codeforces account not linked.</p>
              <a
                href="/dashboard/settings"
                className="mt-2 inline-block text-[1rem] text-brand-accent transition-colors hover:text-brand-secondary"
              >
                Link Codeforces Username ↗
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cfHistory.slice(0, 8).map((c: any) => (
                <div
                  key={c.contestId}
                  className="flex items-center justify-between rounded-[var(--radius-md)] bg-elevated px-4 py-3 transition-colors hover:bg-hover"
                >
                  <div>
                    <p className="text-[1rem] font-semibold">{c.contestName}</p>
                    <p className="text-[0.88rem] text-muted">Rank: #{c.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-codeforces">{c.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-7">
          <h2 className="mb-5 text-lg font-bold">
            ✨ Highlights
          </h2>
          <div className="flex flex-col gap-4">
            <div className="rounded-[var(--radius-md)] border border-brand-primary/20 bg-brand-primary/10 p-4">
              <p className="text-[0.9rem] text-muted">Peak Rating</p>
              <p className="text-[1.6rem] font-extrabold text-brand-secondary">
                {cfHistory.length > 0 ? Math.max(...cfHistory.map((c: any) => c.rating)) : "—"}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-brand-accent/20 bg-brand-accent/10 p-4">
              <p className="text-[0.9rem] text-muted">Contests Attended</p>
              <p className="text-[1.6rem] font-extrabold text-brand-accent">
                {cfHistory.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
