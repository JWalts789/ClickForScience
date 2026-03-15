// ── Leaderboard Types ──────────────────────────────────────────────

export type LeaderboardCategory =
  | "totalRPAllTime"
  | "fastestPrestige"
  | "ascensionCount"
  | "madnessLevel"
  | "challengesCompleted"
  | "clickCount";

export type LeaderboardTimeframe = "allTime" | "weekly";

export const LEADERBOARD_CATEGORIES: {
  id: LeaderboardCategory;
  label: string;
  description: string;
  format: "decimal" | "integer" | "seconds";
  sortOrder: "desc" | "asc";
}[] = [
  { id: "totalRPAllTime", label: "Total RP", description: "Highest total RP earned all-time", format: "decimal", sortOrder: "desc" },
  { id: "fastestPrestige", label: "Speed Prestige", description: "Fastest first prestige time", format: "seconds", sortOrder: "asc" },
  { id: "ascensionCount", label: "Ascensions", description: "Most ascensions completed", format: "integer", sortOrder: "desc" },
  { id: "madnessLevel", label: "Madness", description: "Highest madness level reached", format: "integer", sortOrder: "desc" },
  { id: "challengesCompleted", label: "Challenges", description: "Most challenges completed", format: "integer", sortOrder: "desc" },
  { id: "clickCount", label: "Clicks", description: "Total clicks all-time", format: "decimal", sortOrder: "desc" },
];

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  value: number;
  /** Mantissa for Decimal values (value = mantissa * 10^exponent). */
  valueMantissa: number;
  valueExponent: number;
  archetype: string | null;
  submittedAt: string;
}

export interface ScoreSubmission {
  playerId: string;
  playerName: string;
  category: LeaderboardCategory;
  /** For Decimal values, we send mantissa + exponent for precision. */
  valueMantissa: number;
  valueExponent: number;
  /** Integer value for non-Decimal categories. */
  value: number;
  archetype: string | null;
  /** Anti-cheat: total playtime in seconds. */
  totalPlaytimeSec: number;
  /** Anti-cheat: prestige count. */
  prestigeCount: number;
  /** Anti-cheat: timestamp of submission. */
  timestamp: number;
  /** Anti-cheat: HMAC signature. */
  signature: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  playerRank: number | null;
  totalEntries: number;
}
