import { Decimal } from "../utils/decimal";
import type { GameState } from "./state";
import { createInitialState } from "./state";
import { ASCENSION_UPGRADES, getAscensionUpgradeDef } from "../data/ascension.data";
import type { AscensionEffectType } from "../data/ascension.data";

// ── TP Formula ──────────────────────────────────────────────────────

/**
 * Calculate Thesis Points earned on ascension.
 * Formula: floor(sqrt(totalBPSpentAllTime / 1000)) * tpGainMultiplier
 */
export function thesisPointsOnAscension(state: GameState): Decimal {
  const raw = state.totalBPSpentAllTime.div(1000).max(0).sqrt().floor();
  const earned = Decimal.max(0, raw.sub(state.tp));
  // Apply thesis boost from ascension upgrades
  return earned.mul(ascensionTPMultiplier(state)).floor();
}

/** TP gain multiplier from ascension upgrades (thesis_boost effect reuses bpFormulaMultiplier). */
function ascensionTPMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.ascensionUpgrades) {
    const def = getAscensionUpgradeDef(uid);
    if (!def) continue;
    // The "asc_thesis_boost" uses bpFormulaMultiplier type for TP gain
    if (uid === "asc_thesis_boost") {
      for (const e of def.effects) {
        mult = mult.mul(e.value);
      }
    }
  }
  return mult;
}

// ── Ascension Queries ───────────────────────────────────────────────

/** Minimum TP to ascend. */
export const ASCENSION_MIN_TP = new Decimal(1);

/** Check if the player can ascend (has enough TP to gain, has Underground Facility). */
export function canAscend(state: GameState): boolean {
  if (state.labLevel < 3) return false; // Requires Underground Facility
  return thesisPointsOnAscension(state).gte(ASCENSION_MIN_TP);
}

/** Check if an ascension upgrade is available for purchase. */
export function isAscensionUpgradeAvailable(state: GameState, upgradeId: string): boolean {
  if (state.ascensionUpgrades.includes(upgradeId)) return false;
  const def = getAscensionUpgradeDef(upgradeId);
  if (!def) return false;
  for (const req of def.requires) {
    if (!state.ascensionUpgrades.includes(req)) return false;
  }
  return true;
}

/** Purchase an ascension upgrade. */
export function purchaseAscensionUpgrade(state: GameState, upgradeId: string): boolean {
  if (!isAscensionUpgradeAvailable(state, upgradeId)) return false;
  const def = getAscensionUpgradeDef(upgradeId);
  if (!def) return false;
  if (state.tp.lt(def.cost)) return false;

  state.tp = state.tp.sub(def.cost);
  state.ascensionUpgrades.push(upgradeId);
  return true;
}

// ── Ascension Reset ─────────────────────────────────────────────────

/**
 * Execute ascension. Resets BP, prestige upgrades, research, lab level, specialization.
 * Persists: TP, ascension upgrades, challenges, achievements, NPC relationships, madness, all-time stats.
 */
export function doAscension(state: GameState): Decimal | null {
  const tpGain = thesisPointsOnAscension(state);
  if (tpGain.lt(ASCENSION_MIN_TP)) return null;
  if (state.labLevel < 3) return null;

  // Award TP
  state.tp = state.tp.add(tpGain);
  state.ascensionCount++;

  // Determine starting lab level from ascension upgrades
  const startLabLevel = ascensionStartingLabLevel(state);

  // Preserve these across ascension
  const preserved = {
    tp: state.tp,
    ascensionCount: state.ascensionCount,
    ascensionUpgrades: [...state.ascensionUpgrades],
    totalBPSpentAllTime: state.totalBPSpentAllTime,
    completedChallenges: [...state.completedChallenges],
    unlockedAchievements: [...state.unlockedAchievements],
    relationships: { ...state.relationships },
    favorCooldowns: { ...state.favorCooldowns },
    madness: { ...state.madness },
    totalRPAllTime: state.totalRPAllTime,
    totalIPAllTime: state.totalIPAllTime,
    totalPlaytimeSec: state.totalPlaytimeSec,
    clickCount: state.clickCount,
    settings: { ...state.settings },
    autobuyers: { ...state.autobuyers },
    unlockedNotes: [...state.unlockedNotes],
    triggeredEvents: [...state.triggeredEvents],
    eventChoices: { ...state.eventChoices },
  };

  // Reset to fresh state
  const fresh = createInitialState();

  // Apply fresh state
  state.version = fresh.version;
  state.rp = fresh.rp;
  state.totalRPThisRun = fresh.totalRPThisRun;
  state.bp = new Decimal(ascensionStartingBP(state));
  state.ip = fresh.ip;
  state.generators = fresh.generators;
  state.purchasedUpgrades = [];
  state.prestigeCount = 0;
  state.prestigeUpgrades = [];
  state.completedResearch = [];
  state.runCompletedResearch = [];
  state.activeResearch = null;
  state.specialization = fresh.specialization;
  state.labLevel = startLabLevel;
  state.activeChallenge = null;
  state.activeBuffs = [];
  state.lastSaveTimestamp = Date.now();
  state.fastestPrestigeSec = null;
  state.currentRunTimeSec = 0;

  // Restore preserved
  state.tp = preserved.tp;
  state.ascensionCount = preserved.ascensionCount;
  state.ascensionUpgrades = preserved.ascensionUpgrades;
  state.totalBPSpentAllTime = preserved.totalBPSpentAllTime;
  state.completedChallenges = preserved.completedChallenges;
  state.unlockedAchievements = preserved.unlockedAchievements;
  state.relationships = preserved.relationships;
  state.favorCooldowns = preserved.favorCooldowns;
  state.madness = preserved.madness;
  state.totalRPAllTime = preserved.totalRPAllTime;
  state.totalIPAllTime = preserved.totalIPAllTime;
  state.totalPlaytimeSec = preserved.totalPlaytimeSec;
  state.clickCount = preserved.clickCount;
  state.settings = preserved.settings;
  state.autobuyers = preserved.autobuyers;
  state.unlockedNotes = preserved.unlockedNotes;
  state.triggeredEvents = preserved.triggeredEvents;
  state.eventChoices = preserved.eventChoices;

  return tpGain;
}

