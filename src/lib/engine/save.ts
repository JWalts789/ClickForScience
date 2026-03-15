import { Decimal } from "../utils/decimal";
import type { GameState, GeneratorState, TimedBuff } from "./state";
import { createInitialState, CURRENT_SAVE_VERSION } from "./state";
import LZString from "lz-string";

const SAVE_KEY = "clickforscience_save";

// ── Serialization Helpers ───────────────────────────────────────────

/** Convert Decimals to strings for JSON. */
export function serializeState(state: GameState): string {
  const plain = {
    ...state,
    rp: state.rp.toString(),
    totalRPThisRun: state.totalRPThisRun.toString(),
    totalRPAllTime: state.totalRPAllTime.toString(),
    bp: state.bp.toString(),
    ip: state.ip.toString(),
    totalIPAllTime: state.totalIPAllTime.toString(),
    clickCount: state.clickCount.toString(),
    tp: state.tp.toString(),
    totalBPSpentAllTime: state.totalBPSpentAllTime.toString(),
    generators: state.generators.map((g) => ({
      id: g.id,
      owned: g.owned.toString(),
      totalProduced: g.totalProduced.toString(),
    })),
    activeBuffs: state.activeBuffs.map((b) => ({
      ...b,
      multiplier: b.multiplier.toString(),
    })),
    specialization: {
      ...state.specialization,
      generator: state.specialization.generator
        ? {
            id: state.specialization.generator.id,
            owned: state.specialization.generator.owned.toString(),
            totalProduced: state.specialization.generator.totalProduced.toString(),
          }
        : null,
      rpSpentOnGenerators: state.specialization.rpSpentOnGenerators.toString(),
      rpRecovered: state.specialization.rpRecovered.toString(),
      peakRPPerSec: state.specialization.peakRPPerSec.toString(),
    },
  };
  return JSON.stringify(plain);
}

/** Restore Decimals from parsed JSON. */
export function deserializeState(raw: string): GameState {
  const parsed = JSON.parse(raw);
  const fresh = createInitialState();

  // Version migration — add cases as version bumps
  const version = parsed.version ?? 1;

  return {
    version: CURRENT_SAVE_VERSION,

    rp: new Decimal(parsed.rp ?? 0),
    totalRPThisRun: new Decimal(parsed.totalRPThisRun ?? 0),
    totalRPAllTime: new Decimal(parsed.totalRPAllTime ?? 0),
    bp: new Decimal(parsed.bp ?? 0),
    ip: new Decimal(parsed.ip ?? 0),
    totalIPAllTime: new Decimal(parsed.totalIPAllTime ?? 0),

    generators: fresh.generators.map((freshGen) => {
      const saved = (parsed.generators as any[])?.find(
        (g: any) => g.id === freshGen.id
      );
      if (saved) {
        return {
          id: freshGen.id,
          owned: new Decimal(saved.owned ?? 0),
          totalProduced: new Decimal(saved.totalProduced ?? 0),
        } satisfies GeneratorState;
      }
      return freshGen;
    }),

    purchasedUpgrades: parsed.purchasedUpgrades ?? [],
    prestigeCount: parsed.prestigeCount ?? 0,
    prestigeUpgrades: parsed.prestigeUpgrades ?? [],

    completedResearch: parsed.completedResearch ?? [],
    runCompletedResearch: parsed.runCompletedResearch ?? [],
    activeResearch: parsed.activeResearch ?? null,

    unlockedAchievements: parsed.unlockedAchievements ?? [],

    autobuyers: {
      enabled: parsed.autobuyers?.enabled ?? {},
      reservePercent: parsed.autobuyers?.reservePercent ?? 0,
    },

    labLevel: parsed.labLevel ?? 0,

    activeChallenge: parsed.activeChallenge ?? null,
    completedChallenges: parsed.completedChallenges ?? [],

    tp: new Decimal(parsed.tp ?? 0),
    ascensionCount: parsed.ascensionCount ?? 0,
    ascensionUpgrades: parsed.ascensionUpgrades ?? [],
    totalBPSpentAllTime: new Decimal(parsed.totalBPSpentAllTime ?? 0),

    relationships: parsed.relationships ?? {},
    favorCooldowns: parsed.favorCooldowns ?? {},

    specialization: {
      archetype: parsed.specialization?.archetype ?? null,
      generator: parsed.specialization?.generator
        ? {
            id: parsed.specialization.generator.id,
            owned: new Decimal(parsed.specialization.generator.owned ?? 0),
            totalProduced: new Decimal(parsed.specialization.generator.totalProduced ?? 0),
          }
        : null,
      purchasedUpgrades: parsed.specialization?.purchasedUpgrades ?? [],
      rpSpentOnGenerators: new Decimal(parsed.specialization?.rpSpentOnGenerators ?? 0),
      rpRecovered: new Decimal(parsed.specialization?.rpRecovered ?? 0),
      peakRPPerSec: new Decimal(parsed.specialization?.peakRPPerSec ?? 0),
    },

    madness: {
      affinities: { ...fresh.madness.affinities, ...(parsed.madness?.affinities ?? {}) },
      dominantArchetype: parsed.madness?.dominantArchetype ?? null,
      madnessLevel: parsed.madness?.madnessLevel ?? 0,
    },

    triggeredEvents: parsed.triggeredEvents ?? [],
    eventChoices: parsed.eventChoices ?? {},
    activeBuffs: (parsed.activeBuffs ?? []).map((b: any) => ({
      id: b.id,
      multiplier: new Decimal(b.multiplier ?? 1),
      target: b.target ?? "all",
      remainingSeconds: b.remainingSeconds ?? 0,
    })) as TimedBuff[],

    unlockedNotes: parsed.unlockedNotes ?? [],

    lastSaveTimestamp: parsed.lastSaveTimestamp ?? Date.now(),
    totalPlaytimeSec: parsed.totalPlaytimeSec ?? 0,
    fastestPrestigeSec: parsed.fastestPrestigeSec ?? null,
    currentRunTimeSec: parsed.currentRunTimeSec ?? 0,
    clickCount: new Decimal(parsed.clickCount ?? 0),

    settings: { ...fresh.settings, ...(parsed.settings ?? {}) },
  };
}

// ── Public API ──────────────────────────────────────────────────────

export function saveGame(state: GameState): void {
  state.lastSaveTimestamp = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, serializeState(state));
  } catch (e) {
    console.error("Failed to save game:", e);
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return deserializeState(raw);
  } catch (e) {
    console.error("Failed to load save:", e);
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function exportSave(state: GameState): string {
  state.lastSaveTimestamp = Date.now();
  return LZString.compressToBase64(serializeState(state));
}

export function importSave(encoded: string): GameState | null {
  try {
    const raw = LZString.decompressFromBase64(encoded);
    if (!raw) return null;
    return deserializeState(raw);
  } catch (e) {
    console.error("Failed to import save:", e);
    return null;
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}
