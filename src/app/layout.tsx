import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