// ── Ascension Effect Queries ────────────────────────────────────────

/** Collect all effect values of a specific type from owned ascension upgrades. */
function collectEffects(state: GameState, type: AscensionEffectType): number[] {
  const values: number[] = [];
  for (const uid of state.ascensionUpgrades) {
    const def = getAscensionUpgradeDef(uid);
    if (!def) continue;
    for (const e of def.effects) {
      if (e.type === type) values.push(e.value);
    }
  }
  return values;
}

/** Global production multiplier from ascension upgrades. */
export function ascensionGlobalMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const v of collectEffects(state, "globalMultiplier")) {
    mult = mult.mul(v);
  }
  return mult;
}

/** Click multiplier from ascension upgrades. */
export function ascensionClickMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const v of collectEffects(state, "clickMultiplier")) {
    mult = mult.mul(v);
  }
  return mult;
}

/** Research speed multiplier from ascension upgrades. */
export function ascensionResearchSpeedMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const v of collectEffects(state, "researchSpeedMultiplier")) {
    mult = mult.mul(v);
  }
  return mult;
}

/** IP gain multiplier from ascension upgrades. */
export function ascensionIPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const v of collectEffects(state, "ipGainMultiplier")) {
    mult = mult.mul(v);
  }
  return mult;
}

/** BP gain multiplier from ascension upgrades (bpFormulaMultiplier, excluding thesis boost). */
export function ascensionBPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.ascensionUpgrades) {
    if (uid === "asc_thesis_boost") continue; // This is for TP, not BP
    const def = getAscensionUpgradeDef(uid);
    if (!def) continue;
    for (const e of def.effects) {
      if (e.type === "bpFormulaMultiplier") mult = mult.mul(e.value);
    }
  }
  return mult;
}

/** Offline efficiency bonus from ascension upgrades. */
export function ascensionOfflineBonus(state: GameState): number {
  return collectEffects(state, "offlineEfficiencyBonus").reduce((sum, v) => sum + v, 0);
}

/** Generator cost reduction from ascension upgrades (0 to 1). */
export function ascensionGeneratorCostReduction(state: GameState): number {
  return collectEffects(state, "generatorCostReduction").reduce((sum, v) => sum + v, 0);
}

/** Prestige upgrade cost reduction from ascension upgrades (0 to 1). */
export function ascensionPrestigeUpgradeCostReduction(state: GameState): number {
  return collectEffects(state, "prestigeUpgradeCostReduction").reduce((sum, v) => sum + v, 0);
}

/** Archetype bonus multiplier from ascension. */
export function ascensionArchetypeMultiplier(state: GameState): number {
  const values = collectEffects(state, "archetypeBonusMultiplier");
  return values.reduce((mult, v) => mult * v, 1);
}

/** Starting lab level from ascension upgrades (take max). */
export function ascensionStartingLabLevel(state: GameState): number {
  const values = collectEffects(state, "startingLabLevel");
  return values.length > 0 ? Math.max(...values) : 0;
}

/** Autobuyer speed multiplier from ascension upgrades. */
export function ascensionAutobuyerSpeed(state: GameState): number {
  const values = collectEffects(state, "autobuyerSpeed");
  return values.reduce((mult, v) => mult * v, 1);
}

/** Challenge reward multiplier from ascension upgrades. */
export function ascensionChallengeRewardMultiplier(state: GameState): number {
  const values = collectEffects(state, "challengeRewardMultiplier");
  return values.reduce((mult, v) => mult * v, 1);
}

/** Neighborhood bonus multiplier from ascension upgrades. */
export function ascensionNeighborhoodMultiplier(state: GameState): number {
  const values = collectEffects(state, "neighborhoodBonusMultiplier");
  return values.reduce((mult, v) => mult * v, 1);
}

/** Starting BP from ascension upgrades. */
export function ascensionStartingBP(state: GameState): number {
  return collectEffects(state, "startingBP").reduce((sum, v) => sum + v, 0);
}
