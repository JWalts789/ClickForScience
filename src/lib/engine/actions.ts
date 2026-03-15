import { Decimal } from "../utils/decimal";
import type { GameState } from "./state";
import { GENERATORS } from "../data/generators.data";
import { getUpgradeDef, getPrestigeUpgradeDef } from "../data/upgrades.data";
import { awardGeneratorAffinity, awardUpgradeAffinity } from "./madness";
import {
  clickValue,
  generatorCost,
  generatorBulkCost,
  maxAffordable,
  breakthroughPointsOnPrestige,
  prestigeStartingRP,
  archetypeStartingRPMultiplier,
  PRESTIGE_MIN_BP,
} from "./formulas";
import { resetResearchOnPrestige } from "./research";
import { resetSpecializationOnPrestige } from "./specialization";
import {
  isClickingAllowed,
  isGeneratorAllowed,
  isGeneratorCapReached,
  areUpgradesAllowed,
  completeChallenge,
  isTimeLimitExceeded,
  getActiveRestrictions,
} from "./challenges";

/** Last challenge completed during prestige (read by store, cleared on read). */
let lastCompletedChallenge: string | null = null;

export function getLastCompletedChallenge(): string | null {
  const id = lastCompletedChallenge;
  lastCompletedChallenge = null;
  return id;
}

// ── Click Action ────────────────────────────────────────────────────

export function handleClick(state: GameState): void {
  // Challenge restriction: no clicking
  if (!isClickingAllowed(state)) return;

  const value = clickValue(state);
  state.rp = state.rp.add(value);
  state.totalRPThisRun = state.totalRPThisRun.add(value);
  state.totalRPAllTime = state.totalRPAllTime.add(value);
  state.clickCount = state.clickCount.add(1);
}

// ── Generator Purchase ──────────────────────────────────────────────

/**
 * Attempt to buy `amount` of a generator. If amount is -1, buy max affordable.
 * Returns true if purchase succeeded.
 */
export function purchaseGenerator(
  state: GameState,
  generatorId: string,
  amount: number
): boolean {
  const genIndex = GENERATORS.findIndex((g) => g.id === generatorId);
  if (genIndex === -1) return false;

  // Challenge restrictions
  if (!isGeneratorAllowed(state, generatorId)) return false;

  const def = GENERATORS[genIndex];
  const genState = state.generators[genIndex];

  // Challenge restriction: max generators cap
  if (isGeneratorCapReached(state, generatorId, genState.owned)) return false;

  // Resolve "max" purchases
  let count = amount;
  if (count === -1) {
    count = maxAffordable(def, genState.owned, state.rp);
  }
  if (count <= 0) return false;

  // Challenge restriction: clamp to maxGenerators cap
  for (const r of getActiveRestrictions(state)) {
    if (r.type === "maxGenerators") {
      const remaining = r.maxEach - genState.owned.toNumber();
      if (remaining <= 0) return false;
      count = Math.min(count, remaining);
    }
  }

  const cost = count === 1
    ? generatorCost(def, genState.owned)
    : generatorBulkCost(def, genState.owned, count);

  if (state.rp.lt(cost)) return false;

  state.rp = state.rp.sub(cost);
  genState.owned = genState.owned.add(count);

  // Track RP spent for Accidental Genius passive
  state.specialization.rpSpentOnGenerators = state.specialization.rpSpentOnGenerators.add(cost);

  // Award madness affinity based on generator's lean tags
  awardGeneratorAffinity(state, def.madnessLean, count);

  return true;
}

// ── Upgrade Purchase ────────────────────────────────────────────────

/**
 * Check if an upgrade is available for purchase.
 */
export function isUpgradeAvailable(state: GameState, upgradeId: string): boolean {
  // Already purchased?
  if (state.purchasedUpgrades.includes(upgradeId)) return false;

  const def = getUpgradeDef(upgradeId);
  if (!def) return false;

  // All prerequisites met?
  for (const req of def.requires) {
    if (!state.purchasedUpgrades.includes(req)) return false;
  }

  return true;
}

/**
 * Attempt to purchase an upgrade. Returns true if successful.
 */
export function purchaseUpgrade(state: GameState, upgradeId: string): boolean {
  if (!areUpgradesAllowed(state)) return false;
  if (!isUpgradeAvailable(state, upgradeId)) return false;

  const def = getUpgradeDef(upgradeId);
  if (!def) return false;

  if (state.rp.lt(def.cost)) return false;

  state.rp = state.rp.sub(def.cost);
  state.purchasedUpgrades.push(upgradeId);

  // Award madness affinity based on upgrade's madness tags
  awardUpgradeAffinity(state, def.madnessTags);

  return true;
}

// ── Prestige ────────────────────────────────────────────────────────

/**
 * Execute the "Snap Out of It" prestige. Returns the BP earned, or null
 * if prestige requirements weren't met.
 */
export function doPrestige(state: GameState): Decimal | null {
  const bpGain = breakthroughPointsOnPrestige(state);
  if (bpGain.lt(PRESTIGE_MIN_BP)) return null;

  // Check challenge time limit — can't prestige if time expired
  if (isTimeLimitExceeded(state)) return null;

  // Complete challenge if active (before resetting state)
  lastCompletedChallenge = completeChallenge(state);

  // Award BP
  state.bp = state.bp.add(bpGain);

  // Update prestige stats
  state.prestigeCount++;
  if (
    state.fastestPrestigeSec === null ||
    state.currentRunTimeSec < state.fastestPrestigeSec
  ) {
    state.fastestPrestigeSec = state.currentRunTimeSec;
  }

  // Reset run-specific state (apply starting RP bonus from prestige upgrades)
  const startRP = prestigeStartingRP(state).mul(archetypeStartingRPMultiplier(state));
  state.rp = startRP;
  state.totalRPThisRun = startRP;
  state.currentRunTimeSec = 0;

  // Reset generators (owned + produced, keep definitions)
  for (const gen of state.generators) {
    gen.owned = new Decimal(0);
    gen.totalProduced = new Decimal(0);
  }

  // Reset regular upgrades (prestige upgrades persist)
  state.purchasedUpgrades = [];

  // Reset run-specific research (permanent research persists)
  resetResearchOnPrestige(state);

  // Reset specialization (pick a different one each run)
  resetSpecializationOnPrestige(state);

  // Reset buffs
  state.activeBuffs = [];

  // Preserve: bp, ip, totalRPAllTime, totalIPAllTime, totalPlaytimeSec, clickCount,
  //           prestigeCount, prestigeUpgrades, completedResearch, madness, autobuyers, settings

  return bpGain;
}

// ── Prestige Upgrade Purchase ────────────────────────────────────────

export function isPrestigeUpgradeAvailable(state: GameState, upgradeId: string): boolean {
  if (state.prestigeUpgrades.includes(upgradeId)) return false;

  const def = getPrestigeUpgradeDef(upgradeId);
  if (!def) return false;

  for (const req of def.requires) {
    if (!state.prestigeUpgrades.includes(req)) return false;
  }

  return true;
}

export function purchasePrestigeUpgrade(state: GameState, upgradeId: string): boolean {
  if (!isPrestigeUpgradeAvailable(state, upgradeId)) return false;

  const def = getPrestigeUpgradeDef(upgradeId);
  if (!def) return false;

  if (state.bp.lt(def.cost)) return false;

  state.bp = state.bp.sub(def.cost);
  state.totalBPSpentAllTime = state.totalBPSpentAllTime.add(def.cost);
  state.prestigeUpgrades.push(upgradeId);
  return true;
}
