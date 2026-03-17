// Vercel Edge Function — analytics event ingestion.
// Accepts batched events and session snapshots from the client.

import { createClient } from "@supabase/supabase-js";

interface AnalyticsEvent {
  event: string;
  data?: Record<string, unknown>;
  ts?: number; // client timestamp
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  let payload: AnalyticsPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!payload.playerId || !payload.sessionId) {
    return json({ error: "Missing playerId or sessionId" }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ── Insert batched events ──────────────────────────────────────────
  if (payload.events && payload.events.length > 0) {
    // Cap at 200 events per batch to prevent abuse
    const events = payload.events.slice(0, 200);

    const rows = events.map((e) => ({
      player_id: payload.playerId,
      session_id: payload.sessionId,
      event: e.event,
      data: e.data ?? {},
      created_at: e.ts ? new Date(e.ts).toISOString() : new Date().toISOString(),
    }));

    const { error: evError } = await supabase
      .from("analytics_events")
      .insert(rows);

    if (evError) {
      console.error("Analytics events insert error:", evError);
      // Don't fail the whole request — continue to snapshot
    }
  }

  // ── Upsert session snapshot ────────────────────────────────────────
  if (payload.snapshot) {
    const s = payload.snapshot;
    const { error: snapError } = await supabase
      .from("analytics_sessions")
      .upsert(
        {
          player_id: payload.playerId,
          session_id: s.sessionId,
          started_at: s.startedAt,
          ended_at: new Date().toISOString(),
          duration_sec: s.durationSec,
          total_rp_log10: s.totalRpLog10,
          prestige_count: s.prestigeCount,
          ascension_count: s.ascensionCount,
          lab_level: s.labLevel,
          madness_level: s.madnessLevel,
          dominant_archetype: s.dominantArchetype,
          click_count: s.clickCount,
          generators_bought: s.generatorsBought,
          upgrades_bought: s.upgradesBought,
          prestiges_done: s.prestigesDone,
          researches_started: s.researchesStarted,
          purchased_upgrades: s.purchasedUpgrades,
          completed_research: s.completedResearch,
          completed_challenges: s.completedChallenges,
          unlocked_achievements: s.unlockedAchievements,
          archetype_affinities: s.archetypeAffinities,
          generator_counts: s.generatorCounts,
          event_choices: s.eventChoices,
          platform: s.platform,
          screen_width: s.screenWidth,
          screen_height: s.screenHeight,
          user_agent: s.userAgent,
        },
        { onConflict: "player_id,session_id" }
      );

    if (snapError) {
      console.error("Analytics session upsert error:", snapError);
      return json({ error: "Snapshot save failed" }, 500);
    }
  }

  return json({ success: true }, 200);
}

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
