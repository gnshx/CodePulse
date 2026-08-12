import { prisma } from "@/shared/db/client";
import { getAnalytics } from "@/modules/analytics/service";
import type { RecommendationItem } from "@/shared/types";

const CURATED_PROBLEM_BANK: Record<string, Array<{ name: string; url: string; platform: "LEETCODE" | "CODEFORCES"; difficulty: "EASY" | "MEDIUM" | "HARD"; pattern: string }>> = {
  "Dynamic Programming": [
    { name: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", platform: "LEETCODE", difficulty: "EASY", pattern: "1D DP" },
    { name: "Coin Change", url: "https://leetcode.com/problems/coin-change/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Unbounded Knapsack" },
    { name: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "LIS Pattern" },
    { name: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/", platform: "LEETCODE", difficulty: "HARD", pattern: "2D Grid DP" },
  ],
  "Graph": [
    { name: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "BFS/DFS Grid Traversal" },
    { name: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Topological Sort (Kahn's Algo)" },
    { name: "Network Delay Time", url: "https://leetcode.com/problems/network-delay-time/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Dijkstra's Algorithm" },
  ],
  "Array": [
    { name: "Two Sum", url: "https://leetcode.com/problems/two-sum/", platform: "LEETCODE", difficulty: "EASY", pattern: "Hash Map Lookups" },
    { name: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Two Pointers" },
    { name: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Prefix Sum + Hash Map" },
  ],
  "Tree": [
    { name: "Maximum Depth of Binary Tree", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", platform: "LEETCODE", difficulty: "EASY", pattern: "DFS Recursion" },
    { name: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Inorder Traversal / Range Check" },
    { name: "Lowest Common Ancestor", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Tree DFS" },
  ],
  "Binary Search": [
    { name: "Binary Search", url: "https://leetcode.com/problems/binary-search/", platform: "LEETCODE", difficulty: "EASY", pattern: "Classic Binary Search" },
    { name: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Modified Binary Search" },
    { name: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas/", platform: "LEETCODE", difficulty: "MEDIUM", pattern: "Binary Search on Answer" },
  ],
};

export async function getRecommendations(userId: string): Promise<RecommendationItem[]> {
  const analytics = await getAnalytics(userId);
  const weakTopics = analytics?.weakTopics ?? ["Dynamic Programming", "Graph", "Binary Search"];
  
  const recommendations: RecommendationItem[] = [];

  for (const topic of weakTopics) {
    const problems = CURATED_PROBLEM_BANK[topic] ?? CURATED_PROBLEM_BANK["Array"];
    for (const prob of problems) {
      recommendations.push({
        topic,
        pattern: prob.pattern,
        problemName: prob.name,
        problemUrl: prob.url,
        platform: prob.platform,
        difficulty: prob.difficulty,
        priority: topic === weakTopics[0] ? 1 : 2,
        reason: `Targeted practice for your focus area: ${topic}`,
      });
    }
  }

  return recommendations;
}
