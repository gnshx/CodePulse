import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { OAuthProviders } from "@/components/auth/oauth-providers";
import { isGitHubAuthEnabled, isGoogleAuthEnabled } from "@/modules/auth/config";
import {
  Zap,
  Bot,
  Brain,
  Flame,
  TrendingUp,
  Target,
  Swords,
  Code2,
  Trophy,
  Globe,
  Terminal,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Zap size={22} color="var(--brand-primary)" />,
    title: "Multi-Platform Sync",
    desc: "Connect LeetCode, Codeforces, CodeChef, and GFG. Track all your progress in one unified intelligence dashboard.",
  },
  {
    icon: <Bot size={22} color="var(--brand-accent)" />,
    title: "AI Coach Insights",
    desc: "Get personalized weekly study plans, readiness assessments, and target recommendations tailored to your rating trajectory.",
  },
  {
    icon: <Brain size={22} color="var(--brand-secondary)" />,
    title: "Topic Mastery Index",
    desc: "See your mastery score for every topic — Arrays, Dynamic Programming, Graphs, Math, and data structures.",
  },
  {
    icon: <Flame size={22} color="#f59e0b" />,
    title: "Consistency & Streaks",
    desc: "Stay consistent with daily goals, streak metrics, and milestone achievement badges.",
  },
  {
    icon: <TrendingUp size={22} color="#38bdf8" />,
    title: "Contest Analytics",
    desc: "Track your Codeforces rating growth, rank trends, and contest performance history over time.",
  },
  {
    icon: <Target size={22} color="var(--color-easy)" />,
    title: "Smart Roadmap",
    desc: "Problem recommendations based on your weak topics and target rating range.",
  },
];

const PLATFORMS = [
  { name: "LeetCode", color: "#ffa116", icon: <Code2 size={14} color="#ffa116" /> },
  { name: "Codeforces", color: "#1a83f2", icon: <Trophy size={14} color="#1a83f2" /> },
  { name: "CodeChef", color: "#d4a574", icon: <Globe size={14} color="#d4a574" /> },
  { name: "GeeksforGeeks", color: "#2ba94b", icon: <Terminal size={14} color="#2ba94b" /> },
];

const STATS = [
  { value: "10K+", label: "Problems Tracked" },
  { value: "4", label: "Connected Platforms" },
  { value: "AI", label: "Intelligence Engine" },
  { value: "Free", label: "Forever for Coders" },
];

export default async function LandingPage() {
  const showGoogleAuth = isGoogleAuthEnabled;
  const showGitHubAuth = isGitHubAuthEnabled;
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div className="bg-mesh" />

      {/* ── Navbar ── */}
      <nav className="navbar" style={{ justifyContent: "space-between" }}>
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
            Better<span className="gradient-text">CP</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost" id="nav-login-btn">
            Sign In
          </Link>
          <Link href="/login" className="btn btn-primary" id="nav-get-started-btn">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="badge badge-primary animate-fade-up"
          style={{ marginBottom: 24, fontSize: "0.86rem", padding: "6px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Zap size={14} color="var(--brand-primary)" /> Competitive Programming & Algorithm Intelligence Platform
        </div>

        <h1
          className="animate-fade-up"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.8rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 860,
            animationDelay: "0.1s",
          }}
        >
          Level Up Your{" "}
          <span className="gradient-text">Competitive</span>
          <br />
          Programming Journey
        </h1>

        <p
          className="animate-fade-up"
          style={{
            marginTop: 24,
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: 640,
            lineHeight: 1.7,
            animationDelay: "0.2s",
          }}
        >
          Track progress across LeetCode, Codeforces, CodeChef & GFG in real-time.
          Unlock AI coaching, target rating insights, and topic mastery.
        </p>

        <div
          className="animate-fade-up"
          style={{
            marginTop: 36,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.3s",
            maxWidth: 520,
          }}
        >
          <Link href="/login" className="btn btn-primary btn-lg" id="hero-cta-btn">
            Start Tracking Free <ArrowRight size={18} />
          </Link>
          <Link href="#features" className="btn btn-secondary btn-lg" id="hero-features-btn">
            Explore Features →
          </Link>
        </div>

        {(showGoogleAuth || showGitHubAuth) && (
          <div
            className="animate-fade-up"
            style={{ marginTop: 20, width: "100%", maxWidth: 360, animationDelay: "0.35s" }}
          >
            <OAuthProviders
              googleEnabled={showGoogleAuth}
              githubEnabled={showGitHubAuth}
              dividerLabel={null}
            />
          </div>
        )}

        {/* Platform Chips */}
        <div
          className="animate-fade-up"
          style={{
            marginTop: 56,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            animationDelay: "0.4s",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: 600 }}>
            Unified tracking for your favorite platforms
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {PLATFORMS.map((p) => (
              <div
                key={p.name}
                style={{
                  padding: "8px 18px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--bg-border)",
                  background: "var(--bg-card)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: p.color + "20",
                    border: `1px solid ${p.color}50`,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {p.icon}
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className="glass-card animate-fade-up"
          style={{
            marginTop: 56,
            padding: "24px 48px",
            display: "flex",
            gap: 48,
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.5s",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                className="gradient-text tabular-nums"
                style={{ fontSize: "2rem", fontWeight: 900 }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="page-eyebrow" style={{ textAlign: "center" }}>Built for Coders</p>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Everything you need to <span className="gradient-text">dominate</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginTop: 8, maxWidth: 580, marginInline: "auto" }}>
              Deep rating analytics, problem recommendations, and topic insights engineered for competitive coders.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card"
                style={{ padding: 28, animationDelay: `${i * 0.1}s` }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border-hover)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 16,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ padding: "60px 24px 100px", position: "relative", zIndex: 1 }}>
        <div
          className="glass-card"
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "56px 40px",
            textAlign: "center",
            background: "var(--brand-glow)",
            border: "1px solid var(--bg-border-hover)",
          }}
        >
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 12 }}>
            Ready to elevate your <span className="gradient-text">CP Rating</span>?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: "1.05rem" }}>
            Join coders tracking their algorithmic mastery today.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg" id="bottom-cta-btn">
            Start For Free — Instant Access <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
