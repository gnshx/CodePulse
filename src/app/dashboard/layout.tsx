import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your competitive programming analytics dashboard.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const navItems = [
    { href: "/dashboard", icon: "📊", label: "Overview" },
    { href: "/dashboard/platforms", icon: "🔗", label: "Platforms" },
    { href: "/dashboard/topics", icon: "🧩", label: "Topics" },
    { href: "/dashboard/contests", icon: "🏆", label: "Contests" },
    { href: "/dashboard/roadmap", icon: "🗺️", label: "Roadmap" },
    { href: "/dashboard/ai-coach", icon: "🤖", label: "AI Coach" },
    { href: "/dashboard/goals", icon: "🎯", label: "Goals" },
    { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="navbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--brand-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ⚔
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>
            Better<span className="gradient-text">CP</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {session.user.name}
          </span>
          {session.user.image && (
            <img
              src={session.user.image}
              alt="avatar"
              style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid var(--bg-border)" }}
            />
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: 8, padding: "0 8px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Navigation
          </p>
        </div>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className="sidebar-item" id={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
            <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
            {item.label}
          </a>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--bg-border)" }}>
          <form action={async () => { "use server"; const { signOut } = await import("@/modules/auth/config"); await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="sidebar-item" id="nav-signout-btn" style={{ color: "var(--color-hard)" }}>
              <span>🚪</span> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">{children}</main>
    </>
  );
}
