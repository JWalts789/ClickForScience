import { Decimal } from "../utils/decimal";
import type { MadnessArchetype } from "../engine/state";

// ── Specialization Generator ─────────────────────────────────────────

export interface SpecGeneratorDef {
  id: string;
  name: string;
  description: string;
  baseCost: Decimal;
  baseProduction: Decimal;
  costGrowthRate: number;
}

// ── Specialization Upgrade ──────────────────────────────────────────

export type SpecUpgradeEffect =
  | { type: "globalMultiplier"; multiplier: number }
  | { type: "generatorMultiplier"; target: string; multiplier: number }
  | { type: "clickMultiplier"; multiplier: number }
  | { type: "specGenMultiplier"; multiplier: number }
  | { type: "ipGainMultiplier"; multiplier: number }
  | { type: "bpGainMultiplier"; multiplier: number };

export interface SpecUpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: Decimal;
  effects: SpecUpgradeEffect[];
}

// ── Passive Ability ─────────────────────────────────────────────────

export type PassiveType =
  | "cascadeBoost"       // Megalomaniac: each gen type boosts the next
  | "perfectRamp"        // Perfectionist: +1%/min production (caps +100%)
  | "chaosSpikes"        // Unhinged: random 2-5x spikes every 30-90s
  | "dimensionalRift"    // Reality Breaker: 5% chance/sec of 10x for 5s
  | "efficientMachines"  // Gadgeteer: generators 10% cheaper
  | "rpRecovery";        // Accidental Genius: 1% of spent RP returns over time

export interface PassiveDef {
  type: PassiveType;
  name: string;
  description: string;
}

// ── Prestige Modifier ──────────────────────────────────────────────

export type PrestigeModType =
  | "bpBonusWithThreshold"   // Megalomaniac: +30% BP but 2x RP threshold
  | "noRoundingLoss"         // Perfectionist: no floor() loss on BP
  | "peakRPFormula"          // Unhinged: BP uses max(totalRP, peakRP/s * 3600)
  | "earlyPrestige"          // Reality Breaker: can prestige early for reduced BP
  | "generatorBPBonus"       // Gadgeteer: BP bonus from total generators owned
  | "clickCountBPBonus";     // Accidental Genius: BP includes click count

export interface PrestigeModDef {
  type: PrestigeModType;
  description: string;
}

// ── Full Specialization Definition ──────────────────────────────────

export interface SpecializationDef {
  archetype: MadnessArchetype;
  name: string;
  flavorText: string;
  generator: SpecGeneratorDef;
  upgrades: SpecUpgradeDef[];
  passive: PassiveDef;
  prestigeMod: PrestigeModDef;
}

// ── The 6 Specializations ───────────────────────────────────────────

