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
  Activity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | BetterCP",
  description: "Competitive Programming Intelligence & Analytics Dashboard.",
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
    { href: "/dashboard", icon: <LayoutDashboard size={16} />, label: "Overview" },
    { href: "/dashboard/platforms", icon: <Layers size={16} />, label: "Platforms" },
    { href: "/dashboard/topics", icon: <Brain size={16} />, label: "Topics" },
    { href: "/dashboard/contests", icon: <Trophy size={16} />, label: "Contests" },
    { href: "/dashboard/roadmap", icon: <Map size={16} />, label: "Roadmap" },
    { href: "/dashboard/ai-coach", icon: <Bot size={16} />, label: "AI Coach" },
    { href: "/dashboard/goals", icon: <Target size={16} />, label: "Goals" },
    { href: "/dashboard/settings", icon: <Settings size={16} />, label: "Settings" },
  ];

  return (
    <>
      {/* Subtle background */}
      <div className="bg-mesh" />

      {/* ── Navbar ── */}
      <nav className="navbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--brand-gradient)",
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            <Activity size={14} />
          </div>
          <span style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
            Better<span style={{ color: "var(--brand-primary)" }}>CP</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px 4px 4px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--bg-border)",
              cursor: "pointer",
            }}
          >
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="avatar"
                style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--brand-gradient)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <span className="dashboard-user-name" style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-secondary)" }}>
              {session.user.name}
            </span>
          </div>
          <MobileNav items={navItems} />
        </div>
      </nav>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div style={{ marginBottom: 8, padding: "0 12px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Navigation
          </p>
        </div>

        <SidebarNav items={navItems} />

        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--bg-border)" }}>
          <form action={async () => { "use server"; const { signOut } = await import("@/modules/auth/config"); await signOut({ redirectTo: "/" }); }}>
            <button type="submit" className="sidebar-item" id="nav-signout-btn" style={{ color: "var(--color-hard)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
                <LogOut size={14} />
              </span>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">{children}</main>
    </>
  );
}
