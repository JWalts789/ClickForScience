// Vercel Edge Function — analytics event ingestion with origin validation,
// HMAC signing, event whitelisting, server-side timestamps, and rate limiting.

import { createClient } from "@supabase/supabase-js";
import {
  validateOrigin,
  handlePreflight,
  jsonResponse,
  verifySignature,
  isValidUUID,
  clampFinite,
  VALID_EVENT_TYPES,
  VALID_ARCHETYPES,
} from "./_shared";

interface AnalyticsEvent {
  event: string;
  data?: Record<string, unknown>;
}

interface SessionSnapshot {
  sessionId: string;
  startedAt: string;
  durationSec: number;
  totalRpLog10: number | null;
  prestigeCount: number;
  ascensionCount: number;
  labLevel: number;
  madnessLevel: number;
  dominantArchetype: string | null;
  clickCount: number;
  generatorsBought: number;
  upgradesBought: number;
  prestigesDone: number;
  researchesStarted: number;
  purchasedUpgrades: string[];
  completedResearch: string[];
  completedChallenges: string[];
  unlockedAchievements: string[];
  archetypeAffinities: Record<string, number>;
  generatorCounts: Record<string, number>;
  eventChoices: Record<string, number>;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

interface AnalyticsPayload {
  playerId: string;
  sessionId: string;
  events?: AnalyticsEvent[];
  snapshot?: SessionSnapshot;
}

export const config = { runtime: "edge" };

const MAX_EVENTS_PER_BATCH = 100;
const MAX_EVENT_DATA_SIZE = 2048; // bytes per event data
const RATE_LIMIT_SEC = 10; // 1 analytics batch per 10 seconds

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

  // ── Read body for HMAC ────────────────────────────────────────────
  const bodyText = await req.text();

  // ── Verify HMAC signature ─────────────────────────────────────────
  const sigResult = await verifySignature(req, bodyText, hmacSecret);
  if (!sigResult.valid) {
    return jsonResponse({ error: sigResult.error ?? "Unauthorized" }, 401, origin);
  }

