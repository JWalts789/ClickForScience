import { Decimal } from "../utils/decimal";
import type { DecimalSource } from "../utils/decimal";
import type { GameState, TimedBuff } from "./state";
import { GENERATORS, MILESTONES } from "../data/generators.data";
import type { GeneratorDef } from "../data/generators.data";
import { getUpgradeDef, getPrestigeUpgradeDef } from "../data/upgrades.data";
import {
  researchGlobalMultiplier,
  researchGeneratorMultiplier,
  researchClickMultiplier,
  researchClickProductionPercent,
  researchBPGainMultiplier,
  researchOfflineBonus,
} from "./research";
import {
  achievementGlobalMultiplier,
  achievementGeneratorMultiplier,
  achievementClickMultiplier,
  achievementBPGainMultiplier,
  achievementOfflineBonus,
} from "./achievements";
import {
  specGlobalMultiplier,
  specGeneratorMultiplier,
  specClickMultiplier,
  specBPGainMultiplier,
  cascadeMultipliers,
  perfectRampMultiplier,
  gadgeteerCostMultiplier,
  specGeneratorProduction,
  totalGeneratorsOwned,
} from "./specialization";
import { labGlobalMultiplier, labOfflineBonus } from "./lab-expansion";
import {
  challengeGlobalMultiplier,
  challengeGeneratorMultiplier,
  challengeClickMultiplier,
  challengeBPGainMultiplier,
  challengeOfflineBonus,
  challengeMilestoneMultiplier,
} from "./challenges";
import {
  neighborhoodGlobalMultiplier,
  neighborhoodClickMultiplier,
  neighborhoodCostReduction,
  neighborhoodOfflineBonus,
} from "./neighborhood";
import {
  ascensionGlobalMultiplier,
  ascensionClickMultiplier,
  ascensionBPGainMultiplier,
  ascensionOfflineBonus,
  ascensionGeneratorCostReduction,
} from "./ascension";

// ── Generator Costs ─────────────────────────────────────────────────

/**
 * Cost to buy the Nth generator (0-indexed: if you own `owned`, this is the
 * cost of the next one).
 */
export function generatorCost(def: GeneratorDef, owned: DecimalSource, state?: GameState): Decimal {
  const base = def.baseCost.mul(Decimal.pow(def.costGrowthRate, owned));
  if (state) {
    const costReduction = 1 - neighborhoodCostReduction(state) - ascensionGeneratorCostReduction(state);
    return base.mul(gadgeteerCostMultiplier(state)).mul(Math.max(0.1, costReduction));
  }
  return base;
}

/**
 * Total cost to buy `count` generators starting from `owned`.
 * Uses the geometric series sum: baseCost * r^owned * (r^count - 1) / (r - 1)
 */
export function generatorBulkCost(
  def: GeneratorDef,
  owned: DecimalSource,
  count: number
): Decimal {
  if (count <= 0) return new Decimal(0);
  if (count === 1) return generatorCost(def, owned);

  const r = def.costGrowthRate;
  const firstCost = generatorCost(def, owned);
  return firstCost.mul(
    Decimal.pow(r, count).sub(1).div(r - 1)
  );
}

/**
 * Maximum number of a generator the player can afford given current RP.
 *
 * Derived analytically from the geometric series:
 *   totalCost(n) = firstCost * (r^n - 1) / (r - 1)
 * Solving for n:
 *   n = floor( log_r( rp * (r-1) / firstCost + 1 ) )
 */
export function maxAffordable(
  def: GeneratorDef,
  owned: DecimalSource,
  rp: DecimalSource
): number {
  const rpDec = new Decimal(rp);
  const firstCost = generatorCost(def, owned);

  // Can't afford even 1?
  if (rpDec.lt(firstCost)) return 0;

  const r = def.costGrowthRate;
  // n = floor( log( rp * (r-1) / firstCost + 1 ) / log(r) )
  const inner = rpDec.mul(r - 1).div(firstCost).add(1);
  const n = inner.log(r).floor().toNumber();

  // Clamp to at least 1 (we already checked affordability above)
  return Math.max(1, n);
}

// ── Milestone Multiplier ────────────────────────────────────────────

/**
 * Calculate the cumulative milestone multiplier for a generator based on
 * how many are owned.
 */
