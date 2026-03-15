// ── Leaderboard Client ─────────────────────────────────────────────
// Talks to Supabase for reads, Vercel Edge Function for writes.

import { createClient } from "@supabase/supabase-js";
import type {
  LeaderboardCategory,
  LeaderboardTimeframe,
  LeaderboardEntry,
  LeaderboardResponse,
} from "./types";
import { getPlayerId, getPlayerName } from "./identity";

// ── Supabase Setup ────────────────────────────────────────────────
// These are public (anon) keys — safe to expose in client code.
// Row-Level Security on Supabase ensures read-only access.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// ── Fetch Leaderboard ─────────────────────────────────────────────

export async function fetchLeaderboard(
  category: LeaderboardCategory,
  timeframe: LeaderboardTimeframe = "allTime",
  limit: number = 50
): Promise<LeaderboardResponse> {
  if (!supabase) {
    return { entries: [], playerRank: null, totalEntries: 0 };
  }

  const tableName = timeframe === "weekly" ? "leaderboard_weekly" : "leaderboard";
  const isAsc = category === "fastestPrestige";

  const { data, error, count } = await supabase
    .from(tableName)
    .select("*", { count: "exact" })
    .eq("category", category)
    .order("value", { ascending: isAsc })
    .limit(limit);

  if (error || !data) {
    console.warn("Leaderboard fetch error:", error?.message);
    return { entries: [], playerRank: null, totalEntries: 0 };
  }

  const entries: LeaderboardEntry[] = data.map((row: any, i: number) => ({
    rank: i + 1,
    playerId: row.player_id,
    playerName: row.player_name,
    value: row.value,
    valueMantissa: row.value_mantissa ?? row.value,
    valueExponent: row.value_exponent ?? 0,
    archetype: row.archetype,
    submittedAt: row.submitted_at,
  }));

  // Find the current player's rank
  const playerId = getPlayerId();
  const playerEntry = entries.find((e) => e.playerId === playerId);
  let playerRank = playerEntry?.rank ?? null;

  // If player is not in top N, query their rank
  if (!playerRank) {
    const op = isAsc ? "lte" : "gte";
    const { count: betterCount } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true })
      .eq("category", category)
      [op]("value", data.length > 0 ? data[data.length - 1].value : 0);

    if (betterCount != null) {
      playerRank = betterCount + 1;
    }
  }

  return { entries, playerRank, totalEntries: count ?? entries.length };
}

// ── Submit Score ──────────────────────────────────────────────────
// Scores are submitted through the Vercel Edge Function for validation.

export async function submitScore(
  category: LeaderboardCategory,
  value: number,
  valueMantissa: number,
  valueExponent: number,
  archetype: string | null,
  totalPlaytimeSec: number,
  prestigeCount: number
): Promise<{ success: boolean; error?: string }> {
  const playerId = getPlayerId();
  const playerName = getPlayerName();

  if (!playerName) {
    return { success: false, error: "Please set a display name first." };
  }

  try {
    const payload = {
      playerId,
      playerName,
      category,
      value,
      valueMantissa,
      valueExponent,
      archetype,
      totalPlaytimeSec,
      prestigeCount,
      timestamp: Date.now(),
    };

    const response = await fetch("/api/submit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Unknown error" }));
      return { success: false, error: err.error ?? "Submission failed" };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: "Network error — please try again." };
  }
}

// ── Check if leaderboard is available ─────────────────────────────

export function isLeaderboardAvailable(): boolean {
  return !!supabase;
}
