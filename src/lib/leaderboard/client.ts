// ── Leaderboard Client ─────────────────────────────────────────────
// Talks to Supabase for reads, Vercel Edge Function for writes.
// All write requests are HMAC-signed.

import { createClient } from "@supabase/supabase-js";
import type {
  LeaderboardCategory,
  LeaderboardTimeframe,
  LeaderboardEntry,
  LeaderboardResponse,
} from "./types";
import { getPlayerId, getPlayerName } from "./identity";
import { signedFetch } from "../security/hmac";

// ── Supabase Setup ────────────────────────────────────────────────
// These are public (anon) keys — safe to expose in client code.
// Row-Level Security on Supabase ensures read-only access.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// ── Valid categories (whitelist for filter injection prevention) ────
const VALID_CATEGORIES: Set<string> = new Set([
  "totalRPAllTime",
  "fastestPrestige",
  "ascensionCount",
  "madnessLevel",
  "challengesCompleted",
  "clickCount",
]);

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

  // Decimal categories (totalRPAllTime, clickCount) need exponent-first sorting
  // because the `value` column overflows to 1e308 for very large Decimals.
  const isDecimalCategory = category === "totalRPAllTime" || category === "clickCount";

  let query = supabase
    .from(tableName)
    .select("*", { count: "exact" })
    .eq("category", category);

  if (isDecimalCategory) {
    query = query
      .order("value_exponent", { ascending: isAsc })
      .order("value_mantissa", { ascending: isAsc });
  } else {
    query = query.order("value", { ascending: isAsc });
  }

  const { data, error, count } = await query.limit(limit);

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
  if (!playerRank && data.length > 0) {
    const lastRow = data[data.length - 1];

    if (isDecimalCategory) {
      // For Decimal categories, count entries with higher exponent,
      // or same exponent + higher mantissa
      const { count: betterCount } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true })
        .eq("category", category)
        .gte("value_exponent", lastRow.value_exponent ?? 0);

      if (betterCount != null) {
        playerRank = betterCount + 1;
      }
    } else {
      const op = isAsc ? "lte" : "gte";
      const { count: betterCount } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true })
        .eq("category", category)
        [op]("value", lastRow.value);

      if (betterCount != null) {
        playerRank = betterCount + 1;
      }
    }
  }

  return { entries, playerRank, totalEntries: count ?? entries.length };
}

// ── Submit Score ──────────────────────────────────────────────────
// Scores are submitted through the Vercel Edge Function with HMAC signing.

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
    };

    const response = await signedFetch("/api/submit-score", payload);

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

// ── Realtime Subscription ─────────────────────────────────────────
// Subscribe to INSERT/UPDATE on a leaderboard table+category.
// Calls `onChange` whenever any player's score changes.
// Uses whitelist validation to prevent filter injection.

export function subscribeToLeaderboard(
  category: LeaderboardCategory,
  timeframe: LeaderboardTimeframe,
  onChange: () => void
): () => void {
  if (!supabase) return () => {};

  // Validate category against whitelist to prevent filter injection
  if (!VALID_CATEGORIES.has(category)) {
    console.warn("Invalid category for subscription:", category);
    return () => {};
  }

  const tableName = timeframe === "weekly" ? "leaderboard_weekly" : "leaderboard";

  const channel = supabase
    .channel(`lb_${tableName}_${category}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: tableName,
        filter: `category=eq.${category}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}

// ── Supabase client accessor (for realtime in other modules) ──────

export function getSupabaseClient() {
  return supabase;
}
