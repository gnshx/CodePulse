import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Better CP",
  description: "Your competitive programming intelligence & analytics dashboard.",
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
      {/* Background Glow Mesh */}
      <div className="bg-mesh" />

      {/* Navbar */}
      <nav className="navbar dashboard-navbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--brand-gradient)",
              display: "grid",
              placeItems: "center",
              fontSize: 16,
              boxShadow: "var(--glow-primary)",
            }}
          >
            ⚔
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
            Better<span className="gradient-text">CP</span>
          </span>
        </div>

        <div className="dashboard-navbar-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 10px 4px 6px",
              borderRadius: 999,
              background: "var(--bg-elevated)",
              border: "1px solid var(--bg-border)",
            }}
          >
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="avatar"
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--brand-gradient)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <span className="dashboard-user-name" style={{ fontSize: "0.88rem", fontWeight: 700 }}>
              {session.user.name}
            </span>
          </div>
          <MobileNav items={navItems} />
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="sidebar dashboard-sidebar">
        <div style={{ marginBottom: 12, padding: "0 8px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.76rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Platform Navigation
          </p>
        </div>

        <SidebarNav items={navItems} />

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--bg-border)" }}>
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
