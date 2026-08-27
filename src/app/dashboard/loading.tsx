export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ width: 120, height: 16 }} />
        <div className="skeleton" style={{ width: 280, height: 32 }} />
        <div className="skeleton" style={{ width: 380, height: 18 }} />
      </div>

      {/* KPI grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="skeleton" style={{ width: 80, height: 14 }} />
              <div className="skeleton" style={{ width: 24, height: 24, borderRadius: "50%" }} />
            </div>
            <div className="skeleton" style={{ width: 120, height: 38 }} />
            <div className="skeleton" style={{ width: 140, height: 14 }} />
          </div>
        ))}
      </div>

      {/* 2-col content skeleton */}
      <div className="dashboard-row-2col">
        <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skeleton" style={{ width: 160, height: 22 }} />
          <div className="skeleton" style={{ width: "100%", height: 140 }} />
        </div>
        <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skeleton" style={{ width: 180, height: 22 }} />
          <div className="skeleton" style={{ width: "100%", height: 140 }} />
        </div>
      </div>
    </div>
  );
}