  // ── Parse payload ─────────────────────────────────────────────────
  let payload: AnalyticsPayload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, origin);
  }

  // ── Validate identifiers ──────────────────────────────────────────
  if (!payload.playerId || !isValidUUID(payload.playerId)) {
    return jsonResponse({ error: "Invalid playerId" }, 400, origin);
  }
  if (!payload.sessionId || !isValidUUID(payload.sessionId)) {
    return jsonResponse({ error: "Invalid sessionId" }, 400, origin);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ── DB-backed rate limiting ───────────────────────────────────────
  const rlKey = `analytics:${payload.playerId}:${payload.sessionId}`;
  const { data: recentReq } = await supabase
    .from("rate_limits")
    .select("last_attempt")
    .eq("key", rlKey)
    .maybeSingle();

  if (recentReq) {
    const elapsed = (Date.now() - new Date(recentReq.last_attempt).getTime()) / 1000;
    if (elapsed < RATE_LIMIT_SEC) {
      return jsonResponse({ error: "Too many requests" }, 429, origin);
    }
  }

  await supabase.from("rate_limits").upsert(
    { key: rlKey, last_attempt: new Date().toISOString() },
    { onConflict: "key" }
  );

  // ── Insert batched events (server-side timestamps) ────────────────
  const now = new Date().toISOString();

  if (payload.events && Array.isArray(payload.events) && payload.events.length > 0) {
    const events = payload.events.slice(0, MAX_EVENTS_PER_BATCH);

    const rows = events
      .filter((e) => e.event && VALID_EVENT_TYPES.has(e.event))
      .map((e) => {
        // Cap event data size
        let data = e.data ?? {};
        if (JSON.stringify(data).length > MAX_EVENT_DATA_SIZE) {
          data = {}; // Drop oversized data
        }
        return {
          player_id: payload.playerId,
          session_id: payload.sessionId,
          event: e.event,
          data,
          created_at: now, // Server-side timestamp — ignore client ts
        };
      });

    if (rows.length > 0) {
      const { error: evError } = await supabase
        .from("analytics_events")
        .insert(rows);

      if (evError) {
        console.error("Analytics events insert error:", evError);
      }
    }
  }

  // ── Upsert session snapshot (validated) ───────────────────────────
  if (payload.snapshot) {
    const s = payload.snapshot;

    // Validate snapshot numeric fields
    const durationSec = clampFinite(s.durationSec, 0, 1e7) ?? 0;
    const totalRpLog10 = s.totalRpLog10 !== null ? (clampFinite(s.totalRpLog10, -10, 500) ?? null) : null;
    const prestigeCount = clampFinite(s.prestigeCount, 0, 1e6) ?? 0;
    const ascensionCount = clampFinite(s.ascensionCount, 0, 1e4) ?? 0;
    const labLevel = clampFinite(s.labLevel, 0, 50) ?? 0;
    const madnessLevel = clampFinite(s.madnessLevel, 0, 100) ?? 0;
    const clickCount = clampFinite(s.clickCount, 0, 1e9) ?? 0;
    const generatorsBought = clampFinite(s.generatorsBought, 0, 1e6) ?? 0;
    const upgradesBought = clampFinite(s.upgradesBought, 0, 1e4) ?? 0;
    const prestigesDone = clampFinite(s.prestigesDone, 0, 1e4) ?? 0;
    const researchesStarted = clampFinite(s.researchesStarted, 0, 1e4) ?? 0;

    // Validate archetype
    const dominantArchetype =
      s.dominantArchetype && VALID_ARCHETYPES.has(s.dominantArchetype)
        ? s.dominantArchetype
        : null;

    // Cap array lengths to prevent DB bloat
    const capArray = (arr: unknown, max: number): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter((v): v is string => typeof v === "string").slice(0, max);
    };

    // Cap object sizes
    const capRecord = (obj: unknown, max: number): Record<string, number> => {
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
      const entries = Object.entries(obj as Record<string, unknown>).slice(0, max);
      const result: Record<string, number> = {};
      for (const [k, v] of entries) {
        if (typeof v === "number" && isFinite(v)) {
          result[k.slice(0, 64)] = v; // Cap key length too
        }
      }
      return result;
    };

    const { error: snapError } = await supabase
      .from("analytics_sessions")
      .upsert(
        {
          player_id: payload.playerId,
          session_id: payload.sessionId,
          started_at: s.startedAt,
          ended_at: now,
          duration_sec: durationSec,
          total_rp_log10: totalRpLog10,
          prestige_count: prestigeCount,
          ascension_count: ascensionCount,
          lab_level: labLevel,
          madness_level: madnessLevel,
          dominant_archetype: dominantArchetype,
          click_count: clickCount,
          generators_bought: generatorsBought,
          upgrades_bought: upgradesBought,
          prestiges_done: prestigesDone,
          researches_started: researchesStarted,
          purchased_upgrades: capArray(s.purchasedUpgrades, 200),
          completed_research: capArray(s.completedResearch, 200),
          completed_challenges: capArray(s.completedChallenges, 100),
          unlocked_achievements: capArray(s.unlockedAchievements, 200),
          archetype_affinities: capRecord(s.archetypeAffinities, 10),
          generator_counts: capRecord(s.generatorCounts, 20),
          event_choices: capRecord(s.eventChoices, 50),
          platform: typeof s.platform === "string" ? s.platform.slice(0, 20) : "unknown",
          screen_width: clampFinite(s.screenWidth, 0, 10000) ?? 0,
          screen_height: clampFinite(s.screenHeight, 0, 10000) ?? 0,
          user_agent: typeof s.userAgent === "string" ? s.userAgent.slice(0, 200) : "",
        },
        { onConflict: "player_id,session_id" }
      );

    if (snapError) {
      console.error("Analytics session upsert error:", snapError);
      return jsonResponse({ error: "Snapshot save failed" }, 500, origin);
    }
  }

  return jsonResponse({ success: true }, 200, origin);
}
