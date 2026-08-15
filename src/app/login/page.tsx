import { isGitHubAuthEnabled, isGoogleAuthEnabled, signIn } from "@/modules/auth/config";
import { registerWithPassword, signInWithPassword } from "@/app/login/actions";
import Link from "next/link";
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
              <img src={item.icon} alt="" width={64} height={64} />
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
                ? "Join BetterCP and sync your progress across platforms."
                : "Sign in to access analytics, AI coach, and roadmaps."}
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
              <>
                {hasOAuthProvider && (
                  <>
                    {isGoogleAuthEnabled && (
                      <form
                        action={async () => {
                          "use server";
                          await signIn("google", { redirectTo: "/dashboard" });
                        }}
                      >
                        <button type="submit" className="btn btn-ghost auth-provider-button" id="login-google-btn">
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          Continue with Google
                        </button>
                      </form>
                    )}

                    {isGitHubAuthEnabled && (
                      <form
                        action={async () => {
                          "use server";
                          await signIn("github", { redirectTo: "/dashboard" });
                        }}
                      >
                        <button type="submit" className="btn btn-ghost auth-provider-button" id="login-github-btn">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                          Continue with GitHub
                        </button>
                      </form>
                    )}

                    <div className="login-divider">
                      <span>or use password</span>
                    </div>
                  </>
                )}

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
              </>
            )}
          </div>

          <p className="auth-footnote">Sessions stay secure for up to 24 hours.</p>
        </div>
      </section>
    </div>
  );
}