export const SPECIALIZATIONS: Record<MadnessArchetype, SpecializationDef> = {
  megalomaniac: {
    archetype: "megalomaniac",
    name: "Supreme Commander",
    flavorText: "They don't follow you because they want to. They follow you because the alternative is unthinkable.",
    generator: {
      id: "spec_command_center",
      name: "Command Center",
      description: "A throne from which all science flows. Delegates everything. Takes credit for everything.",
      baseCost: new Decimal(1e12),
      baseProduction: new Decimal(100000),
      costGrowthRate: 1.15,
    },
    upgrades: [
      {
        id: "mega_iron_fist",
        name: "Iron Fist Protocol",
        description: "All generators produce 3x more RP.",
        cost: new Decimal(1e13),
        effects: [{ type: "globalMultiplier", multiplier: 3 }],
      },
      {
        id: "mega_loyalty_program",
        name: "Mandatory Loyalty Program",
        description: "Command Center produces 5x more. Mind-Links produce 3x more.",
        cost: new Decimal(5e13),
        effects: [
          { type: "specGenMultiplier", multiplier: 5 },
          { type: "generatorMultiplier", target: "mindlink", multiplier: 3 },
        ],
      },
      {
        id: "mega_world_domination",
        name: "Phase 1: World Domination",
        description: "BP gain increased by 2x.",
        cost: new Decimal(1e14),
        effects: [{ type: "bpGainMultiplier", multiplier: 2 }],
      },
    ],
    passive: {
      type: "cascadeBoost",
      name: "Cascade Command",
      description: "Each generator type boosts the next type's production by +0.5% per unit owned.",
    },
    prestigeMod: {
      type: "bpBonusWithThreshold",
      description: "+30% BP gain, but requires 2x the normal RP threshold to prestige.",
    },
  },

  perfectionist: {
    archetype: "perfectionist",
    name: "Optimization Engine",
    flavorText: "Perfection isn't a goal. It's a minimum acceptable standard.",
    generator: {
      id: "spec_calibration_lab",
      name: "Calibration Lab",
      description: "Every measurement, triple-checked. Every result, peer-reviewed by yourself.",
      baseCost: new Decimal(1e12),
      baseProduction: new Decimal(100000),
      costGrowthRate: 1.15,
    },
    upgrades: [
      {
        id: "perf_fine_tuning",
        name: "Fine-Tuning Protocol",
        description: "All generators produce 2.5x more RP. Clicks produce 2x more.",
        cost: new Decimal(1e13),
        effects: [
          { type: "globalMultiplier", multiplier: 2.5 },
          { type: "clickMultiplier", multiplier: 2 },
        ],
      },
      {
        id: "perf_quality_assurance",
        name: "Quality Assurance Division",
        description: "Calibration Lab produces 5x more. IP generation 2x.",
        cost: new Decimal(5e13),
        effects: [
          { type: "specGenMultiplier", multiplier: 5 },
          { type: "ipGainMultiplier", multiplier: 2 },
        ],
      },
      {
        id: "perf_flawless_execution",
        name: "Flawless Execution",
        description: "All generators produce 5x more RP.",
        cost: new Decimal(1e14),
        effects: [{ type: "globalMultiplier", multiplier: 5 }],
      },
    ],
    passive: {
      type: "perfectRamp",
      name: "Precision Ramp",
      description: "Production increases by +1% per minute spent in this run (caps at +100%).",
    },
    prestigeMod: {
      type: "noRoundingLoss",
      description: "BP calculation skips the floor() step — no rounding loss.",
    },
  },

  unhinged: {
    archetype: "unhinged",
    name: "Chaos Incarnate",
    flavorText: "Safety protocols are just suggestions written by people who lack VISION.",
    generator: {
      id: "spec_chaos_engine",
      name: "Chaos Engine",
      description: "It runs on entropy, spite, and whatever fell into the intake. Don't look inside.",
      baseCost: new Decimal(1e12),
      baseProduction: new Decimal(100000),
      costGrowthRate: 1.15,
    },
    upgrades: [
      {
        id: "unhinged_volatile_mix",
        name: "Volatile Mixture",
        description: "Chemistry Sets and Containment Chambers produce 4x more.",
        cost: new Decimal(1e13),
        effects: [
          { type: "generatorMultiplier", target: "chemistry", multiplier: 4 },
          { type: "generatorMultiplier", target: "containment", multiplier: 4 },
        ],
      },
      {
        id: "unhinged_reckless_abandon",
        name: "Reckless Abandon",
        description: "Chaos Engine produces 8x more. All generators 2x.",
        cost: new Decimal(5e13),
        effects: [
          { type: "specGenMultiplier", multiplier: 8 },
          { type: "globalMultiplier", multiplier: 2 },
        ],
      },
      {
        id: "unhinged_beautiful_mayhem",
        name: "Beautiful Mayhem",
        description: "All generators 4x, clicks 4x.",
        cost: new Decimal(1e14),
        effects: [
          { type: "globalMultiplier", multiplier: 4 },
          { type: "clickMultiplier", multiplier: 4 },
        ],
      },
    ],
    passive: {
      type: "chaosSpikes",
      name: "Chaos Spikes",
      description: "Random 2-5x production spikes lasting 3-8 seconds, every 30-90 seconds.",
    },
    prestigeMod: {
      type: "peakRPFormula",
      description: "BP formula uses max(totalRP, peakRP/sec × 3600) — rewards high production peaks.",
    },
  },

  realityBreaker: {
    archetype: "realityBreaker",
    name: "Dimensional Architect",
    flavorText: "Reality is just one option. And frankly, it's not even the best one.",
    generator: {
      id: "spec_dimensional_rift",
      name: "Dimensional Rift",
      description: "A tear in the fabric of space-time. It leaks RP from alternate timelines where you're even more productive.",
      baseCost: new Decimal(1e12),
      baseProduction: new Decimal(100000),
      costGrowthRate: 1.15,
    },
    upgrades: [
      {
        id: "rb_parallel_harvesting",
        name: "Parallel Timeline Harvesting",
        description: "Colliders and Reality Engines produce 4x more.",
        cost: new Decimal(1e13),
        effects: [
          { type: "generatorMultiplier", target: "collider", multiplier: 4 },
          { type: "generatorMultiplier", target: "reality", multiplier: 4 },
        ],
      },
      {
        id: "rb_multiverse_merge",
        name: "Multiverse Merge",
        description: "Dimensional Rift produces 5x more. All generators 2x.",
        cost: new Decimal(5e13),
        effects: [
          { type: "specGenMultiplier", multiplier: 5 },
          { type: "globalMultiplier", multiplier: 2 },
        ],
      },
      {
        id: "rb_reality_override",
        name: "Reality Override",
        description: "All generators 5x, clicks 3x.",
        cost: new Decimal(1e14),
        effects: [
          { type: "globalMultiplier", multiplier: 5 },
          { type: "clickMultiplier", multiplier: 3 },
        ],
      },
    ],
    passive: {
      type: "dimensionalRift",
      name: "Dimensional Bleed",
      description: "5% chance per second of a 10x production spike lasting 5 seconds.",
    },
    prestigeMod: {
      type: "earlyPrestige",
      description: "Can prestige at 50% of normal RP threshold, but for reduced BP (scaled down).",
    },
  },

  gadgeteer: {
    archetype: "gadgeteer",
    name: "Master Machinist",
    flavorText: "If it has gears, wires, or a blinking light, it's already half-finished in your head.",
    generator: {
      id: "spec_assembly_line",
      name: "Assembly Line",
      description: "A self-replicating production chain. It builds things that build things that build things.",
      baseCost: new Decimal(1e12),
      baseProduction: new Decimal(100000),
      costGrowthRate: 1.15,
    },
    upgrades: [
      {
        id: "gad_precision_tooling",
        name: "Precision Tooling",
        description: "Soldering Stations and Prototype Machines produce 4x more.",
        cost: new Decimal(1e13),
        effects: [
          { type: "generatorMultiplier", target: "soldering", multiplier: 4 },
          { type: "generatorMultiplier", target: "prototype", multiplier: 4 },
        ],
      },
      {
        id: "gad_assembly_overdrive",
        name: "Assembly Overdrive",
        description: "Assembly Line produces 8x more. IP generation 2x.",
        cost: new Decimal(5e13),
        effects: [
          { type: "specGenMultiplier", multiplier: 8 },
          { type: "ipGainMultiplier", multiplier: 2 },
        ],
      },
      {
        id: "gad_factory_of_factories",
        name: "Factory of Factories",
        description: "All generators 3x, BP gain 1.5x.",
        cost: new Decimal(1e14),
        effects: [
          { type: "globalMultiplier", multiplier: 3 },
          { type: "bpGainMultiplier", multiplier: 1.5 },
        ],
      },
    ],
    passive: {
      type: "efficientMachines",
      name: "Efficient Machines",
      description: "All generators cost 10% less to purchase.",
    },
    prestigeMod: {
      type: "generatorBPBonus",
      description: "BP gain gets +1% bonus per total generator owned (all types combined).",
    },
  },

  accidentalGenius: {
    archetype: "accidentalGenius",
    name: "Lucky Savant",
    flavorText: "You didn't plan any of this. It just... happened. Repeatedly. Impossibly.",
    generator: {
      id: "spec_serendipity_engine",
      name: "Serendipity Engine",
      description: "Powered by coincidence and good vibes. Somehow outperforms everything else.",
      baseCost: new Decimal(1e12),
      baseProduction: new Decimal(100000),
      costGrowthRate: 1.15,
    },
    upgrades: [
      {
        id: "ag_lucky_break",
        name: "Lucky Break",
        description: "Cosmic Looms produce 4x more. Clicks produce 3x more.",
        cost: new Decimal(1e13),
        effects: [
          { type: "generatorMultiplier", target: "cosmic", multiplier: 4 },
          { type: "clickMultiplier", multiplier: 3 },
        ],
      },
      {
        id: "ag_chain_reaction",
        name: "Chain Reaction of Fortune",
        description: "Serendipity Engine produces 5x more. All generators 2x.",
        cost: new Decimal(5e13),
        effects: [
          { type: "specGenMultiplier", multiplier: 5 },
          { type: "globalMultiplier", multiplier: 2 },
        ],
      },
      {
        id: "ag_cosmic_alignment",
        name: "Cosmic Alignment",
        description: "IP generation 3x, BP gain 2x.",
        cost: new Decimal(1e14),
        effects: [
          { type: "ipGainMultiplier", multiplier: 3 },
          { type: "bpGainMultiplier", multiplier: 2 },
        ],
      },
    ],
    passive: {
      type: "rpRecovery",
      name: "Serendipitous Returns",
      description: "1% of all RP spent on generators slowly returns over time.",
    },
    prestigeMod: {
      type: "clickCountBPBonus",
      description: "BP formula includes click count — each 1000 clicks adds +1% BP.",
    },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────

export function getSpecializationDef(archetype: MadnessArchetype): SpecializationDef {
  return SPECIALIZATIONS[archetype];
}

export function getSpecUpgradeDef(upgradeId: string): SpecUpgradeDef | undefined {
  for (const spec of Object.values(SPECIALIZATIONS)) {
    const found = spec.upgrades.find((u) => u.id === upgradeId);
    if (found) return found;
  }
  return undefined;
}
