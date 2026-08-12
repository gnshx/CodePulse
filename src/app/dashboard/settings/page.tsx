"use client";

import { useState } from "react";
import type { Metadata } from "next";

const PLATFORMS = [
  { key: "leetcodeUsername", name: "LeetCode", color: "#ffa116", icon: "🟡", placeholder: "e.g. john_doe", url: "https://leetcode.com" },
  { key: "codeforcesUsername", name: "Codeforces", color: "#1a83f2", icon: "🔵", placeholder: "e.g. tourist", url: "https://codeforces.com" },
  { key: "gfgUsername", name: "GeeksforGeeks", color: "#2ba94b", icon: "🟢", placeholder: "e.g. johndoe123", url: "https://geeksforgeeks.org" },
  { key: "codechefUsername", name: "CodeChef", color: "#d4a574", icon: "🍴", placeholder: "e.g. john_d", url: "https://codechef.com" },
  { key: "atcoderUsername", name: "AtCoder", color: "#909090", icon: "🔘", placeholder: "e.g. john_doe", url: "https://atcoder.jp" },
];

export default function SettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>⚙️ Settings</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Connect your coding platforms to start tracking your progress.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 36 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 24 }}>
          🔗 Platform Usernames
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {PLATFORMS.map((p) => (
            <div key={p.key}>
              <label
                htmlFor={`input-${p.key}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                <span>{p.icon}</span>
                <span style={{ color: p.color }}>{p.name}</span>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  id={`input-${p.key}`}
                  type="text"
                  className="input"
                  placeholder={p.placeholder}
                  value={form[p.key] ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [p.key]: e.target.value }))}
                />
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ whiteSpace: "nowrap", padding: "12px 16px" }}
                  id={`open-${p.key}-btn`}
                >
                  ↗
                </a>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "var(--color-hard)",
              fontSize: "0.88rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
            id="settings-save-btn"
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "⏳ Saving..." : saved ? "✅ Saved!" : "💾 Save & Sync"}
          </button>

          {saved && (
            <div style={{ display: "flex", alignItems: "center", color: "var(--color-easy)", fontSize: "0.88rem" }}>
              ✓ Data sync started in background
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 24,
            padding: "16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(108, 99, 255, 0.05)",
            border: "1px solid rgba(108, 99, 255, 0.15)",
          }}
        >
          <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--brand-secondary)" }}>⚡ Background Sync: </strong>
            After saving, your data is fetched in the background (usually under 2 minutes). You can continue using the app — we'll notify you when it's ready.
          </p>
        </div>
      </div>
    </div>
  );
}