export function milestoneMultiplier(owned: DecimalSource, state?: GameState): Decimal {
  const count = new Decimal(owned).toNumber();
  let mult = new Decimal(1);
  for (const m of MILESTONES) {
    if (count >= m.count) {
      mult = mult.mul(m.multiplier);
    }
  }
  // Challenge reward: milestone multiplier boost
  if (state) {
    mult = mult.mul(challengeMilestoneMultiplier(state));
  }
  return mult;
}

// ── Multiplier Sources ──────────────────────────────────────────────

/**
 * Get the active buff multiplier for a specific target.
 */
function buffMultiplier(buffs: TimedBuff[], target: string): Decimal {
  let mult = new Decimal(1);
  for (const buff of buffs) {
    if (buff.target === "all" || buff.target === target) {
      mult = mult.mul(buff.multiplier);
    }
  }
  return mult;
}

/**
 * Get the total upgrade multiplier for a specific generator.
 * Scans purchasedUpgrades for generatorMultiplier effects targeting this gen.
 */
function upgradeMultiplier(state: GameState, genId: string): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.purchasedUpgrades) {
    const def = getUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "generatorMultiplier" && effect.target === genId) {
        mult = mult.mul(effect.multiplier);
      }
    }
  }
  return mult;
}

/**
 * Get the global upgrade multiplier (applies to all generators).
 */
function globalUpgradeMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.purchasedUpgrades) {
    const def = getUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "globalMultiplier") {
        mult = mult.mul(effect.multiplier);
      }
    }
  }
  return mult;
}

/**
 * Get click-specific upgrade multiplier.
 */
function clickUpgradeMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.purchasedUpgrades) {
    const def = getUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "clickMultiplier") {
        mult = mult.mul(effect.multiplier);
      }
    }
  }
  return mult;
}

/**
 * Get the "% of production per click" bonus from upgrades.
 */
function clickProductionPercent(state: GameState): number {
  let total = 0;
  for (const uid of state.purchasedUpgrades) {
    const def = getUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "clickPercentOfProduction") {
        total += effect.percent;
      }
    }
  }
  return total;
}

// ── Prestige Multiplier Sources ──────────────────────────────────────

/**
 * Global production multiplier from prestige upgrades.
 */
function prestigeGlobalMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.prestigeUpgrades) {
    const def = getPrestigeUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "globalMultiplier") {
        mult = mult.mul(effect.multiplier);
      }
    }
  }
  return mult;
}

/**
 * Click multiplier from prestige upgrades.
 */
function prestigeClickMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.prestigeUpgrades) {
    const def = getPrestigeUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "clickMultiplier") {
        mult = mult.mul(effect.multiplier);
      }
    }
  }
  return mult;
}

/**
 * Generator-specific multiplier from prestige upgrades.
 */
function prestigeGeneratorMultiplier(state: GameState, genId: string): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.prestigeUpgrades) {
    const def = getPrestigeUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "generatorMultiplier" && effect.target === genId) {
        mult = mult.mul(effect.multiplier);
      }
    }
  }
  return mult;
}

/**
 * BP gain multiplier from prestige upgrades.
 */
export function bpGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const uid of state.prestigeUpgrades) {
    const def = getPrestigeUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "bpGainMultiplier") {
        mult = mult.mul(effect.multiplier);
      }
    }
  }
  return mult;
}

/**
 * Offline efficiency bonus from prestige upgrades + research (added to base 50%).
 */
export function prestigeOfflineBonus(state: GameState): number {
  let bonus = 0;
  for (const uid of state.prestigeUpgrades) {
    const def = getPrestigeUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "offlineEfficiencyBonus") {
        bonus += effect.bonus;
      }
    }
  }
  return bonus + researchOfflineBonus(state) + achievementOfflineBonus(state) + labOfflineBonus(state) + challengeOfflineBonus(state) + neighborhoodOfflineBonus(state) + ascensionOfflineBonus(state);
}

/**
 * Starting RP from prestige upgrades (applied after prestige reset).
 */
export function prestigeStartingRP(state: GameState): Decimal {
  let total = new Decimal(0);
  for (const uid of state.prestigeUpgrades) {
    const def = getPrestigeUpgradeDef(uid);
    if (!def) continue;
    for (const effect of def.effects) {
      if (effect.type === "startingRP") {
        total = total.add(effect.amount);
      }
    }
  }
  return total;
}

