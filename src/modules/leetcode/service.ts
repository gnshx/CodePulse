import axios from "axios";
import { CACHE_KEYS, CACHE_TTL, withCache } from "@/shared/cache/redis";
import type { PlatformProfile, SubmissionData } from "@/shared/types";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

const PROFILE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        ranking
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

const SUBMISSIONS_QUERY = `
  query recentSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      lang
    }
  }
`;

const TOPIC_TAGS_QUERY = `
  query userSolvedProblems($username: String!) {
    matchedUser(username: $username) {
      tagProblemCounts {
        advanced { tagName problemsSolved }
        intermediate { tagName problemsSolved }
        fundamental { tagName problemsSolved }
      }
    }
  }
`;

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await axios.post(
    LEETCODE_GRAPHQL,
    { query, variables },
    {
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      timeout: 10000,
    }
  );
  return res.data.data as T;
}

export async function fetchLeetCodeProfile(username: string): Promise<PlatformProfile | null> {
  return withCache(
    CACHE_KEYS.leetcodeProfile(username),
    CACHE_TTL.MEDIUM,
    async () => {
      try {
        const data = await graphql<any>(PROFILE_QUERY, { username });
        const user = data?.matchedUser;
        if (!user) return null;

        const acStats = user.submitStats?.acSubmissionNum ?? [];
        const totalSolved = acStats.find((s: any) => s.difficulty === "All")?.count ?? 0;

        return {
          platform: "LEETCODE",
          username,
          totalSolved,
          rank: user.profile?.ranking ? `#${user.profile.ranking}` : undefined,
          avatarUrl: user.profile?.userAvatar,
          profileUrl: `https://leetcode.com/${username}`,
        } satisfies PlatformProfile;
      } catch {
        return null;
      }
    }
  );
}

export async function fetchLeetCodeTopics(username: string): Promise<Record<string, number>> {
  return withCache(
    `lc:topics:${username}`,
    CACHE_TTL.LONG,
    async () => {
      try {
        const data = await graphql<any>(TOPIC_TAGS_QUERY, { username });
        const tags = data?.matchedUser?.tagProblemCounts;
        if (!tags) return {};

        const result: Record<string, number> = {};
        const allTags = [
          ...(tags.advanced ?? []),
          ...(tags.intermediate ?? []),
          ...(tags.fundamental ?? []),
        ];

        for (const tag of allTags) {
          result[tag.tagName] = (result[tag.tagName] ?? 0) + tag.problemsSolved;
        }
        return result;
      } catch {
        return {};
      }
    }
  );
}

export async function fetchLeetCodeSubmissions(
  username: string,
  limit = 100
): Promise<SubmissionData[]> {
  try {
    const data = await graphql<any>(SUBMISSIONS_QUERY, { username, limit });
    const submissions = data?.recentAcSubmissionList ?? [];

    return submissions.map((s: any) => ({
      platformId: s.id,
      platform: "LEETCODE" as const,
      status: "Accepted",
      language: s.lang,
      submittedAt: new Date(Number(s.timestamp) * 1000),
    }));
  } catch {
    return [];
  }
}
