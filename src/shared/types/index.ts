// Shared TypeScript types used across modules

export type Platform = "LEETCODE" | "CODEFORCES" | "CODECHEF" | "GFG" | "ATCODER";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type SubmissionStatus = "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | "Compilation Error";

export interface PlatformProfile {
  platform: Platform;
  username: string;
  totalSolved: number;
  rating?: number;
  rank?: string;
  avatarUrl?: string;
  profileUrl: string;
}

export interface ProblemData {
  platformId: string;
  platform: Platform;
  title: string;
  slug: string;
  difficulty?: Difficulty;
  topics: string[];
  url: string;
}

export interface SubmissionData {
  platformId: string;
  platform: Platform;
  status: SubmissionStatus | string;
  language?: string;
  runtime?: number;
  memory?: number;
  submittedAt: Date;
}

export interface TopicMastery {
  topic: string;
  score: number;       // 0-100
  solved: number;
  total?: number;
}

export interface AnalyticsSummary {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  longestStreak: number;
  acceptanceRate: number;
  topicMastery: Record<string, number>;
  weakTopics: string[];
  strongTopics: string[];
  platformStats: Record<Platform, { solved: number; rating?: number }>;
  lastActiveDate?: Date;
}

export interface RecommendationItem {
  topic: string;
  pattern?: string;
  problemName?: string;
  problemUrl?: string;
  platform?: Platform;
  difficulty?: Difficulty;
  priority: number;
  reason?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
