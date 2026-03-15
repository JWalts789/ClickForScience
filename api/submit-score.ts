// Vercel Edge Function — score submission with anti-cheat validation.
// Deploy alongside the Vite static build on Vercel.

import { createClient } from "@supabase/supabase-js";

interface ScorePayload {
  playerId: string;
  playerName: string;
  category: string;
  value: number;
  valueMantissa: number;
  valueExponent: number;
  archetype: string | null;
  totalPlaytimeSec: number;
  prestigeCount: number;
  timestamp: number;
}

const VALID_CATEGORIES = [
  "totalRPAllTime",
  "fastestPrestige",
  "ascensionCount",
  "madnessLevel",
  "challengesCompleted",
  "clickCount",
];

// Rate limit: one submission per player per category per 60 seconds
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload: ScorePayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Validate fields ──────────────────────────────────────────────

  if (!payload.playerId || typeof payload.playerId !== "string") {
    return error("Missing playerId");
  }
  if (!payload.playerName || typeof payload.playerName !== "string" || payload.playerName.trim().length === 0) {
    return error("Missing playerName");
  }
  if (!VALID_CATEGORIES.includes(payload.category)) {
    return error("Invalid category");
  }
  if (typeof payload.value !== "number" || !isFinite(payload.value)) {
    return error("Invalid value");
  }
  if (payload.playerName.length > 24) {
    return error("Name too long");
  }

  // ── Rate limit ───────────────────────────────────────────────────

  const rlKey = `${payload.playerId}:${payload.category}`;
  const lastSubmit = rateLimitMap.get(rlKey) ?? 0;
  if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
    return error("Too many submissions. Please wait a minute.", 429);
  }
  rateLimitMap.set(rlKey, Date.now());

  // ── Anti-cheat sanity checks ─────────────────────────────────────

  const flags: string[] = [];

  // Check: playtime vs value plausibility
  if (payload.category === "totalRPAllTime") {
    // At max, even with all multipliers, RP/sec shouldn't exceed ~1e30 per second of play
    // This is a very generous sanity ceiling
    if (payload.valueExponent > 0) {
      const logValue = Math.log10(payload.valueMantissa) + payload.valueExponent;
      const maxLogRP = Math.log10(Math.max(payload.totalPlaytimeSec, 1)) + 35;
      if (logValue > maxLogRP) {
        flags.push("rp_exceeds_playtime_ceiling");
      }
    }
  }

  if (payload.category === "fastestPrestige") {
    // Fastest prestige under 30 seconds is suspicious
    if (payload.value < 30) {
      flags.push("prestige_suspiciously_fast");
    }
  }

  if (payload.category === "clickCount") {
    // More than 20 clicks/second average is suspicious
    if (payload.totalPlaytimeSec > 0) {
      const clicksPerSec = payload.value / payload.totalPlaytimeSec;
      if (clicksPerSec > 20) {
        flags.push("click_rate_suspicious");
      }
    }
  }

  // ── Upsert to Supabase ──────────────────────────────────────────

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const row = {
    player_id: payload.playerId,
    player_name: payload.playerName.trim().slice(0, 24),
    category: payload.category,
    value: payload.value,
    value_mantissa: payload.valueMantissa,
    value_exponent: payload.valueExponent,
    archetype: payload.archetype,
    total_playtime_sec: payload.totalPlaytimeSec,
    prestige_count: payload.prestigeCount,
    flags: flags.length > 0 ? flags : null,
    submitted_at: new Date().toISOString(),
  };

  // Upsert: update if this player+category already exists, only if new value is better
  const isAsc = payload.category === "fastestPrestige";

  // First check existing
  const { data: existing } = await supabase
    .from("leaderboard")
    .select("value, value_exponent")
    .eq("player_id", payload.playerId)
    .eq("category", payload.category)
    .single();

  let shouldUpdate = true;
  if (existing) {
    if (isAsc) {
      // For "fastest", lower is better
      shouldUpdate = payload.value < existing.value;
    } else {
      // For others, higher is better — compare using exponent first, then value
      const existingExp = existing.value_exponent ?? 0;
      if (payload.valueExponent > existingExp) {
        shouldUpdate = true;
      } else if (payload.valueExponent === existingExp) {
        shouldUpdate = payload.value > existing.value;
      } else {
        shouldUpdate = false;
      }
    }
  }

  if (shouldUpdate) {
    const { error: dbError } = await supabase
      .from("leaderboard")
      .upsert(row, { onConflict: "player_id,category" });

    if (dbError) {
      console.error("Supabase upsert error:", dbError);
      return error("Database error", 500);
    }

    // Also upsert weekly table
    await supabase
      .from("leaderboard_weekly")
      .upsert(
        { ...row },
        { onConflict: "player_id,category" }
      );
  }

  return new Response(
    JSON.stringify({ success: true, flags: flags.length > 0 ? flags : undefined }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function error(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}
