import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { prisma } from "@/shared/db/client";
import { revalidatePath } from "next/cache";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const leetcodeUsername = formData.get("leetcodeUsername") as string;
  const codeforcesUsername = formData.get("codeforcesUsername") as string;
  const gfgUsername = formData.get("gfgUsername") as string;
  const codechefUsername = formData.get("codechefUsername") as string;
  const atcoderUsername = formData.get("atcoderUsername") as string;
  const githubUsername = formData.get("githubUsername") as string;
  const bio = formData.get("bio") as string;
  const isPublic = formData.get("isPublic") === "on";

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      leetcodeUsername: leetcodeUsername || null,
      codeforcesUsername: codeforcesUsername || null,
      gfgUsername: gfgUsername || null,
      codechefUsername: codechefUsername || null,
      atcoderUsername: atcoderUsername || null,
      githubUsername: githubUsername || null,
      bio: bio || null,
      isPublic,
    },
    create: {
      userId: session.user.id,
      leetcodeUsername: leetcodeUsername || null,
      codeforcesUsername: codeforcesUsername || null,
      gfgUsername: gfgUsername || null,
      codechefUsername: codechefUsername || null,
      atcoderUsername: atcoderUsername || null,
      githubUsername: githubUsername || null,
      bio: bio || null,
      isPublic,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/platforms");
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
      <div className="mb-8">
        <h1 className="mb-1.5 text-3xl font-extrabold">⚙️ Account Settings</h1>
        <p className="text-secondary">
          Configure your platform handles and profile preferences
        </p>
      </div>

      <div className="glass-card max-w-3xl p-8">
        <form action={updateProfile} className="flex flex-col gap-6">
          <div>
            <h2 className="mb-4 text-xl font-bold border-b border-[var(--bg-border)] pb-3">
              Platform Handles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-secondary">
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
                <label className="block text-sm font-semibold mb-2 text-secondary">
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
                <label className="block text-sm font-semibold mb-2 text-secondary">
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
                <label className="block text-sm font-semibold mb-2 text-secondary">
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
                <label className="block text-sm font-semibold mb-2 text-secondary">
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
                <label className="block text-sm font-semibold mb-2 text-secondary">
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
            <h2 className="mb-6 text-xl font-bold border-b border-[var(--bg-border)] pb-3">
              Profile Details
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-secondary">
                  Bio / About Me
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

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  defaultChecked={profile?.isPublic || false}
                  className="h-4 w-4 rounded border-[var(--bg-border)]"
                />
                <label htmlFor="isPublic" className="text-sm text-secondary">
                  Make profile public (allow others to view your stats)
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--bg-border)] flex justify-end">
            <button type="submit" className="btn btn-primary" id="save-settings-btn">
              💾 Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
