import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getRecommendations, getStarterRecommendations } from "@/modules/recommendations/service";
import { getPersonalizedAnalytics, hasLinkedLearningSource } from "@/modules/learning/live-analytics";
import { ExternalLink } from "lucide-react";

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const [analytics, hasLinkedSource] = await Promise.all([
    getPersonalizedAnalytics(userId),
    hasLinkedLearningSource(userId),
  ]);
  const recommendations = hasLinkedSource
    ? await getRecommendations(userId, analytics)
    : getStarterRecommendations();

  return (
    <div>
      <header className="page-header">
        <p className="page-eyebrow">Algorithmic Growth Path</p>
        <h1 className="page-title">Learning Roadmap</h1>
        <p className="page-description">
          {hasLinkedSource && analytics?.totalSolved
            ? `Personalized recommendation engine active — based on ${analytics.totalSolved} solved problems.`
            : "Core NeetCode 75 foundation recommendations. Link your accounts anytime to unlock real-time recommendations."}
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {recommendations.map((item, idx) => {
          let diffBadge = "badge-easy";
          if (item.difficulty?.toLowerCase() === "medium") diffBadge = "badge-medium";
          if (item.difficulty?.toLowerCase() === "hard") diffBadge = "badge-hard";

          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: "var(--space-5)",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "var(--space-4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)", flex: 1, minWidth: 280 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border)",
                    color: "var(--text-muted)",
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
                    <span className="badge badge-primary" style={{ fontSize: "var(--text-xs)", textTransform: "capitalize" }}>{item.topic}</span>
                    <span className={`badge ${diffBadge}`} style={{ fontSize: "var(--text-xs)" }}>{item.difficulty}</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      Pattern: <span style={{ color: "var(--text-secondary)" }}>{item.pattern}</span>
                    </span>
                  </div>

                  <h3 style={{ fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    {item.problemName}
                  </h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {item.reason}
                  </p>
                </div>
              </div>

              {item.problemUrl && (
                <a
                  href={item.problemUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  id={`solve-prob-${idx}`}
                >
                  {hasLinkedSource ? "Solve Problem" : "View Problem"} <ExternalLink size={12} />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