// ── Madness Archetype Bonuses ────────────────────────────────────────

/**
 * Production multiplier from dominant archetype.
 */
function archetypeProductionMultiplier(state: GameState): Decimal {
  const arch = state.madness.dominantArchetype;
  if (arch === "perfectionist") return new Decimal(1.15);
  if (arch === "unhinged") return new Decimal(1.25);
  return new Decimal(1);
}

/**
 * Click multiplier from dominant archetype.
 */
function archetypeClickMultiplier(state: GameState): Decimal {
  const arch = state.madness.dominantArchetype;
  if (arch === "gadgeteer") return new Decimal(1.2);
  if (arch === "unhinged") return new Decimal(0.9); // trade-off for production bonus
  return new Decimal(1);
}

/**
 * BP gain multiplier from dominant archetype.
 */
export function archetypeBPMultiplier(state: GameState): Decimal {
  if (state.madness.dominantArchetype === "megalomaniac") return new Decimal(1.2);
  return new Decimal(1);
}

/**
 * Offline efficiency bonus from dominant archetype.
 */
export function archetypeOfflineBonus(state: GameState): number {
  if (state.madness.dominantArchetype === "accidentalGenius") return 0.1;
  return 0;
}

/**
 * Starting RP multiplier from dominant archetype.
 */
export function archetypeStartingRPMultiplier(state: GameState): Decimal {
  if (state.madness.dominantArchetype === "realityBreaker") return new Decimal(1.2);
  return new Decimal(1);
}

// ── Production Pipeline ─────────────────────────────────────────────

/**
 * Production per second for a single generator.
 *
 * Pipeline: base * owned * milestone * buffs * upgrades * globalUpgrades
 * Each multiplier source is a separate function for easy extension.
 */
export function generatorProduction(
  state: GameState,
  genIndex: number
): Decimal {
  const def = GENERATORS[genIndex];
  const genState = state.generators[genIndex];
  if (!def || !genState || genState.owned.eq(0)) return new Decimal(0);

  const base = def.baseProduction.mul(genState.owned);

  let result = base
    .mul(milestoneMultiplier(genState.owned, state))
    .mul(buffMultiplier(state.activeBuffs, def.id))
    .mul(upgradeMultiplier(state, def.id))
    .mul(globalUpgradeMultiplier(state))
    .mul(prestigeGlobalMultiplier(state))
    .mul(prestigeGeneratorMultiplier(state, def.id))
    .mul(archetypeProductionMultiplier(state))
    .mul(researchGlobalMultiplier(state))
    .mul(researchGeneratorMultiplier(state, def.id))
    .mul(achievementGlobalMultiplier(state))
    .mul(achievementGeneratorMultiplier(state, def.id))
    .mul(specGlobalMultiplier(state))
    .mul(specGeneratorMultiplier(state, def.id))
    .mul(labGlobalMultiplier(state))
    .mul(challengeGlobalMultiplier(state))
    .mul(challengeGeneratorMultiplier(state, def.id))
    .mul(neighborhoodGlobalMultiplier(state))
    .mul(ascensionGlobalMultiplier(state));

  // Specialization passive: Megalomaniac cascade boost
  if (state.specialization.archetype === "megalomaniac") {
    const cascades = cascadeMultipliers(state);
    result = result.mul(cascades[genIndex]);
  }

  // Specialization passive: Perfectionist ramp
  if (state.specialization.archetype === "perfectionist") {
    result = result.mul(perfectRampMultiplier(state));
  }

  return result;
}

/**
 * Total RP/sec from all generators.
 */
export function totalProduction(state: GameState): Decimal {
  let total = new Decimal(0);
  for (let i = 0; i < GENERATORS.length; i++) {
    total = total.add(generatorProduction(state, i));
  }
  // Add specialization generator production
  total = total.add(specGeneratorProduction(state));
  return total;
}

// ── Click Value Pipeline ────────────────────────────────────────────

/**
 * Value of a single click.
 *
 * Pipeline: (base * buffs * clickUpgrades) + (production% bonus)
 */
