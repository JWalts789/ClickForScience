import { Decimal } from "../utils/decimal";
import type { GameState } from "./state";
import { RESEARCH_NODES, getResearchNodeDef } from "../data/research.data";
import type { ResearchNodeDef, ResearchEffect } from "../data/research.data";
import { totalProduction } from "./formulas";
import { achievementIPGainMultiplier } from "./achievements";
import { specIPGainMultiplier } from "./specialization";
import { labIPGainMultiplier, labResearchSpeedMultiplier } from "./lab-expansion";
import { challengeIPGainMultiplier } from "./challenges";
import { neighborhoodResearchSpeedMultiplier, neighborhoodResearchCostReduction, neighborhoodFreeIPPerSec } from "./neighborhood";
import { ascensionResearchSpeedMultiplier, ascensionIPGainMultiplier } from "./ascension";

// ── IP Generation ────────────────────────────────────────────────────

/**
 * Base IP earned per second: log10(RP/sec + 1).
 * Multiplied by IP gain multipliers from research + achievements.
 */
export function ipPerSecond(state: GameState): Decimal {
  const rpSec = totalProduction(state);
  // log10(x + 1) — always positive, scales nicely
  const base = rpSec.add(1).log10();
  return base.mul(ipGainMultiplier(state)).mul(achievementIPGainMultiplier(state)).mul(specIPGainMultiplier(state)).mul(labIPGainMultiplier(state)).mul(challengeIPGainMultiplier(state)).mul(ascensionIPGainMultiplier(state));
}

// ── Research Multiplier Queries ──────────────────────────────────────

/** Collect all effects from all completed research (both permanent and run). */
function allCompletedEffects(state: GameState): ResearchEffect[] {
  const effects: ResearchEffect[] = [];
  const allCompleted = [...state.completedResearch, ...state.runCompletedResearch];
  for (const nodeId of allCompleted) {
    const def = getResearchNodeDef(nodeId);
    if (!def) continue;
    for (const effect of def.effects) {
      effects.push(effect);
    }
  }
  return effects;
}

