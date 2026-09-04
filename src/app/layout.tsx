import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Better CP — Competitive Programming Tracker & Coach",
    template: "%s | Better CP",
  },
  description:
    "Track your competitive programming progress across LeetCode, Codeforces, GeeksforGeeks, and more. Get AI-powered insights, personalized roadmaps, and topic mastery analysis.",
  keywords: ["competitive programming", "DSA", "LeetCode", "Codeforces", "coding tracker"],
  openGraph: {
    type: "website",
    title: "Better CP",
    description: "Your AI-powered CP & DSA coaching platform",
    siteName: "Better CP",
  },
};

const themeInitializationScript = `
  try {
    const storedTheme = localStorage.getItem("bettercp-theme");
    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;450;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Script id="theme-initialization" strategy="beforeInteractive">
          {themeInitializationScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
