import { Decimal } from "../utils/decimal";
import type { GameState } from "./state";
import { NPCS, MAX_RELATIONSHIP, getNPCDef, getFavorDef } from "../data/neighborhood.data";
import type { NPCDef } from "../data/neighborhood.data";

// ── Relationship Queries ────────────────────────────────────────────

/** Get relationship level for an NPC (0-10). */
export function getRelationship(state: GameState, npcId: string): number {
  return state.relationships[npcId] ?? 0;
}

/** Get the scaled bonus value for an NPC bonus at current relationship level. */
function scaledBonus(level: number, maxValue: number): number {
  return (level / MAX_RELATIONSHIP) * maxValue;
}

// ── Favor Actions ───────────────────────────────────────────────────

/** Check if a favor is available (cooldown elapsed, can afford, NPC not maxed). */
export function canDoFavor(state: GameState, npcId: string, favorId: string): boolean {
  const npc = getNPCDef(npcId);
  if (!npc) return false;

  const favor = getFavorDef(npcId, favorId);
  if (!favor) return false;

  // Already at max relationship?
  if (getRelationship(state, npcId) >= MAX_RELATIONSHIP) return false;

  // On cooldown?
  const cooldownEnd = state.favorCooldowns[favorId] ?? 0;
  if (Date.now() < cooldownEnd) return false;

  // Can afford?
  if (favor.costType === "rp" && state.rp.lt(favor.cost)) return false;
  if (favor.costType === "ip" && state.ip.lt(favor.cost)) return false;

  return true;
}

/** Perform a favor for an NPC. Returns true if successful. */
export function doFavor(state: GameState, npcId: string, favorId: string): boolean {
  if (!canDoFavor(state, npcId, favorId)) return false;

  const favor = getFavorDef(npcId, favorId)!;

  // Deduct cost
  if (favor.costType === "rp") {
    state.rp = state.rp.sub(favor.cost);
  } else {
    state.ip = state.ip.sub(favor.cost);
  }

  // Increase relationship
  const current = getRelationship(state, npcId);
  state.relationships[npcId] = Math.min(MAX_RELATIONSHIP, current + favor.relationshipGain);

  // Set cooldown
  state.favorCooldowns[favorId] = Date.now() + favor.cooldownSec * 1000;

  return true;
}

/** Get remaining cooldown in seconds for a favor (0 if ready). */
export function getFavorCooldownRemaining(state: GameState, favorId: string): number {
  const cooldownEnd = state.favorCooldowns[favorId] ?? 0;
  return Math.max(0, (cooldownEnd - Date.now()) / 1000);
}

// ── NPC Bonus Multiplier Queries ────────────────────────────────────

/** Global production multiplier from NPC relationships. */
export function neighborhoodGlobalMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "globalMultiplier") {
        mult = mult.mul(1 + scaledBonus(level, bonus.maxValue - 1));
      }
    }
  }
  return mult;
}

/** Click multiplier from NPC relationships. */
export function neighborhoodClickMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "clickMultiplier") {
        mult = mult.mul(1 + scaledBonus(level, bonus.maxValue - 1));
      }
    }
  }
  return mult;
}

/** Generator cost reduction from NPC relationships (0 to 0.15 = 15% cheaper). */
export function neighborhoodCostReduction(state: GameState): number {
  let reduction = 0;
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "generatorCostReduction") {
        reduction += scaledBonus(level, bonus.maxValue);
      }
    }
  }
  return Math.min(reduction, 0.5); // Cap at 50%
}

/** Offline efficiency bonus from NPC relationships. */
export function neighborhoodOfflineBonus(state: GameState): number {
  let bonus = 0;
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const b of npc.bonuses) {
      if (b.type === "offlineEfficiency") {
        bonus += scaledBonus(level, b.maxValue);
      }
    }
  }
  return bonus;
}

/** Research speed multiplier from NPC relationships. */
export function neighborhoodResearchSpeedMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "researchSpeed") {
        mult = mult.mul(1 + scaledBonus(level, bonus.maxValue - 1));
      }
    }
  }
  return mult;
}

/** Research IP cost reduction from NPC relationships (0 to 0.3 = 30% cheaper). */
export function neighborhoodResearchCostReduction(state: GameState): number {
  let reduction = 0;
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "researchCostReduction") {
        reduction += scaledBonus(level, bonus.maxValue);
      }
    }
  }
  return Math.min(reduction, 0.5); // Cap at 50%
}

/** Buff duration multiplier from NPC relationships. */
export function neighborhoodBuffDurationMultiplier(state: GameState): number {
  let mult = 1;
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "buffDuration") {
        mult *= 1 + scaledBonus(level, bonus.maxValue - 1);
      }
    }
  }
  return mult;
}

/** Auto-click rate from NPC relationships (clicks per second). */
export function neighborhoodAutoClickRate(state: GameState): number {
  let rate = 0;
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "autoClick") {
        rate += scaledBonus(level, bonus.maxValue);
      }
    }
  }
  return rate;
}

/** Free IP per second from NPC relationships. */
export function neighborhoodFreeIPPerSec(state: GameState): number {
  let total = 0;
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "ipIncome") {
        total += scaledBonus(level, bonus.maxValue);
      }
    }
  }
  return total;
}

/** Negative event reduction (0 to 0.5 = 50% fewer). */
export function neighborhoodNegativeEventReduction(state: GameState): number {
  let reduction = 0;
  for (const npc of NPCS) {
    const level = getRelationship(state, npc.id);
    if (level === 0) continue;
    for (const bonus of npc.bonuses) {
      if (bonus.type === "reducedNegativeEvents") {
        reduction += scaledBonus(level, bonus.maxValue);
      }
    }
  }
  return Math.min(reduction, 0.8); // Cap at 80%
}
