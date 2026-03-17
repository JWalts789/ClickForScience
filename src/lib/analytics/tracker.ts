// ── Analytics Tracker ──────────────────────────────────────────────────
// Client-side event batching and session snapshot reporting.
// Events are queued in memory and flushed every FLUSH_INTERVAL_MS,
// on page unload, and when the batch exceeds MAX_BATCH_SIZE.

import { getPlayerId } from "../leaderboard/identity";
import type { GameState } from "../engine/state";
import { ALL_ARCHETYPES } from "../engine/state";

// ── Config ────────────────────────────────────────────────────────────

const FLUSH_INTERVAL_MS = 30_000;    // Flush every 30s
const SNAPSHOT_INTERVAL_MS = 120_000; // Session snapshot every 2 min
const MAX_BATCH_SIZE = 100;          // Flush if queue exceeds this
const API_ENDPOINT = "/api/analytics";

// ── State ─────────────────────────────────────────────────────────────

interface QueuedEvent {
  event: string;
  data?: Record<string, unknown>;
  ts: number;
}

const sessionId = crypto.randomUUID();
const sessionStartedAt = new Date().toISOString();

let eventQueue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let snapshotTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

// Session-level counters (reset each session)
let sessionClicks = 0;
let sessionGensBought = 0;
let sessionUpgradesBought = 0;
let sessionPrestiges = 0;
let sessionResearches = 0;

// Reference to current game state (set by initAnalytics)
let getGameState: (() => GameState) | null = null;

// ── Public API ────────────────────────────────────────────────────────

/**
 * Initialize analytics tracking. Call once on app mount.
 * Pass a getter function that returns the current GameState.
 */
export function initAnalytics(stateGetter: () => GameState): void {
  if (initialized) return;
  initialized = true;
  getGameState = stateGetter;

  // Periodic flush
  flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);

  // Periodic session snapshot
  snapshotTimer = setInterval(sendSnapshot, SNAPSHOT_INTERVAL_MS);

  // Flush on page unload
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush();
      sendSnapshot();
    }
  });

  window.addEventListener("beforeunload", () => {
    flush();
    sendSnapshot();
  });

  // Track session start
  trackEvent("session_start", {
    platform: window.innerWidth <= 600 ? "mobile" : "desktop",
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    userAgent: navigator.userAgent.slice(0, 200),
  });
}

/**
 * Track a game event. Events are queued and sent in batches.
 */
export function trackEvent(
  event: string,
  data?: Record<string, unknown>
): void {
  if (!initialized) return;

  eventQueue.push({
    event,
    data,
    ts: Date.now(),
  });

  // Auto-flush if batch is large
  if (eventQueue.length >= MAX_BATCH_SIZE) {
    flush();
  }
}

/**
 * Increment session counters. Called from game actions.
 */
export function countClick(): void { sessionClicks++; }
export function countGenBuy(): void { sessionGensBought++; }
export function countUpgradeBuy(): void { sessionUpgradesBought++; }
export function countPrestige(): void { sessionPrestiges++; }
export function countResearch(): void { sessionResearches++; }

/**
 * Teardown — flush remaining events and stop timers.
 */
export function shutdownAnalytics(): void {
  flush();
  sendSnapshot();
  if (flushTimer) clearInterval(flushTimer);
  if (snapshotTimer) clearInterval(snapshotTimer);
  initialized = false;
}

// ── Internal ──────────────────────────────────────────────────────────

function flush(): void {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0); // Take all queued events
  const playerId = getPlayerId();

  // Use sendBeacon for reliability on page unload
  const payload = JSON.stringify({
    playerId,
    sessionId,
    events: batch,
  });

  if (document.visibilityState === "hidden") {
    navigator.sendBeacon(API_ENDPOINT, payload);
  } else {
    fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Silently fail — analytics should never break gameplay
    });
  }
}

function sendSnapshot(): void {
  if (!getGameState) return;

  const state = getGameState();
  const playerId = getPlayerId();
  const sessionDuration = (Date.now() - new Date(sessionStartedAt).getTime()) / 1000;

  // Compute log10 of totalRPAllTime safely
  let totalRpLog10: number | null = null;
  try {
    const rp = state.totalRPAllTime;
    if (rp.gt(0)) {
      totalRpLog10 = rp.log10().toNumber();
    }
  } catch {
    totalRpLog10 = null;
  }

  // Generator counts as {id: owned}
  const generatorCounts: Record<string, number> = {};
  for (const gen of state.generators) {
    if (gen.owned.gt(0)) {
      generatorCounts[gen.id] = gen.owned.toNumber();
    }
  }

  // Archetype affinities
  const archetypeAffinities: Record<string, number> = {};
  for (const arch of ALL_ARCHETYPES) {
    archetypeAffinities[arch] = state.madness.affinities[arch];
  }

  const snapshot = {
    sessionId,
    startedAt: sessionStartedAt,
    durationSec: sessionDuration,
    totalRpLog10,
    prestigeCount: state.prestigeCount,
    ascensionCount: state.ascensionCount,
    labLevel: state.labLevel,
    madnessLevel: state.madness.madnessLevel,
    dominantArchetype: state.madness.dominantArchetype,
    clickCount: sessionClicks,
    generatorsBought: sessionGensBought,
    upgradesBought: sessionUpgradesBought,
    prestigesDone: sessionPrestiges,
    researchesStarted: sessionResearches,
    purchasedUpgrades: state.purchasedUpgrades,
    completedResearch: [...state.completedResearch, ...state.runCompletedResearch],
    completedChallenges: state.completedChallenges,
    unlockedAchievements: state.unlockedAchievements,
    archetypeAffinities,
    generatorCounts,
    eventChoices: state.eventChoices,
    platform: window.innerWidth <= 600 ? "mobile" : "desktop",
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    userAgent: navigator.userAgent.slice(0, 200),
  };

  const payload = JSON.stringify({
    playerId,
    sessionId,
    snapshot,
  });

  if (document.visibilityState === "hidden") {
    navigator.sendBeacon(API_ENDPOINT, payload);
  } else {
    fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}
