import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/config";
import { prisma } from "@/shared/db/client";
import { fetchLeetCodeProfile } from "@/modules/leetcode/service";
import { fetchCodeforcesProfile } from "@/modules/codeforces/service";
import Link from "next/link";
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Code2,
  Trophy,
  Globe,
  Terminal,
} from "lucide-react";

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
      icon: <Code2 size={20} color="#ffa116" />,
      profileData: lcProfile,
      details: [
        { label: "Total Solved", value: lcProfile?.totalSolved ? lcProfile.totalSolved.toLocaleString() : "—" },
        { label: "Global Rank", value: lcProfile?.rank ? `#${lcProfile.rank.toLocaleString()}` : "—" },
        { label: "Profile Link", value: lcProfile?.profileUrl ?? "—", isLink: true },
      ],
    },
    {
      name: "Codeforces",
      key: "codeforcesUsername",
      username: profile?.codeforcesUsername,
      color: "#818cf8",
      icon: <Trophy size={20} color="#818cf8" />,
      profileData: cfProfile,
      details: [
        { label: "Rating", value: cfProfile?.rating ? cfProfile.rating.toLocaleString() : "—" },
        { label: "Rank Title", value: cfProfile?.rank ?? "—" },
        { label: "Profile Link", value: cfProfile?.profileUrl ?? "—", isLink: true },
      ],
    },
    {
      name: "GeeksforGeeks",
      key: "gfgUsername",
      username: profile?.gfgUsername,
      color: "#34d399",
      icon: <Terminal size={20} color="#34d399" />,
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
      color: "#fbbf24",
      icon: <Globe size={20} color="#fbbf24" />,
      profileData: null,
      details: [
        { label: "Username", value: profile?.codechefUsername ?? "Not set" },
        { label: "Status", value: profile?.codechefUsername ? "Connected" : "Pending" },
      ],
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <p className="page-eyebrow">Integrations</p>
          <h1 className="page-title">Coding Platforms</h1>
          <p className="page-description">
            Manage linked competitive programming accounts and platform sync status.
          </p>
        </div>
        <Link href="/dashboard/settings#platform-handles" className="btn btn-primary btn-sm" id="platforms-manage-btn">
          Manage Handles
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        {platforms.map((p) => (
          <div key={p.name} className="glass-card" style={{ padding: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {p.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</h2>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                    {p.username ? `@${p.username}` : "Not connected"}
                  </p>
                </div>
              </div>
              <span className={`badge ${p.username ? "badge-easy" : "badge-medium"}`} style={{ fontSize: "var(--text-xs)" }}>
                {p.username ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {p.username ? "Active" : "Unlinked"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--bg-border)" }}>
              {p.details.map((d) => (
                <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-xs)" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{d.label}</span>
                  {d.isLink && d.value && d.value !== "—" ? (
                    <a
                      href={d.value}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--brand-primary)", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 3 }}
                    >
                      Profile <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span style={{ fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{String(d.value)}</span>
                  )}
                </div>
              ))}
            </div>

            {!p.username && (
              <Link
                href="/dashboard/settings#platform-handles"
                style={{ marginTop: "var(--space-3)", display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--brand-primary)", textDecoration: "none" }}
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
