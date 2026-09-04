import { isGitHubAuthEnabled, isGoogleAuthEnabled } from "@/modules/auth/config";
import { registerWithPassword, signInWithPassword } from "@/app/login/actions";
import { OAuthProviders } from "@/components/auth/oauth-providers";
import Link from "next/link";
import type { Metadata } from "next";
import { Activity, Flame, Utensils, Code2, Moon, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In - BetterCP",
  description: "Sign in to track your competitive programming progress.",
};

const MOTIVATION = [
  { icon: <Utensils size={14} color="var(--brand-primary)" />, title: "Eat", desc: "Fuel your focus for the daily problem grind." },
  { icon: <Moon size={14} color="var(--brand-secondary)" />, title: "Sleep", desc: "Rest, recover, and return rating higher." },
  { icon: <Code2 size={14} color="var(--color-easy)" />, title: "Code", desc: "Talk is cheap. Write accepted solutions." },
  { icon: <Flame size={14} color="var(--color-medium)" />, title: "Repeat", desc: "Consistency beats intensity every time." },
] as const;

function resolveAuthError(error?: string) {
  if (!error) return null;
  if (error === "CredentialsSignin") {
    return "Incorrect username, email, or password.";
  }
  if (error === "OAuthAccountNotLinked") {
    return "That email is already registered with a password. Sign in with your password instead.";
  }
  if (error === "OAuthSignin" || error === "Configuration") {
    return "Google sign-in is unavailable right now. Check your OAuth credentials and try again.";
  }
  if (error.length > 160) return "Something went wrong. Please try again.";
  return error;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const loginError = resolveAuthError(error);
  const isSignup = mode === "signup";
  const hasOAuthProvider = isGoogleAuthEnabled || isGitHubAuthEnabled;

  return (
    <div className="auth-page">
      <div className="auth-page-bg" />

      <aside className="auth-motivation animate-fade-up">
        <Link href="/" className="auth-motivation-brand">
          <div className="auth-motivation-logo" aria-hidden="true">
            <Activity size={18} />
          </div>
          <span>
            Better<span style={{ color: "var(--brand-primary)" }}>CP</span>
          </span>
        </Link>

        <div>
          <span className="badge badge-primary" style={{ fontSize: "var(--text-xs)", marginBottom: "var(--space-3)", display: "inline-flex" }}>
            Eat. Sleep. Code. Repeat.
          </span>
          <h1 className="auth-motivation-headline" style={{ marginTop: "var(--space-2)" }}>
            Talk is cheap.<br />
            <span style={{ color: "var(--brand-primary)" }}>Show me the code.</span>
          </h1>
          <p className="auth-motivation-sub">
            Track every platform, sharpen weak topics, and build consistency with goals built for rating growth.
          </p>
        </div>

        {/* Motivating Quote Box */}
        <div
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            marginTop: "var(--space-4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "var(--brand-primary)" }}>
            <Quote size={14} />
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Developer Creed</span>
          </div>
          <p style={{ fontSize: "var(--text-xs)", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            &ldquo;Talk is cheap. Show me the code.&rdquo; — Linus Torvalds
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
          {MOTIVATION.map((item) => (
            <div
              key={item.title}
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--bg-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                {item.icon}
                <strong style={{ fontSize: "var(--text-xs)", color: "var(--text-primary)", fontWeight: 600 }}>{item.title}</strong>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-card animate-fade-up">
          <Link href="/" className="auth-mobile-brand">
            <div className="auth-motivation-logo" aria-hidden="true">
              <Activity size={18} />
            </div>
            <span style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
              Better<span style={{ color: "var(--brand-primary)" }}>CP</span>
            </span>
          </Link>

          <div className="auth-card-header">
            <h1>{isSignup ? "Create account" : "Welcome back"}</h1>
            <p>
              {isSignup
                ? "Join BetterCP to track your algorithmic progress."
                : "Sign in with Google, GitHub, or password."}
            </p>
          </div>

          <nav className="auth-tabs" aria-label="Authentication mode">
            <Link
              href="/login"
              className={`auth-tab${isSignup ? "" : " is-active"}`}
              aria-current={isSignup ? undefined : "page"}
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              className={`auth-tab${isSignup ? " is-active" : ""}`}
              aria-current={isSignup ? "page" : undefined}
            >
              Create account
            </Link>
          </nav>

          {loginError && (
            <p className="auth-message auth-message-error" role="alert">
              {loginError}
            </p>
          )}

          <div className="auth-options">
            {hasOAuthProvider && (
              <OAuthProviders
                googleEnabled={isGoogleAuthEnabled}
                githubEnabled={isGitHubAuthEnabled}
                dividerLabel={isSignup ? "or sign up with email" : "or use password"}
              />
            )}

            {isSignup ? (
              <form action={registerWithPassword} className="password-auth-form">
                <div className="auth-field">
                  <label htmlFor="username">Username</label>
                  <input
                    className="input"
                    id="username"
                    name="username"
                    autoComplete="username"
                    placeholder="e.g. tourist"
                    minLength={3}
                    maxLength={24}
                    pattern="[a-zA-Z0-9_]+"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="email">Email address</label>
                  <input
                    className="input"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="new-password">Password</label>
                  <input
                    className="input"
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <input
                    className="input"
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary auth-submit-button" id="signup-password-btn" style={{ width: "100%" }}>
                  Create Account
                </button>
              </form>
            ) : (
              <form action={signInWithPassword} className="password-auth-form">
                <div className="auth-field">
                  <label htmlFor="identifier">Email or username</label>
                  <input
                    className="input"
                    id="identifier"
                    name="identifier"
                    autoComplete="username"
                    placeholder="e.g. tourist or user@example.com"
                    maxLength={254}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <input
                    className="input"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary auth-submit-button" id="login-password-btn" style={{ width: "100%" }}>
                  Sign In
                </button>
              </form>
            )}
          </div>

          <p className="auth-footnote">Sessions stay secure for up to 24 hours.</p>
        </div>
      </section>
    </div>
  );
}
