import { Decimal } from "../utils/decimal";
import type { GameState, MadnessArchetype } from "./state";
import { SPECIALIZATIONS, getSpecializationDef } from "../data/specializations.data";
import type { SpecUpgradeEffect } from "../data/specializations.data";

// ── Activation ─────────────────────────────────────────────────────

/** Minimum madness level required to specialize. */
export const SPEC_MIN_MADNESS_LEVEL = 4;

/**
 * Check if the player can specialize right now.
 * Requires: dominant archetype, madness level 4+, not already specialized.
 */
export function canSpecialize(state: GameState): boolean {
  if (state.specialization.archetype !== null) return false;
  if (state.madness.dominantArchetype === null) return false;
  if (state.madness.madnessLevel < SPEC_MIN_MADNESS_LEVEL) return false;
  return true;
}

/**
 * Activate specialization for the current dominant archetype.
 * Creates the specialization generator and sets up state.
 */
export function activateSpecialization(state: GameState): boolean {
  if (!canSpecialize(state)) return false;

  const archetype = state.madness.dominantArchetype!;
  const def = getSpecializationDef(archetype);

  state.specialization.archetype = archetype;
  state.specialization.generator = {
    id: def.generator.id,
    owned: new Decimal(0),
    totalProduced: new Decimal(0),
  };
  state.specialization.purchasedUpgrades = [];
  state.specialization.rpSpentOnGenerators = new Decimal(0);
  state.specialization.rpRecovered = new Decimal(0);
  state.specialization.peakRPPerSec = new Decimal(0);

  return true;
}

/**
 * Reset specialization on prestige.
 */
export function resetSpecializationOnPrestige(state: GameState): void {
  state.specialization.archetype = null;
  state.specialization.generator = null;
  state.specialization.purchasedUpgrades = [];
  state.specialization.rpSpentOnGenerators = new Decimal(0);
  state.specialization.rpRecovered = new Decimal(0);
  state.specialization.peakRPPerSec = new Decimal(0);
}

// ── Specialization Generator Purchase ──────────────────────────────

/**
 * Purchase specialization generator. Uses same cost formula as regular gens.
 */
export function purchaseSpecGenerator(state: GameState, amount: number): boolean {
  const spec = state.specialization;
  if (!spec.archetype || !spec.generator) return false;

  const def = getSpecializationDef(spec.archetype).generator;

  let count = amount;
  if (count === -1) {
    count = specMaxAffordable(def.baseCost, def.costGrowthRate, spec.generator.owned, state.rp);
  }
  if (count <= 0) return false;

  const cost = specBulkCost(def.baseCost, def.costGrowthRate, spec.generator.owned, count);
  if (state.rp.lt(cost)) return false;

  state.rp = state.rp.sub(cost);
  spec.generator.owned = spec.generator.owned.add(count);
  spec.rpSpentOnGenerators = spec.rpSpentOnGenerators.add(cost);

  return true;
}

/** Cost of next specialization generator. */
export function specGenCost(state: GameState): Decimal {
  const spec = state.specialization;
  if (!spec.archetype || !spec.generator) return new Decimal(Infinity);
  const def = getSpecializationDef(spec.archetype).generator;
  return def.baseCost.mul(Decimal.pow(def.costGrowthRate, spec.generator.owned));
}

function specBulkCost(baseCost: Decimal, growth: number, owned: Decimal, count: number): Decimal {
  if (count <= 0) return new Decimal(0);
  const firstCost = baseCost.mul(Decimal.pow(growth, owned));
  if (count === 1) return firstCost;
  return firstCost.mul(Decimal.pow(growth, count).sub(1).div(growth - 1));
}

function specMaxAffordable(baseCost: Decimal, growth: number, owned: Decimal, rp: Decimal): number {
  const firstCost = baseCost.mul(Decimal.pow(growth, owned));
  if (rp.lt(firstCost)) return 0;
  const inner = rp.mul(growth - 1).div(firstCost).add(1);
  const n = inner.log(growth).floor().toNumber();
  return Math.max(1, n);
}

// ── Specialization Upgrade Purchase ────────────────────────────────

export function purchaseSpecUpgrade(state: GameState, upgradeId: string): boolean {
  const spec = state.specialization;
  if (!spec.archetype) return false;
  if (spec.purchasedUpgrades.includes(upgradeId)) return false;

  const def = getSpecializationDef(spec.archetype);
  const upgrade = def.upgrades.find((u) => u.id === upgradeId);
  if (!upgrade) return false;

  if (state.rp.lt(upgrade.cost)) return false;

  state.rp = state.rp.sub(upgrade.cost);
  spec.purchasedUpgrades.push(upgradeId);
  return true;
}

