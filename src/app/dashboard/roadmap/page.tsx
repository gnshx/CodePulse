import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getRecommendations, getStarterRecommendations } from "@/modules/recommendations/service";
import { getPersonalizedAnalytics, hasLinkedLearningSource } from "@/modules/learning/live-analytics";

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
      <div className="page-header">
        <p className="page-eyebrow">Algorithmic Growth Path</p>
        <h1 className="page-title">
          <span>🗺️</span> Smart Learning Roadmap
        </h1>
        <p className="page-description">
          {hasLinkedSource && analytics?.totalSolved
            ? `Personalized recommendation engine active — based on ${analytics.totalSolved} solved problems across your linked platforms.`
            : "Core NeetCode 75 foundation recommendations. Link your accounts anytime to unlock real-time recommendations."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {recommendations.map((item, idx) => {
          let diffBadge = "badge-easy";
          if (item.difficulty?.toLowerCase() === "medium") diffBadge = "badge-medium";
          if (item.difficulty?.toLowerCase() === "hard") diffBadge = "badge-hard";

          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: 22,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span className="badge badge-primary">{item.topic}</span>
                  <span className={`badge ${diffBadge}`}>{item.difficulty}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    Pattern: <strong style={{ color: "var(--text-secondary)" }}>{item.pattern}</strong>
                  </span>
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                  {item.problemName}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {item.reason}
                </p>
              </div>

              {item.problemUrl && (
                <a
                  href={item.problemUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  id={`solve-prob-${idx}`}
                  style={{ alignSelf: "center" }}
                >
                  {hasLinkedSource ? "Solve Problem ↗" : "View on NeetCode ↗"}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