/** IP gain multiplier from completed research. */
export function ipGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allCompletedEffects(state)) {
    if (effect.type === "ipGainMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** Research speed multiplier from completed research + lab expansion. */
export function researchSpeedMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allCompletedEffects(state)) {
    if (effect.type === "researchSpeedMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult.mul(labResearchSpeedMultiplier(state)).mul(neighborhoodResearchSpeedMultiplier(state)).mul(ascensionResearchSpeedMultiplier(state));
}

/** Global production multiplier from completed research. */
export function researchGlobalMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allCompletedEffects(state)) {
    if (effect.type === "globalMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** Generator-specific multiplier from completed research. */
export function researchGeneratorMultiplier(state: GameState, genId: string): Decimal {
  let mult = new Decimal(1);
  for (const effect of allCompletedEffects(state)) {
    if (effect.type === "generatorMultiplier" && effect.target === genId) {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** Click multiplier from completed research. */
export function researchClickMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allCompletedEffects(state)) {
    if (effect.type === "clickMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** Click percent-of-production from completed research. */
export function researchClickProductionPercent(state: GameState): number {
  let total = 0;
  for (const effect of allCompletedEffects(state)) {
    if (effect.type === "clickPercentOfProduction") {
      total += effect.percent;
    }
  }
  return total;
}

/** BP gain multiplier from completed research. */
export function researchBPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allCompletedEffects(state)) {
    if (effect.type === "bpGainMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** Offline efficiency bonus from completed research. */
export function researchOfflineBonus(state: GameState): number {
  let bonus = 0;
  for (const effect of allCompletedEffects(state)) {
    if (effect.type === "offlineEfficiencyBonus") {
      bonus += effect.bonus;
    }
  }
  return bonus;
}

// ── Node Availability ────────────────────────────────────────────────

/** Check if a node is completed (either permanently or this run). */
export function isResearchComplete(state: GameState, nodeId: string): boolean {
  return (
    state.completedResearch.includes(nodeId) ||
    state.runCompletedResearch.includes(nodeId)
  );
}

/** Check if a research node's prerequisites are met and it's available to start. */
export function isResearchAvailable(state: GameState, nodeId: string): boolean {
  if (isResearchComplete(state, nodeId)) return false;

  const def = getResearchNodeDef(nodeId);
  if (!def) return false;

  // Check archetype requirement
  if (def.archetypeRequired && state.madness.dominantArchetype !== def.archetypeRequired) {
    return false;
  }

  // Check exclusive — if any exclusive node is completed, this one is blocked
  if (def.exclusive) {
    for (const excId of def.exclusive) {
      if (isResearchComplete(state, excId)) return false;
    }
  }

  // Check AND prerequisites
  for (const reqId of def.requires) {
    if (!isResearchComplete(state, reqId)) return false;
  }

  // Check OR prerequisites (if present, need at least one)
  if (def.requiresAny && def.requiresAny.length > 0) {
    const hasAny = def.requiresAny.some((reqId) => isResearchComplete(state, reqId));
    if (!hasAny) return false;
  }

  return true;
}

/** Check if a node is visible on the corkboard (available or has at least one prereq met). */
export function isResearchVisible(state: GameState, nodeId: string): boolean {
  if (isResearchComplete(state, nodeId)) return true;
  if (isResearchAvailable(state, nodeId)) return true;

  const def = getResearchNodeDef(nodeId);
  if (!def) return false;

  // Tier 1 nodes are always visible
  if (def.tier === 1) return true;

  // Visible if at least one prerequisite is completed
  for (const reqId of def.requires) {
    if (isResearchComplete(state, reqId)) return true;
  }
  if (def.requiresAny) {
    for (const reqId of def.requiresAny) {
      if (isResearchComplete(state, reqId)) return true;
    }
  }

  return false;
}

// ── Research Actions ─────────────────────────────────────────────────

/**
 * Start researching a node. Deducts IP cost.
 * Returns true if research was started.
 */
export function startResearch(state: GameState, nodeId: string): boolean {
  if (!isResearchAvailable(state, nodeId)) return false;
  if (state.activeResearch !== null) return false; // already researching

  const def = getResearchNodeDef(nodeId);
  if (!def) return false;

  const costReduction = 1 - neighborhoodResearchCostReduction(state);
  const cost = new Decimal(def.ipCost).mul(costReduction);
  if (state.ip.lt(cost)) return false;

  state.ip = state.ip.sub(cost);
  state.activeResearch = {
    nodeId,
    remainingSec: def.researchTimeSec,
  };

  return true;
}

/**
 * Cancel active research. Refunds 50% of IP cost.
 */
export function cancelResearch(state: GameState): boolean {
  if (!state.activeResearch) return false;

  const def = getResearchNodeDef(state.activeResearch.nodeId);
  if (def) {
    // Refund 50% of IP cost
    const refund = new Decimal(def.ipCost).mul(0.5).floor();
    state.ip = state.ip.add(refund);
  }

  state.activeResearch = null;
  return true;
}

/**
 * Tick active research by deltaSec (scaled by research speed multiplier).
 * If completed, moves node to the appropriate completion list.
 */
export function tickResearch(state: GameState, deltaSec: number): string | null {
  if (!state.activeResearch) return null;

  const speedMult = researchSpeedMultiplier(state).toNumber();
  state.activeResearch.remainingSec -= deltaSec * speedMult;

  if (state.activeResearch.remainingSec <= 0) {
    const completedNodeId = state.activeResearch.nodeId;
    const def = getResearchNodeDef(completedNodeId);

    if (def) {
      if (def.persistsOnPrestige) {
        state.completedResearch.push(completedNodeId);
      } else {
        state.runCompletedResearch.push(completedNodeId);
      }
    }

    state.activeResearch = null;
    return completedNodeId;
  }

  return null;
}

/**
 * Reset run-specific research on prestige.
 * Keeps completedResearch (permanent), clears runCompletedResearch and active.
 */
export function resetResearchOnPrestige(state: GameState): void {
  state.runCompletedResearch = [];
  state.activeResearch = null;
  // IP persists across prestige — it's a meta-currency
}
