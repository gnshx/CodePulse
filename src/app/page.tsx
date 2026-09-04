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
  Activity,
  Code2,
  Trophy,
  Globe,
  Terminal,
  ArrowRight,
  Quote,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Zap size={18} color="var(--brand-primary)" />,
    title: "Multi-Platform Sync",
    desc: "Connect LeetCode, Codeforces, CodeChef, and GFG into one unified analytics dashboard.",
  },
  {
    icon: <Bot size={18} color="var(--brand-primary)" />,
    title: "AI Performance Coach",
    desc: "Personalized weekly study plans, readiness assessments, and rating recommendations.",
  },
  {
    icon: <Brain size={18} color="var(--color-easy)" />,
    title: "Topic Mastery Index",
    desc: "Track proficiency across Arrays, DP, Graphs, Math, and Trees in real-time.",
  },
  {
    icon: <Flame size={18} color="var(--color-medium)" />,
    title: "Streak & Consistency",
    desc: "Maintain daily goals, streak metrics, and achievement badges built for coders.",
  },
  {
    icon: <TrendingUp size={18} color="var(--color-info)" />,
    title: "Contest Analytics",
    desc: "Track Codeforces rating growth, rank trends, and contest performance history.",
  },
  {
    icon: <Target size={18} color="var(--color-hard)" />,
    title: "Smart Roadmap",
    desc: "Algorithmic problem recommendations tailored to your rating gap.",
  },
];

const PLATFORMS = [
  { name: "LeetCode", color: "#ffa116", icon: <Code2 size={13} color="#ffa116" /> },
  { name: "Codeforces", color: "#818cf8", icon: <Trophy size={13} color="#818cf8" /> },
  { name: "CodeChef", color: "#fbbf24", icon: <Globe size={13} color="#fbbf24" /> },
  { name: "GeeksforGeeks", color: "#34d399", icon: <Terminal size={13} color="#34d399" /> },
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
            }}
          >
            <Activity size={14} />
          </div>
          <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
            Better<span style={{ color: "var(--brand-primary)" }}>CP</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
            Sign In
          </Link>
          <Link href="/login" className="btn btn-primary btn-sm" id="nav-get-started-btn">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "100px var(--space-5) 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="badge badge-primary animate-fade-up"
          style={{ marginBottom: "var(--space-4)", fontSize: "var(--text-xs)", padding: "4px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          Eat. Sleep. Code. Repeat. — Precision CP Intelligence
        </div>

        <h1
          className="animate-fade-up"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: 780,
            color: "var(--text-primary)",
          }}
        >
          Talk is cheap. <br />
          <span style={{ color: "var(--brand-primary)" }}>Show me the code.</span>
        </h1>

        <p
          className="animate-fade-up"
          style={{
            marginTop: "var(--space-4)",
            fontSize: "var(--text-body)",
            color: "var(--text-secondary)",
            maxWidth: 560,
            lineHeight: 1.6,
          }}
        >
          Stop talking, start solving. Track your performance across LeetCode, Codeforces, CodeChef &amp; GFG with AI coaching and topic mastery insights.
        </p>

        <div
          className="animate-fade-up"
          style={{
            marginTop: "var(--space-6)",
            display: "flex",
            gap: "var(--space-3)",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 480,
          }}
        >
          <Link href="/login" className="btn btn-primary" id="hero-cta-btn">
            Start Free <ArrowRight size={14} />
          </Link>
          <Link href="#features" className="btn btn-secondary" id="hero-features-btn">
            Explore Features
          </Link>
        </div>

        {(showGoogleAuth || showGitHubAuth) && (
          <div
            className="animate-fade-up"
            style={{ marginTop: "var(--space-4)", width: "100%", maxWidth: 320 }}
          >
            <OAuthProviders
              googleEnabled={showGoogleAuth}
              githubEnabled={showGitHubAuth}
              dividerLabel={null}
            />
          </div>
        )}

        {/* Coder Quote Card */}
        <div
          className="animate-fade-up glass-card"
          style={{
            marginTop: "var(--space-8)",
            padding: "var(--space-4) var(--space-6)",
            maxWidth: 520,
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            textAlign: "left",
          }}
        >
          <Quote size={20} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontStyle: "italic" }}>
            &ldquo;Consistency beats intensity. Solve daily, track weak topics, and let the rating take care of itself.&rdquo;
          </p>
        </div>

        {/* Platform Chips */}
        <div
          className="animate-fade-up"
          style={{
            marginTop: "var(--space-8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", fontWeight: 500 }}>
            Supported platforms
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", justifyContent: "center" }}>
            {PLATFORMS.map((p) => (
              <div
                key={p.name}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--bg-border)",
                  background: "var(--bg-card)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {p.icon}
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className="glass-card animate-fade-up"
          style={{
            marginTop: "var(--space-10)",
            padding: "var(--space-5) var(--space-8)",
            display: "flex",
            gap: "var(--space-8)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: "var(--text-h2)", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}
                className="tabular-nums"
              >
                {s.value}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "var(--space-12) var(--space-5)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
            <p className="page-eyebrow" style={{ textAlign: "center" }}>Motivated to Code</p>
            <h2 style={{ fontSize: "var(--text-h1)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Engineered for algorithmic growth
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-card"
                style={{ padding: "var(--space-5)" }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ padding: "var(--space-8) var(--space-5) var(--space-16)", position: "relative", zIndex: 1 }}>
        <div
          className="glass-card"
          style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: "var(--space-10) var(--space-6)",
            textAlign: "center",
          }}
        >
          <span className="badge badge-primary" style={{ fontSize: "var(--text-xs)", marginBottom: "var(--space-3)", display: "inline-flex" }}>
            Eat. Sleep. Code. Repeat.
          </span>
          <h2 style={{ fontSize: "var(--text-h1)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
            Talk is cheap. Show me the code.
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)" }}>
            Join competitive coders tracking their algorithmic growth every day.
          </p>
          <Link href="/login" className="btn btn-primary" id="bottom-cta-btn">
            Get Started Free <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