// ── Multiplier Queries ─────────────────────────────────────────────

/** Collect all effects from purchased specialization upgrades. */
function allSpecEffects(state: GameState): SpecUpgradeEffect[] {
  const spec = state.specialization;
  if (!spec.archetype) return [];

  const def = getSpecializationDef(spec.archetype);
  const effects: SpecUpgradeEffect[] = [];
  for (const uid of spec.purchasedUpgrades) {
    const upgrade = def.upgrades.find((u) => u.id === uid);
    if (!upgrade) continue;
    for (const effect of upgrade.effects) {
      effects.push(effect);
    }
  }
  return effects;
}

/** Global production multiplier from specialization upgrades. */
export function specGlobalMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allSpecEffects(state)) {
    if (effect.type === "globalMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** Generator-specific multiplier from specialization upgrades. */
export function specGeneratorMultiplier(state: GameState, genId: string): Decimal {
  let mult = new Decimal(1);
  for (const effect of allSpecEffects(state)) {
    if (effect.type === "generatorMultiplier" && effect.target === genId) {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** Click multiplier from specialization upgrades. */
export function specClickMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allSpecEffects(state)) {
    if (effect.type === "clickMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** IP gain multiplier from specialization upgrades. */
export function specIPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allSpecEffects(state)) {
    if (effect.type === "ipGainMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** BP gain multiplier from specialization upgrades. */
export function specBPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allSpecEffects(state)) {
    if (effect.type === "bpGainMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

/** Specialization generator production multiplier from specGenMultiplier effects. */
export function specGenOwnMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const effect of allSpecEffects(state)) {
    if (effect.type === "specGenMultiplier") {
      mult = mult.mul(effect.multiplier);
    }
  }
  return mult;
}

// ── Specialization Generator Production ────────────────────────────

/**
 * Production per second from the specialization generator.
 * Pipeline: base * owned * specGenOwnMultiplier * specGlobalMultiplier
 */
export function specGeneratorProduction(state: GameState): Decimal {
  const spec = state.specialization;
  if (!spec.archetype || !spec.generator || spec.generator.owned.eq(0)) {
    return new Decimal(0);
  }

  const def = getSpecializationDef(spec.archetype).generator;
  return def.baseProduction
    .mul(spec.generator.owned)
    .mul(specGenOwnMultiplier(state))
    .mul(specGlobalMultiplier(state));
}

// ── Passive Ability Effects ───────────────────────────────────────

/**
 * Megalomaniac cascade: each gen type boosts the next +0.5% per owned.
 * Returns per-generator multiplier array (index-aligned with GENERATORS).
 */
export function cascadeMultipliers(state: GameState): Decimal[] {
  const mults: Decimal[] = [];
  for (let i = 0; i < state.generators.length; i++) {
    if (i === 0) {
      mults.push(new Decimal(1));
    } else {
      const prevOwned = state.generators[i - 1].owned.toNumber();
      // +0.5% per unit owned by the previous generator
      const boost = 1 + prevOwned * 0.005;
      mults.push(new Decimal(boost));
    }
  }
  return mults;
}

/**
 * Perfectionist ramp: +1% per minute, caps at +100%.
 * Based on currentRunTimeSec.
 */
export function perfectRampMultiplier(state: GameState): Decimal {
  const minutes = state.currentRunTimeSec / 60;
  const bonus = Math.min(minutes * 0.01, 1.0); // caps at +100%
  return new Decimal(1 + bonus);
}

/**
 * Gadgeteer cost discount: 10% cheaper generators.
 */
export function gadgeteerCostMultiplier(state: GameState): Decimal {
  if (state.specialization.archetype === "gadgeteer") {
    return new Decimal(0.9);
  }
  return new Decimal(1);
}

// ── Prestige Modifier Helpers ──────────────────────────────────────

/**
 * Gadgeteer: total generators owned across all types.
 */
export function totalGeneratorsOwned(state: GameState): number {
  let total = 0;
  for (const gen of state.generators) {
    total += gen.owned.toNumber();
  }
  if (state.specialization.generator) {
    total += state.specialization.generator.owned.toNumber();
  }
  return total;
}
