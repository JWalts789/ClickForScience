// Vercel Edge Function — score submission with HMAC signing, anti-cheat,
// origin validation, input sanitization, and DB-backed rate limiting.

import { createClient } from "@supabase/supabase-js";
import {
  validateOrigin,
  handlePreflight,
  jsonResponse,
  verifySignature,
  sanitizePlayerName,
  isValidUUID,
  clampFinite,
  VALID_ARCHETYPES,
  VALID_CATEGORIES,
} from "./_shared";

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
}

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  // ── CORS ──────────────────────────────────────────────────────────
  const origin = validateOrigin(req);
  if (!origin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "OPTIONS") {
    return handlePreflight(origin);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, origin);
  }

  // ── Server config ─────────────────────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hmacSecret = process.env.HMAC_SECRET ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500, origin);
  }

  // ── Read body (needed for HMAC verification) ──────────────────────
  const bodyText = await req.text();

  // ── Verify HMAC signature (skipped if HMAC_SECRET not configured) ─
  const sigResult = await verifySignature(req, bodyText, hmacSecret);
  if (!sigResult.valid) {
    return jsonResponse({ error: sigResult.error ?? "Unauthorized" }, 401, origin);
  }

  // ── Parse payload ─────────────────────────────────────────────────
  let payload: ScorePayload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, origin);
  }

  // ── Validate fields ───────────────────────────────────────────────

  if (!payload.playerId || !isValidUUID(payload.playerId)) {
    return jsonResponse({ error: "Invalid playerId" }, 400, origin);
  }

  if (!payload.playerName || typeof payload.playerName !== "string") {
    return jsonResponse({ error: "Missing playerName" }, 400, origin);
  }

  const playerName = sanitizePlayerName(payload.playerName);
  if (playerName.length === 0) {
    return jsonResponse({ error: "Invalid playerName" }, 400, origin);
  }

  if (!VALID_CATEGORIES.has(payload.category)) {
    return jsonResponse({ error: "Invalid category" }, 400, origin);
  }

  // Numeric bounds validation
  const value = clampFinite(payload.value, -1e308, 1e308);
  if (value === null) {
    return jsonResponse({ error: "Invalid value" }, 400, origin);
  }

  const valueMantissa = clampFinite(payload.valueMantissa, 0, 10);
  const valueExponent = clampFinite(payload.valueExponent, 0, 999);
  const totalPlaytimeSec = clampFinite(payload.totalPlaytimeSec, 0, 1e9);
  const prestigeCount = clampFinite(payload.prestigeCount, 0, 1e6);

  if (valueMantissa === null || valueExponent === null || totalPlaytimeSec === null || prestigeCount === null) {
    return jsonResponse({ error: "Invalid numeric fields" }, 400, origin);
  }

  // Validate archetype
  const archetype = payload.archetype;
  if (archetype !== null && !VALID_ARCHETYPES.has(archetype)) {
    return jsonResponse({ error: "Invalid archetype" }, 400, origin);
  }

  // ── DB-backed rate limiting ───────────────────────────────────────

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const RATE_LIMIT_SEC = 60;

  const { data: recentSubmission } = await supabase
    .from("rate_limits")
    .select("last_attempt")
    .eq("key", `score:${payload.playerId}:${payload.category}`)
    .maybeSingle();

  if (recentSubmission) {
    const elapsed = (Date.now() - new Date(recentSubmission.last_attempt).getTime()) / 1000;
    if (elapsed < RATE_LIMIT_SEC) {
      return jsonResponse(
        { error: `Too many submissions. Wait ${Math.ceil(RATE_LIMIT_SEC - elapsed)}s.` },
        429,
        origin
      );
    }
  }

  // Update rate limit timestamp
  await supabase.from("rate_limits").upsert(
    { key: `score:${payload.playerId}:${payload.category}`, last_attempt: new Date().toISOString() },
    { onConflict: "key" }
  );

  // ── Anti-cheat sanity checks (ENFORCED — reject flagged scores) ──

  const flags: string[] = [];

  if (payload.category === "totalRPAllTime" && valueExponent > 0) {
    const logValue = Math.log10(Math.max(valueMantissa, 0.1)) + valueExponent;
    const maxLogRP = Math.log10(Math.max(totalPlaytimeSec, 1)) + 35;
    if (logValue > maxLogRP) {
      flags.push("rp_exceeds_playtime_ceiling");
    }
  }

  if (payload.category === "fastestPrestige" && value < 30) {
    flags.push("prestige_suspiciously_fast");
  }

  if (payload.category === "clickCount" && totalPlaytimeSec > 0) {
    const clicksPerSec = value / totalPlaytimeSec;
    if (clicksPerSec > 20) {
      flags.push("click_rate_suspicious");
    }
  }

  // ENFORCE: reject flagged submissions
  if (flags.length > 0) {
    console.warn("Anti-cheat rejection:", payload.playerId, flags);
    return jsonResponse(
      { error: "Score flagged as suspicious", flags },
      403,
      origin
    );
  }

  // ── Upsert to Supabase ────────────────────────────────────────────

  const now = new Date().toISOString(); // Server-side timestamp only
  const row = {
    player_id: payload.playerId,
    player_name: playerName,
    category: payload.category,
    value,
    value_mantissa: valueMantissa,
    value_exponent: valueExponent,
    archetype,
    total_playtime_sec: totalPlaytimeSec,
    prestige_count: prestigeCount,
    flags: null, // Clean submission
    submitted_at: now,
  };

  // Check existing score — only update if better
  const isAsc = payload.category === "fastestPrestige";

  const { data: existing } = await supabase
    .from("leaderboard")
    .select("value, value_mantissa, value_exponent")
    .eq("player_id", payload.playerId)
    .eq("category", payload.category)
    .maybeSingle();

  let shouldUpdate = true;
  if (existing) {
    if (isAsc) {
      // For "fastest", lower is better — use raw value (always small numbers)
      shouldUpdate = value < existing.value;
    } else {
      // For Decimal categories, compare exponent first, then mantissa
      const existingExp = existing.value_exponent ?? 0;
      const existingMantissa = existing.value_mantissa ?? existing.value;
      if (valueExponent > existingExp) {
        shouldUpdate = true;
      } else if (valueExponent === existingExp) {
        shouldUpdate = valueMantissa > existingMantissa;
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
      return jsonResponse({ error: "Database error" }, 500, origin);
    }

    await supabase
      .from("leaderboard_weekly")
      .upsert({ ...row }, { onConflict: "player_id,category" });
  }

  return jsonResponse({ success: true }, 200, origin);
}
