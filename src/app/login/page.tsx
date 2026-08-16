import { isGitHubAuthEnabled, isGoogleAuthEnabled } from "@/modules/auth/config";
import { registerWithPassword, signInWithPassword } from "@/app/login/actions";
import { OAuthProviders } from "@/components/auth/oauth-providers";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - BetterCP",
  description: "Sign in to track your competitive programming progress.",
};

const MOTIVATION = [
  { icon: "/auth/eat.svg", label: "Eat", hint: "Fuel up for the grind" },
  { icon: "/auth/code.svg", label: "Code", hint: "Solve. Repeat. Improve." },
  { icon: "/auth/sleep.svg", label: "Sleep", hint: "Recover. Come back stronger." },
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
            ⚔
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
              <Image src={item.icon} alt="" width={64} height={64} />
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
              ⚔
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
                <label htmlFor="username">Username</label>
                <input
                  className="input"
                  id="username"
                  name="username"
                  autoComplete="username"
                  minLength={3}
                  maxLength={24}
                  pattern="[a-zA-Z0-9_]+"
                  required
                />
                <label htmlFor="email">Email</label>
                <input className="input" id="email" name="email" type="email" autoComplete="email" required />
                <label htmlFor="new-password">Password</label>
                <input
                  className="input"
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                />
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  className="input"
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                />
                <button type="submit" className="btn btn-primary auth-submit-button" id="signup-password-btn">
                  Create account
                </button>
              </form>
            ) : (
              <form action={signInWithPassword} className="password-auth-form">
                <label htmlFor="identifier">Email or username</label>
                <input
                  className="input"
                  id="identifier"
                  name="identifier"
                  autoComplete="username"
                  maxLength={254}
                  required
                />
                <label htmlFor="password">Password</label>
                <input
                  className="input"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={128}
                  required
                />
                <button type="submit" className="btn btn-primary auth-submit-button" id="login-password-btn">
                  Sign in
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
