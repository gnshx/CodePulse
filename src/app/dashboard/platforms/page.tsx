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
        { label: "Global Rank", value: lcProfile?.rank ? `#${lcProfile.rank.toLocaleString()}` : "—" },
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
      <div className="page-header" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="page-eyebrow">Integrations</p>
          <h1 className="page-title">
            <span>🔗</span> Coding Platforms
          </h1>
          <p className="page-description">
            Manage linked competitive programming accounts and platform sync status.
          </p>
        </div>
        <Link href="/dashboard/settings" className="btn btn-primary" id="platforms-manage-btn">
          <span>⚙️</span> Manage Handles
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {platforms.map((p) => (
          <div key={p.name} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "2rem" }}>{p.icon}</span>
                <div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: p.color }}>{p.name}</h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                    {p.username ? `@${p.username}` : "Not connected"}
                  </p>
                </div>
              </div>
              <span className={`badge ${p.username ? "badge-easy" : "badge-medium"}`}>
                {p.username ? "Active" : "Unlinked"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16, borderTop: "1px solid var(--bg-border)" }}>
              {p.details.map((d) => (
                <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{d.label}</span>
                  {d.isLink && d.value && d.value !== "—" ? (
                    <a
                      href={d.value}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--brand-accent)", textDecoration: "none", fontWeight: 700 }}
                    >
                      Open Profile ↗
                    </a>
                  ) : (
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{String(d.value)}</span>
                  )}
                </div>
              ))}
            </div>

            {!p.username && (
              <Link
                href="/dashboard/settings#platform-handles"
                style={{ marginTop: 16, display: "inline-block", fontSize: "0.86rem", fontWeight: 700, color: "var(--brand-accent)", textDecoration: "none" }}
              >
                Add handle →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
