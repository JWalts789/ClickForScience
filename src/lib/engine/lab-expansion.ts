import { Decimal } from "../utils/decimal";
import type { GameState } from "./state";
import { LAB_EXPANSIONS, MAX_LAB_LEVEL, getLabExpansionDef } from "../data/lab-expansions.data";

// ── Purchase ───────────────────────────────────────────────────────

/**
 * Check if the player can purchase the next lab expansion.
 */
export function canPurchaseLabExpansion(state: GameState): boolean {
  if (state.labLevel >= MAX_LAB_LEVEL) return false;
  const next = LAB_EXPANSIONS[state.labLevel + 1];
  if (!next) return false;
  return state.ip.gte(next.ipCost);
}

/**
 * Purchase the next lab expansion. Deducts IP.
 */
export function purchaseLabExpansion(state: GameState): boolean {
  if (state.labLevel >= MAX_LAB_LEVEL) return false;
  const next = LAB_EXPANSIONS[state.labLevel + 1];
  if (!next) return false;
  if (state.ip.lt(next.ipCost)) return false;

  state.ip = state.ip.sub(next.ipCost);
  state.labLevel = next.level;
  return true;
}

// ── Multiplier Queries ─────────────────────────────────────────────

/** Global production multiplier from current lab level. */
export function labGlobalMultiplier(state: GameState): Decimal {
  const def = getLabExpansionDef(state.labLevel);
  if (!def) return new Decimal(1);
  let mult = new Decimal(1);
  for (const effect of def.effects) {
    if (effect.type === "globalMultiplier") {
      mult = mult.mul(effect.value);
    }
  }
  return mult;
}

/** IP gain multiplier from current lab level. */
export function labIPGainMultiplier(state: GameState): Decimal {
  const def = getLabExpansionDef(state.labLevel);
  if (!def) return new Decimal(1);
  let mult = new Decimal(1);
  for (const effect of def.effects) {
    if (effect.type === "ipGainMultiplier") {
      mult = mult.mul(effect.value);
    }
  }
  return mult;
}

/** Research speed multiplier from current lab level. */
export function labResearchSpeedMultiplier(state: GameState): Decimal {
  const def = getLabExpansionDef(state.labLevel);
  if (!def) return new Decimal(1);
  let mult = new Decimal(1);
  for (const effect of def.effects) {
    if (effect.type === "researchSpeedMultiplier") {
      mult = mult.mul(effect.value);
    }
  }
  return mult;
}

/** Offline efficiency bonus from current lab level. */
export function labOfflineBonus(state: GameState): number {
  const def = getLabExpansionDef(state.labLevel);
  if (!def) return 0;
  let bonus = 0;
  for (const effect of def.effects) {
    if (effect.type === "offlineEfficiencyBonus") {
      bonus += effect.value;
    }
  }
  return bonus;
}
