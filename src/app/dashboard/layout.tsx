import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { Metadata } from "next";
import {
  LayoutDashboard,
  Layers,
  Brain,
  Trophy,
  Map,
  Bot,
  Target,
  Settings,
  LogOut,
  Swords,
  Activity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | CodePulse Intelligence",
  description: "Production-style Competitive Programming Intelligence & Analytics Dashboard.",
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
    { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Overview" },
    { href: "/dashboard/platforms", icon: <Layers size={18} />, label: "Platforms" },
    { href: "/dashboard/topics", icon: <Brain size={18} />, label: "Topics" },
    { href: "/dashboard/contests", icon: <Trophy size={18} />, label: "Contests" },
    { href: "/dashboard/roadmap", icon: <Map size={18} />, label: "Roadmap" },
    { href: "/dashboard/ai-coach", icon: <Bot size={18} />, label: "AI Coach" },
    { href: "/dashboard/goals", icon: <Target size={18} />, label: "Goals" },
    { href: "/dashboard/settings", icon: <Settings size={18} />, label: "Settings" },
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
              color: "#ffffff",
              boxShadow: "var(--glow-primary)",
            }}
          >
            <Swords size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
            Code<span className="gradient-text">Pulse</span>
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "2px 8px",
              borderRadius: 99,
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              fontSize: "0.74rem",
              fontWeight: 700,
              color: "var(--color-easy)",
              marginLeft: 4,
            }}
          >
            <div className="pulse-dot" />
            Live Sync
          </div>
        </div>

        <div className="dashboard-navbar-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 12px 4px 6px",
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
          <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Intelligence Suite
          </p>
        </div>

        <SidebarNav items={navItems} />

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--bg-border)" }}>
          <form action={async () => { "use server"; const { signOut } = await import("@/modules/auth/config"); await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="sidebar-item" id="nav-signout-btn" style={{ color: "var(--color-hard)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20 }}>
                <LogOut size={16} />
              </span>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">{children}</main>
    </>
  );
}
