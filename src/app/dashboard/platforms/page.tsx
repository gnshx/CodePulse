import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { prisma } from "@/shared/db/client";
import { fetchLeetCodeProfile } from "@/modules/leetcode/service";
import { fetchCodeforcesProfile } from "@/modules/codeforces/service";
import Link from "next/link";

export default async function PlatformsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });

  const lcProfile = profile?.leetcodeUsername ? await fetchLeetCodeProfile(profile.leetcodeUsername) : null;
  const cfProfile = profile?.codeforcesUsername ? await fetchCodeforcesProfile(profile.codeforcesUsername) : null;

  const platforms = [
    {
      name: "LeetCode",
      key: "leetcodeUsername",
      username: profile?.leetcodeUsername,
      color: "#ffa116",
      icon: "🟡",
      profileData: lcProfile,
      details: [
        { label: "Total Solved", value: lcProfile?.totalSolved ?? "—" },
        { label: "Global Rank", value: lcProfile?.rank ?? "—" },
        { label: "Profile Link", value: lcProfile?.profileUrl ?? "—", isLink: true },
      ],
    },
    {
      name: "Codeforces",
      key: "codeforcesUsername",
      username: profile?.codeforcesUsername,
      color: "#1a83f2",
      icon: "🔵",
      profileData: cfProfile,
      details: [
        { label: "Rating", value: cfProfile?.rating ?? "—" },
        { label: "Rank Title", value: cfProfile?.rank ?? "—" },
        { label: "Profile Link", value: cfProfile?.profileUrl ?? "—", isLink: true },
      ],
    },
    {
      name: "GeeksforGeeks",
      key: "gfgUsername",
      username: profile?.gfgUsername,
      color: "#2ba94b",
      icon: "🟢",
      profileData: null,
      details: [
        { label: "Username", value: profile?.gfgUsername ?? "Not set" },
        { label: "Status", value: profile?.gfgUsername ? "Connected" : "Pending" },
      ],
    },
    {
      name: "CodeChef",
      key: "codechefUsername",
      username: profile?.codechefUsername,
      color: "#d4a574",
      icon: "🍴",
      profileData: null,
      details: [
        { label: "Username", value: profile?.codechefUsername ?? "Not set" },
        { label: "Status", value: profile?.codechefUsername ? "Connected" : "Pending" },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1.5 text-3xl font-extrabold">🔗 Coding Platforms</h1>
          <p className="text-secondary">
            Manage platform accounts and view platform-specific statistics
          </p>
        </div>
        <Link href="/dashboard/settings" className="btn btn-primary" id="platforms-manage-btn">
          ⚙️ Manage Usernames
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {platforms.map((p) => (
          <div key={p.name} className="glass-card relative p-7">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: p.color }}>{p.name}</h2>
                  <p className="text-[0.95rem] text-muted">
                    {p.username ? `@${p.username}` : "Not connected"}
                  </p>
                </div>
              </div>
              <span className={`badge ${p.username ? "badge-easy" : "badge-medium"}`}>
                {p.username ? "Active" : "Unlinked"}
              </span>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--bg-border)] pt-4">
              {p.details.map((d) => (
                <div key={d.label} className="flex justify-between text-[1rem]">
                  <span className="text-secondary">{d.label}</span>
                  {d.isLink && d.value ? (
                    <a
                      href={d.value}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-accent no-underline transition-colors hover:text-brand-secondary"
                    >
                      Open Profile ↗
                    </a>
                  ) : (
                    <span className="font-semibold text-primary">{String(d.value)}</span>
                  )}
                </div>
              ))}
            </div>
            {!p.username && (
              <Link
                href="/dashboard/settings#platform-handles"
                className="mt-5 inline-flex text-sm font-bold text-brand-accent no-underline hover:text-brand-secondary"
              >
                Add username →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