export function clickValue(state: GameState): Decimal {
  const base = new Decimal(1);

  let value = base
    .mul(buffMultiplier(state.activeBuffs, "click"))
    .mul(clickUpgradeMultiplier(state))
    .mul(prestigeClickMultiplier(state))
    .mul(archetypeClickMultiplier(state))
    .mul(researchClickMultiplier(state))
    .mul(achievementClickMultiplier(state))
    .mul(specClickMultiplier(state))
    .mul(challengeClickMultiplier(state))
    .mul(neighborhoodClickMultiplier(state))
    .mul(ascensionClickMultiplier(state));

  // Add percentage-of-production bonus (from upgrades + research)
  const pct = clickProductionPercent(state) + researchClickProductionPercent(state);
  if (pct > 0) {
    value = value.add(totalProduction(state).mul(pct / 100));
  }

  return value;
}

// ── Buff Ticking ────────────────────────────────────────────────────

/**
 * Advance all timed buffs by deltaSec, removing expired ones.
 */
export function tickBuffs(buffs: TimedBuff[], deltaSec: number): TimedBuff[] {
  return buffs
    .map((b) => ({ ...b, remainingSeconds: b.remainingSeconds - deltaSec }))
    .filter((b) => b.remainingSeconds > 0);
}

// ── Prestige ────────────────────────────────────────────────────────

/**
 * Calculate Breakthrough Points earned if the player prestiges now.
 * Formula: floor(20 * sqrt(totalRPThisRun / 1e8)) - currentBP
 *
 * Scaling examples (before BP gain multipliers):
 *   1e8  RP →   20 BP     1e11 RP →   632 BP
 *   1e9  RP →   63 BP     1e12 RP → 2,000 BP
 *   1e10 RP →  200 BP     1e14 RP → 20,000 BP
 */
export function breakthroughPointsOnPrestige(state: GameState): Decimal {
  // Determine the RP value used for BP calculation
  let rpForCalc = state.totalRPThisRun;

  // Unhinged prestige mod: use max(totalRP, peakRP/s * 3600)
  if (state.specialization.archetype === "unhinged") {
    const peakBased = state.specialization.peakRPPerSec.mul(3600);
    rpForCalc = Decimal.max(rpForCalc, peakBased);
  }

  const raw = new Decimal(20).mul(
    rpForCalc.div(1e8).max(0).sqrt()
  );

  // Perfectionist prestige mod: skip floor() for no rounding loss
  const baseRaw = state.specialization.archetype === "perfectionist"
    ? Decimal.max(0, raw.sub(state.bp))
    : Decimal.max(0, raw.floor().sub(state.bp));

  let result = baseRaw
    .mul(bpGainMultiplier(state))
    .mul(archetypeBPMultiplier(state))
    .mul(researchBPGainMultiplier(state))
    .mul(achievementBPGainMultiplier(state))
    .mul(specBPGainMultiplier(state))
    .mul(challengeBPGainMultiplier(state))
    .mul(ascensionBPGainMultiplier(state));

  // Megalomaniac prestige mod: +30% BP
  if (state.specialization.archetype === "megalomaniac") {
    result = result.mul(1.3);
  }

  // Gadgeteer prestige mod: +1% per total generator owned
  if (state.specialization.archetype === "gadgeteer") {
    const bonus = 1 + totalGeneratorsOwned(state) * 0.01;
    result = result.mul(bonus);
  }

  // Accidental Genius prestige mod: +1% per 1000 clicks
  if (state.specialization.archetype === "accidentalGenius") {
    const clickBonus = 1 + state.clickCount.div(1000).toNumber() * 0.01;
    result = result.mul(clickBonus);
  }

  return result.floor();
}

/**
 * Minimum RP threshold for prestige (modified by specialization).
 * Base: PRESTIGE_MIN_BP worth of RP.
 * Megalomaniac specialization: 2x threshold.
 * Reality Breaker specialization: 0.5x threshold (early prestige for reduced BP).
 */
export function prestigeRPThresholdMultiplier(state: GameState): number {
  if (state.specialization.archetype === "megalomaniac") return 2;
  if (state.specialization.archetype === "realityBreaker") return 0.5;
  return 1;
}

/**
 * Minimum BP threshold before prestige button appears.
 */
export const PRESTIGE_MIN_BP = new Decimal(5);
