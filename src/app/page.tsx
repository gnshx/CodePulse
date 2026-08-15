import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { OAuthProviders } from "@/components/auth/oauth-providers";
import { isGitHubAuthEnabled, isGoogleAuthEnabled } from "@/modules/auth/config";

const FEATURES = [
  {
    icon: "⚡",
    title: "Multi-Platform Sync",
    desc: "Connect LeetCode, Codeforces, CodeChef, and GFG. All your progress, one place.",
  },
  {
    icon: "🧠",
    title: "AI Coach",
    desc: "Get personalized weekly study plans, readiness assessments, and smart recommendations.",
  },
  {
    icon: "📊",
    title: "Topic Mastery",
    desc: "See your mastery score for every topic — Arrays, DP, Graphs, and more.",
  },
  {
    icon: "🔥",
    title: "Streaks & Goals",
    desc: "Stay consistent with daily goals, streak tracking, and achievement badges.",
  },
  {
    icon: "📈",
    title: "Contest Analytics",
    desc: "Track your Codeforces rating growth, rank trends, and contest performance over time.",
  },
  {
    icon: "🎯",
    title: "Smart Roadmap",
    desc: "Problem recommendations based on your weak topics and prerequisite concepts.",
  },
];

const PLATFORMS = [
  { name: "LeetCode", color: "#ffa116", icon: "LC" },
  { name: "Codeforces", color: "#1a83f2", icon: "CF" },
  { name: "CodeChef", color: "#d4a574", icon: "CC" },
  { name: "GeeksforGeeks", color: "#2ba94b", icon: "GFG" },
];

const STATS = [
  { value: "10K+", label: "Problems Tracked" },
  { value: "4", label: "Platforms" },
  { value: "AI", label: "Powered Coach" },
  { value: "Free", label: "To Start" },
];

export default async function LandingPage() {
  const showGoogleAuth = isGoogleAuthEnabled;
  const showGitHubAuth = isGitHubAuthEnabled;
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div className="bg-mesh" />

      {/* ── Navbar ── */}
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
        {/* Floating badge */}
        <div
          className="badge badge-primary animate-fade-up"
          style={{ marginBottom: 24, fontSize: "0.8rem", padding: "6px 16px" }}
        >
          🚀 AI-Powered CP & DSA Coaching
        </div>

        <h1
          className="animate-fade-up"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: 800,
            animationDelay: "0.1s",
          }}
        >
          Level Up Your{" "}
          <span className="gradient-text">Competitive</span>
          <br />
          Programming
        </h1>

        <p
          className="animate-fade-up"
          style={{
            marginTop: 24,
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            maxWidth: 600,
            lineHeight: 1.7,
            animationDelay: "0.2s",
          }}
        >
          Track your progress across LeetCode, Codeforces, CodeChef & more.
          Get AI insights, identify weak spots, and become the coder you want to be.
        </p>

        <div
          className="animate-fade-up"
          style={{
            marginTop: 40,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.3s",
            maxWidth: 520,
          }}
        >
          <Link href="/login" className="btn btn-primary btn-lg" id="hero-cta-btn">
            🎯 Start Tracking Free
          </Link>
          <Link href="#features" className="btn btn-ghost btn-lg" id="hero-features-btn">
            See Features →
          </Link>
        </div>

        {(showGoogleAuth || showGitHubAuth) && (
          <div
            className="animate-fade-up"
            style={{ marginTop: 18, width: "100%", maxWidth: 360, animationDelay: "0.35s" }}
          >
            <OAuthProviders
              googleEnabled={showGoogleAuth}
              githubEnabled={showGitHubAuth}
              dividerLabel={null}
            />
          </div>
        )}

        {/* Platform Logos */}
        <div
          className="animate-fade-up"
          style={{
            marginTop: 64,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            animationDelay: "0.4s",
          }}
        >
          <p style={{ color: "var(--text-muted)", width: "100%", marginBottom: 8, fontSize: "0.85rem" }}>
            Supports your favourite platforms
          </p>
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--bg-border)",
                background: "var(--bg-elevated)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: p.color + "30",
                  border: `1px solid ${p.color}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  color: p.color,
                }}
              >
                {p.icon.slice(0, 2)}
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{p.name}</span>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div
          className="glass-card animate-fade-up"
          style={{
            marginTop: 64,
            padding: "28px 48px",
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
                className="gradient-text"
                style={{ fontSize: "2rem", fontWeight: 900 }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features-section">
        <div className="features-container">
          <h2 className="features-title">
            Everything you need to{" "}
            <span className="gradient-text">dominate</span>
          </h2>
          <p className="features-intro">
            Built for serious competitive programmers who want real insights, not just stats.
          </p>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card feature-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="feature-icon"
                >
                  {f.icon}
                </div>
                <h3 className="feature-card-title">
                  {f.title}
                </h3>
                <p className="feature-card-description">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ padding: "80px 24px 120px", position: "relative", zIndex: 1 }}>
        <div
          className="glass-card"
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "64px 48px",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(108, 99, 255, 0.1), rgba(34, 211, 238, 0.05))",
          }}
        >
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 16 }}>
            Ready to get <span className="gradient-text">better</span>?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "1.05rem" }}>
            Join thousands of coders tracking their journey to mastery.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg" id="bottom-cta-btn">
            🚀 Start For Free — No Credit Card
          </Link>
        </div>
      </section>
    </div>
  );
}
