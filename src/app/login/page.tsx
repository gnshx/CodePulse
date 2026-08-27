import { isGitHubAuthEnabled, isGoogleAuthEnabled } from "@/modules/auth/config";
import { registerWithPassword, signInWithPassword } from "@/app/login/actions";
import { OAuthProviders } from "@/components/auth/oauth-providers";
import Link from "next/link";
import type { Metadata } from "next";
import { Swords, Utensils, Code2, Moon } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In - BetterCP",
  description: "Sign in to track your competitive programming progress.",
};

const MOTIVATION = [
  { icon: <Utensils size={24} color="var(--brand-primary)" />, label: "Eat", hint: "Fuel up for the grind" },
  { icon: <Code2 size={24} color="var(--brand-accent)" />, label: "Code", hint: "Solve. Repeat. Improve." },
  { icon: <Moon size={24} color="var(--brand-secondary)" />, label: "Sleep", hint: "Recover. Come back stronger." },
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
            <Swords size={20} />
          </div>
          <span>
            Better<span className="gradient-text">CP</span>
          </span>
        </Link>

        <div>
          <h1 className="auth-motivation-headline">
            <em>Eat.</em> Code. Sleep.
            <br />
            Repeat the climb.
          </h1>
          <p className="auth-motivation-sub">
            Track every platform, sharpen weak topics, and stay consistent with goals built for competitive programmers.
          </p>
        </div>

        <div className="auth-motivation-grid">
          {MOTIVATION.map((item) => (
            <div key={item.label} className="auth-motivation-card animate-float">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--bg-border)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 4,
                }}
              >
                {item.icon}
              </div>
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </div>
          ))}
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-card animate-fade-up">
          <Link href="/" className="auth-mobile-brand">
            <div className="auth-motivation-logo" aria-hidden="true">
              <Swords size={20} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>
              Better<span className="gradient-text">CP</span>
            </span>
          </Link>

          <div className="auth-card-header">
            <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p>
              {isSignup
                ? "Join BetterCP with Google or create a password account."
                : "Sign in with Google, GitHub, or your password."}
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

                <button type="submit" className="btn btn-primary auth-submit-button" id="signup-password-btn">
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

                <button type="submit" className="btn btn-primary auth-submit-button" id="login-password-btn">
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
