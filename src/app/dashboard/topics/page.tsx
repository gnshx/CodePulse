import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getPersonalizedAnalytics } from "@/modules/learning/live-analytics";
import { hasLinkedLearningSource } from "@/modules/learning/live-analytics";
import Link from "next/link";

export default async function TopicsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const [analytics, hasLinkedSource] = await Promise.all([
    getPersonalizedAnalytics(userId),
    hasLinkedLearningSource(userId),
  ]);

  const topicEntries = Object.entries(analytics?.topicMastery ?? {}).sort(([, a], [, b]) => b - a);

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1.5 text-3xl font-extrabold">🧩 Topic Mastery Analysis</h1>
        <p className="text-secondary">
          Detailed proficiency scores calculated from your solved problems across platforms
        </p>
      </div>

      {!hasLinkedSource ? (
        <div className="glass-card max-w-2xl p-8 text-center">
          <p className="mb-3 text-4xl">🔗</p>
          <h2 className="mb-2 text-xl font-bold">Link your coding accounts to unlock topic analysis</h2>
          <p className="mb-6 text-secondary">
            Add your LeetCode or Codeforces username and we&apos;ll calculate your covered topics, strengths, and focus areas from your solved problems.
          </p>
          <Link href="/dashboard/settings#platform-handles" className="btn btn-primary">
            Add platform usernames
          </Link>
        </div>
      ) : topicEntries.length === 0 ? (
        <div className="glass-card max-w-2xl p-8 text-center text-secondary">
          We could not find solved-problem topic data for this account yet. Check the username in Settings and try again shortly.
        </div>
      ) : <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {topicEntries.map(([topic, score]) => {
          let badgeCls = "badge-easy";
          let statusText = "Mastered";
          if (score < 40) { badgeCls = "badge-hard"; statusText = "Needs Practice"; }
          else if (score < 70) { badgeCls = "badge-medium"; statusText = "Developing"; }

          return (
            <div key={topic} className="glass-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[1.05rem] font-bold">{topic}</h3>
                <span className={`badge ${badgeCls}`}>{statusText}</span>
              </div>

              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[0.95rem] text-muted">Mastery Score</span>
                <span className="text-[1.4rem] font-extrabold text-brand-secondary">{score}%</span>
              </div>

              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
