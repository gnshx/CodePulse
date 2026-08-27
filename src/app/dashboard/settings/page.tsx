import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { prisma } from "@/shared/db/client";
import { revalidatePath } from "next/cache";
import { triggerPlatformSync } from "@/modules/sync/service";
import { CACHE_KEYS, redis } from "@/shared/cache/redis";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const value = (name: string) => String(formData.get(name) ?? "").trim() || null;
  const leetcodeUsername = value("leetcodeUsername");
  const codeforcesUsername = value("codeforcesUsername");
  const gfgUsername = value("gfgUsername");
  const codechefUsername = value("codechefUsername");
  const atcoderUsername = value("atcoderUsername");
  const githubUsername = value("githubUsername");
  const bio = formData.get("bio") as string;
  const isPublic = formData.get("isPublic") === "on";

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      leetcodeUsername, codeforcesUsername, gfgUsername, codechefUsername, atcoderUsername, githubUsername,
      bio: bio || null,
      isPublic,
    },
    create: {
      userId: session.user.id,
      leetcodeUsername, codeforcesUsername, gfgUsername, codechefUsername, atcoderUsername, githubUsername,
      bio: bio || null,
      isPublic,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/platforms");
  revalidatePath("/dashboard/topics");
  revalidatePath("/dashboard/roadmap");
  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard/ai-coach");
  if (redis) {
    await redis.del(CACHE_KEYS.aiCoach(session.user.id));
  }

  if (leetcodeUsername || codeforcesUsername) {
    await triggerPlatformSync(session.user.id).catch(() => undefined);
  }
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div>
      <div className="page-header">
        <p className="page-eyebrow">Preferences & Configuration</p>
        <h1 className="page-title">
          <span>⚙️</span> Account Settings
        </h1>
        <p className="page-description">
          Configure connected platform handles and customize profile settings.
        </p>
      </div>

      <div className="glass-card max-w-3xl" style={{ padding: 28 }}>
        <form action={updateProfile} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div id="platform-handles">
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, borderBottom: "1px solid var(--bg-border)", paddingBottom: 10 }}>
              Platform Handles
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  LeetCode Username
                </label>
                <input
                  type="text"
                  name="leetcodeUsername"
                  defaultValue={profile?.leetcodeUsername || ""}
                  placeholder="e.g. tourist"
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Codeforces Handle
                </label>
                <input
                  type="text"
                  name="codeforcesUsername"
                  defaultValue={profile?.codeforcesUsername || ""}
                  placeholder="e.g. tourist"
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  GeeksforGeeks Username
                </label>
                <input
                  type="text"
                  name="gfgUsername"
                  defaultValue={profile?.gfgUsername || ""}
                  placeholder="e.g. gfg_user"
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  CodeChef Handle
                </label>
                <input
                  type="text"
                  name="codechefUsername"
                  defaultValue={profile?.codechefUsername || ""}
                  placeholder="e.g. chef_user"
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  AtCoder Username
                </label>
                <input
                  type="text"
                  name="atcoderUsername"
                  defaultValue={profile?.atcoderUsername || ""}
                  placeholder="e.g. tourist"
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  GitHub Username
                </label>
                <input
                  type="text"
                  name="githubUsername"
                  defaultValue={profile?.githubUsername || ""}
                  placeholder="e.g. octocat"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16, borderBottom: "1px solid var(--bg-border)", paddingBottom: 10 }}>
              Profile Details
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Bio / Competitive Programming Goals
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={profile?.bio || ""}
                  placeholder="Tell us about your CP journey, target ratings, or goals..."
                  className="input"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  defaultChecked={profile?.isPublic || false}
                  style={{ width: 16, height: 16, accentColor: "var(--brand-primary)", cursor: "pointer" }}
                />
                <label htmlFor="isPublic" style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
                  Make profile public (allow others to view your stats and rank)
                </label>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 16, borderTop: "1px solid var(--bg-border)", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary" id="save-settings-btn">
              <span>💾</span> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
