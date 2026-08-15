import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { getRecommendations } from "@/modules/recommendations/service";

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;
  const recommendations = await getRecommendations(userId);

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1.5 text-3xl font-extrabold">🗺️ Smart Learning Roadmap</h1>
        <p className="text-secondary">
          Tailored problem set based on your weak topics & prerequisite concept patterns
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {recommendations.map((item, idx) => (
          <div
            key={idx}
            className="glass-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2.5">
                <span className="badge badge-primary">{item.topic}</span>
                <span className={`badge badge-${item.difficulty?.toLowerCase()}`}>{item.difficulty}</span>
                <span className="text-[0.9rem] text-muted">Pattern: {item.pattern}</span>
              </div>
              <h3 className="mb-1 text-lg font-bold">{item.problemName}</h3>
              <p className="text-[0.95rem] text-secondary">{item.reason}</p>
            </div>

            {item.problemUrl && (
              <a
                href={item.problemUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary shrink-0 px-5 py-2.5"
                id={`solve-prob-${idx}`}
              >
                Solve ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
