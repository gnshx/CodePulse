import OpenAI from "openai";
import { prisma } from "@/shared/db/client";
import { getAnalytics } from "@/modules/analytics/service";
import type { AnalyticsSummary, Difficulty, RecommendationItem } from "@/shared/types";

type RoadmapProblem = { name: string; url: string; difficulty: Difficulty; pattern: string };

const NEETCODE_FOUNDATIONS: Record<string, RoadmapProblem[]> = {
  Array: [
    { name: "Two Sum", url: "https://leetcode.com/problems/two-sum/", difficulty: "EASY", pattern: "Hash Map" },
    { name: "Valid Anagram", url: "https://leetcode.com/problems/valid-anagram/", difficulty: "EASY", pattern: "Frequency Counting" },
    { name: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/", difficulty: "MEDIUM", pattern: "Hashing" },
  ],
  "Two Pointers": [
    { name: "Valid Palindrome", url: "https://leetcode.com/problems/valid-palindrome/", difficulty: "EASY", pattern: "Inward Pointers" },
    { name: "Two Sum II - Input Array Is Sorted", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "MEDIUM", pattern: "Opposite Pointers" },
    { name: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "MEDIUM", pattern: "Greedy Pointers" },
  ],
  "Binary Search": [
    { name: "Binary Search", url: "https://leetcode.com/problems/binary-search/", difficulty: "EASY", pattern: "Search Bounds" },
    { name: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "MEDIUM", pattern: "Sorted Half" },
    { name: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas/", difficulty: "MEDIUM", pattern: "Binary Search on Answer" },
  ],
  Tree: [
    { name: "Maximum Depth of Binary Tree", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty: "EASY", pattern: "DFS Recursion" },
    { name: "Invert Binary Tree", url: "https://leetcode.com/problems/invert-binary-tree/", difficulty: "EASY", pattern: "Tree DFS" },
    { name: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "MEDIUM", pattern: "Range Validation" },
  ],
  Graph: [
    { name: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "MEDIUM", pattern: "Grid BFS/DFS" },
    { name: "Clone Graph", url: "https://leetcode.com/problems/clone-graph/", difficulty: "MEDIUM", pattern: "Graph Traversal" },
    { name: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/", difficulty: "MEDIUM", pattern: "Topological Sort" },
  ],
  "Dynamic Programming": [
    { name: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", difficulty: "EASY", pattern: "1D DP" },
    { name: "Coin Change", url: "https://leetcode.com/problems/coin-change/", difficulty: "MEDIUM", pattern: "Unbounded Knapsack" },
    { name: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "MEDIUM", pattern: "LIS" },
  ],
};

const FALLBACK_TOPICS = ["Array", "Two Pointers", "Binary Search"] as const;
const roadmapTopics = Object.keys(NEETCODE_FOUNDATIONS);

function configuredOpenAIKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && !key.startsWith("sk-...") ? key : undefined;
}

async function chooseTopicsWithAI(userName: string | null, analytics: AnalyticsSummary | null): Promise<string[]> {
  const apiKey = configuredOpenAIKey();
  if (!apiKey) return [...FALLBACK_TOPICS];

  const weakTopics = analytics?.weakTopics.filter((topic) => roadmapTopics.includes(topic)) ?? [];
  try {
    const completion = await new OpenAI({ apiKey }).chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.45,
      messages: [
        { role: "system", content: "You create beginner-friendly NeetCode-style study plans. Return JSON only." },
        { role: "user", content: `Choose exactly three focus topics for ${userName ?? "this learner"}. Available topics: ${roadmapTopics.join(", ")}. Solved: ${analytics?.totalSolved ?? 0}; weak topics: ${weakTopics.join(", ") || "none"}. New learners need foundations before advanced topics. Return {"topics":["topic 1","topic 2","topic 3"]}.` },
      ],
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as { topics?: unknown };
    const topics = Array.isArray(parsed.topics)
      ? parsed.topics.filter((topic): topic is string => typeof topic === "string" && roadmapTopics.includes(topic))
      : [];
    const uniqueTopics = [...new Set(topics)].slice(0, 3);
    return uniqueTopics.length === 3 ? uniqueTopics : [...FALLBACK_TOPICS];
  } catch {
    return [...FALLBACK_TOPICS];
  }
}

export async function getRecommendations(userId: string, currentAnalytics?: AnalyticsSummary | null): Promise<RecommendationItem[]> {
  const profile = await prisma.profile.upsert({
    where: { userId }, create: { userId }, update: {}, include: { user: { select: { name: true } } },
  });
  const analytics = currentAnalytics ?? await getAnalytics(userId);
  const topics = await chooseTopicsWithAI(profile.user.name, analytics);

  // Generate from today's linked-platform analysis instead of reusing a plan
  // created before the user connected an account.
  return topics.flatMap((topic, topicIndex) => NEETCODE_FOUNDATIONS[topic].map((problem, problemIndex) => ({
    topic,
    pattern: problem.pattern,
    problemName: problem.name,
    problemUrl: problem.url,
    platform: "LEETCODE" as const,
    difficulty: problem.difficulty,
    priority: topicIndex * 10 + problemIndex,
    reason: analytics?.totalSolved
      ? `Chosen from your linked-platform topic coverage; strengthen ${topic} next.`
      : `Start your foundation with ${topic}, then connect a platform for a tailored plan.`,
  })));
}
