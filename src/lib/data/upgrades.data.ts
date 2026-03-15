import { Decimal } from "../utils/decimal";
import type { MadnessArchetype } from "../engine/state";

// ── Upgrade Effect Types ────────────────────────────────────────────

export type UpgradeEffect =
  | { type: "generatorMultiplier"; target: string; multiplier: number }
  | { type: "globalMultiplier"; multiplier: number }
  | { type: "clickMultiplier"; multiplier: number }
  | { type: "clickPercentOfProduction"; percent: number };

// ── Upgrade Definition ──────────────────────────────────────────────

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: Decimal;
  /** What this upgrade does when purchased. */
  effects: UpgradeEffect[];
  /** Required upgrade IDs (must own all before this unlocks). */
  requires: string[];
  /** Madness archetype tags (hidden from player, used for Phase 3). */
  madnessTags: MadnessArchetype[];
  /** Which category to show this upgrade under in the UI. */
  category: UpgradeCategory;
}

export type UpgradeCategory = "production" | "clicking" | "synergy" | "efficiency";

// ── Upgrade Definitions ─────────────────────────────────────────────

export const UPGRADES: UpgradeDef[] = [
  // ── Production Upgrades (boost specific generators) ───────────────

  // Notebook chain
  {
    id: "notebook_1",
    name: "Graph Paper",
    description: "Spiral Notebooks produce 2x more RP.",
    cost: new Decimal(100),
    effects: [{ type: "generatorMultiplier", target: "notebook", multiplier: 2 }],
    requires: [],
    madnessTags: [],
    category: "production",
  },
  {
    id: "notebook_2",
    name: "Shorthand Notation",
    description: "Spiral Notebooks produce 3x more RP.",
    cost: new Decimal(5000),
    effects: [{ type: "generatorMultiplier", target: "notebook", multiplier: 3 }],
    requires: ["notebook_1"],
    madnessTags: ["perfectionist"],
    category: "production",
  },

  // Soldering chain
  {
    id: "soldering_1",
    name: "Lead-Free Solder",
    description: "Soldering Stations produce 2x more RP.",
    cost: new Decimal(1000),
    effects: [{ type: "generatorMultiplier", target: "soldering", multiplier: 2 }],
    requires: [],
    madnessTags: ["gadgeteer"],
    category: "production",
  },
  {
    id: "soldering_2",
    name: "Reflow Oven",
    description: "Soldering Stations produce 3x more RP.",
    cost: new Decimal(50000),
    effects: [{ type: "generatorMultiplier", target: "soldering", multiplier: 3 }],
    requires: ["soldering_1"],
    madnessTags: ["gadgeteer"],
    category: "production",
  },

  // Chemistry chain
  {
    id: "chemistry_1",
    name: "Fume Hood",
    description: "Chemistry Sets produce 2x more RP.",
    cost: new Decimal(11000),
    effects: [{ type: "generatorMultiplier", target: "chemistry", multiplier: 2 }],
    requires: [],
    madnessTags: ["unhinged"],
    category: "production",
  },
  {
    id: "chemistry_2",
    name: "Questionable Reagents",
    description: "Chemistry Sets produce 3x more RP.",
    cost: new Decimal(500000),
    effects: [{ type: "generatorMultiplier", target: "chemistry", multiplier: 3 }],
    requires: ["chemistry_1"],
    madnessTags: ["unhinged"],
    category: "production",
  },

  // Server chain
  {
    id: "server_1",
    name: "RAM Upgrade",
    description: "Server Racks produce 2x more RP.",
    cost: new Decimal(120000),
    effects: [{ type: "generatorMultiplier", target: "server", multiplier: 2 }],
    requires: [],
    madnessTags: ["perfectionist"],
    category: "production",
  },
  {
    id: "server_2",
    name: "Overclocked CPUs",
    description: "Server Racks produce 3x more RP.",
    cost: new Decimal(5000000),
    effects: [{ type: "generatorMultiplier", target: "server", multiplier: 3 }],
    requires: ["server_1"],
    madnessTags: ["perfectionist", "gadgeteer"],
    category: "production",
  },

  // Prototype chain
  {
    id: "prototype_1",
    name: "Duct Tape Reinforcement",
    description: "Prototype Machines produce 2x more RP.",
    cost: new Decimal(1300000),
    effects: [{ type: "generatorMultiplier", target: "prototype", multiplier: 2 }],
    requires: [],
    madnessTags: ["accidentalGenius"],
    category: "production",
  },
  {
    id: "prototype_2",
    name: '"Percussive Maintenance"',
    description: "Prototype Machines produce 3x more RP.",
    cost: new Decimal(50000000),
    effects: [{ type: "generatorMultiplier", target: "prototype", multiplier: 3 }],
    requires: ["prototype_1"],
    madnessTags: ["accidentalGenius", "gadgeteer"],
    category: "production",
  },

  // Containment chain
  {
    id: "containment_1",
    name: "Reinforced Glass",
    description: "Containment Chambers produce 2x more RP.",
    cost: new Decimal(14000000),
    effects: [{ type: "generatorMultiplier", target: "containment", multiplier: 2 }],
    requires: [],
    madnessTags: ["unhinged"],
    category: "production",
  },

  // Collider chain
  {
    id: "collider_1",
    name: "Magnetic Shielding",
    description: "Particle Colliders produce 2x more RP.",
    cost: new Decimal(200000000),
    effects: [{ type: "generatorMultiplier", target: "collider", multiplier: 2 }],
    requires: [],
    madnessTags: ["realityBreaker"],
    category: "production",
  },

  // Mindlink chain
  {
    id: "mindlink_1",
    name: "Neural Amplifiers",
    description: "Mind-Link Arrays produce 2x more RP.",
    cost: new Decimal(3300000000),
    effects: [{ type: "generatorMultiplier", target: "mindlink", multiplier: 2 }],
    requires: [],
    madnessTags: ["megalomaniac"],
    category: "production",
  },

  // Reality chain
  {
    id: "reality_1",
    name: "Stabilization Field",
    description: "Reality Engines produce 2x more RP.",
    cost: new Decimal(51000000000),
    effects: [{ type: "generatorMultiplier", target: "reality", multiplier: 2 }],
    requires: [],
    madnessTags: ["realityBreaker"],
    category: "production",
  },

  // Cosmic chain
  {
    id: "cosmic_1",
    name: "Causal Threading",
    description: "Cosmic Looms produce 2x more RP.",
    cost: new Decimal(750000000000),
    effects: [{ type: "generatorMultiplier", target: "cosmic", multiplier: 2 }],
    requires: [],
    madnessTags: [],
    category: "production",
  },

  // ── Click Upgrades ────────────────────────────────────────────────

  {
    id: "click_1",
    name: "Ergonomic Mouse",
    description: "Clicks produce 2x more RP.",
    cost: new Decimal(50),
    effects: [{ type: "clickMultiplier", multiplier: 2 }],
    requires: [],
    madnessTags: [],
    category: "clicking",
  },
  {
    id: "click_2",
    name: "Caffeine Regimen",
    description: "Clicks produce 3x more RP.",
    cost: new Decimal(5000),
    effects: [{ type: "clickMultiplier", multiplier: 3 }],
    requires: ["click_1"],
    madnessTags: [],
    category: "clicking",
  },
  {
    id: "click_3",
    name: "Finger Strengthening Protocol",
    description: "Clicks produce 5x more RP.",
    cost: new Decimal(500000),
    effects: [{ type: "clickMultiplier", multiplier: 5 }],
    requires: ["click_2"],
    madnessTags: ["perfectionist"],
    category: "clicking",
  },
  {
    id: "click_4",
    name: "Neural Click Pathway",
    description: "Each click also produces 1% of your RP/sec.",
    cost: new Decimal(10000000),
    effects: [{ type: "clickPercentOfProduction", percent: 1 }],
    requires: ["click_3"],
    madnessTags: ["gadgeteer"],
    category: "clicking",
  },
  {
    id: "click_5",
    name: "Quantum Click Entanglement",
    description: "Each click also produces 5% of your RP/sec.",
    cost: new Decimal(1000000000),
    effects: [{ type: "clickPercentOfProduction", percent: 5 }],
    requires: ["click_4"],
    madnessTags: ["realityBreaker"],
    category: "clicking",
  },

  // ── Synergy Upgrades (cross-generator bonuses) ────────────────────

  {
    id: "synergy_notebook_soldering",
    name: "Circuit Diagrams",
    description: "Owning 10+ Notebooks boosts Soldering Stations by 1.5x.",
    cost: new Decimal(3000),
    effects: [{ type: "generatorMultiplier", target: "soldering", multiplier: 1.5 }],
    requires: ["notebook_1", "soldering_1"],
    madnessTags: ["gadgeteer"],
    category: "synergy",
  },
  {
    id: "synergy_chemistry_server",
    name: "Computational Chemistry",
    description: "Servers simulate reactions. Both produce 1.5x more.",
    cost: new Decimal(500000),
    effects: [
      { type: "generatorMultiplier", target: "chemistry", multiplier: 1.5 },
      { type: "generatorMultiplier", target: "server", multiplier: 1.5 },
    ],
    requires: ["chemistry_1", "server_1"],
    madnessTags: ["perfectionist"],
    category: "synergy",
  },
  {
    id: "synergy_prototype_containment",
    name: "Automated Testing Chamber",
    description: "Prototypes and Containment Chambers produce 1.5x more.",
    cost: new Decimal(50000000),
    effects: [
      { type: "generatorMultiplier", target: "prototype", multiplier: 1.5 },
      { type: "generatorMultiplier", target: "containment", multiplier: 1.5 },
    ],
    requires: ["prototype_1", "containment_1"],
    madnessTags: ["unhinged", "gadgeteer"],
    category: "synergy",
  },

  // ── Efficiency Upgrades (global bonuses) ──────────────────────────

  {
    id: "efficiency_1",
    name: "Better Lighting",
    description: "All generators produce 1.5x more RP.",
    cost: new Decimal(10000),
    effects: [{ type: "globalMultiplier", multiplier: 1.5 }],
    requires: [],
    madnessTags: [],
    category: "efficiency",
  },
  {
    id: "efficiency_2",
    name: "Lab Organization",
    description: "All generators produce 2x more RP.",
    cost: new Decimal(1000000),
    effects: [{ type: "globalMultiplier", multiplier: 2 }],
    requires: ["efficiency_1"],
    madnessTags: ["perfectionist"],
    category: "efficiency",
  },
  {
    id: "efficiency_3",
    name: "Sleep Deprivation (The Good Kind)",
    description: "All generators produce 2x more RP.",
    cost: new Decimal(100000000),
    effects: [{ type: "globalMultiplier", multiplier: 2 }],
    requires: ["efficiency_2"],
    madnessTags: ["megalomaniac"],
    category: "efficiency",
  },
  {
    id: "efficiency_4",
    name: "Temporal Dilation Field",
    description: "All generators produce 3x more RP.",
    cost: new Decimal(50000000000),
    effects: [{ type: "globalMultiplier", multiplier: 3 }],
    requires: ["efficiency_3"],
    madnessTags: ["realityBreaker"],
    category: "efficiency",
  },
];

// ── Lookup helper ───────────────────────────────────────────────────

const UPGRADE_MAP = new Map<string, UpgradeDef>(
  UPGRADES.map((u) => [u.id, u])
);

export function getUpgradeDef(id: string): UpgradeDef | undefined {
  return UPGRADE_MAP.get(id);
}

// ── Prestige Upgrade Effect Types ────────────────────────────────────

export type PrestigeUpgradeEffect =
  | { type: "globalMultiplier"; multiplier: number }
  | { type: "clickMultiplier"; multiplier: number }
  | { type: "bpGainMultiplier"; multiplier: number }
  | { type: "offlineEfficiencyBonus"; bonus: number }
  | { type: "startingRP"; amount: number }
  | { type: "generatorMultiplier"; target: string; multiplier: number };

export interface PrestigeUpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: Decimal;
  effects: PrestigeUpgradeEffect[];
  requires: string[];
  /** Which tier row to display in (visual grouping). */
  tier: 1 | 2 | 3;
}

// ── Prestige Upgrade Definitions ─────────────────────────────────────

export const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  // ── Tier 1: Early Breakthroughs (25-100 BP) ────────────────────────

  {
    id: "bp_prod_1",
    name: "Retained Knowledge",
    description: "All generators produce 2x more RP (permanent).",
    cost: new Decimal(25),
    effects: [{ type: "globalMultiplier", multiplier: 2 }],
    requires: [],
    tier: 1,
  },
  {
    id: "bp_click_1",
    name: "Muscle Memory",
    description: "Clicks produce 3x more RP (permanent).",
    cost: new Decimal(30),
    effects: [{ type: "clickMultiplier", multiplier: 3 }],
    requires: [],
    tier: 1,
  },
  {
    id: "bp_starting_rp",
    name: "Head Start",
    description: "Start each run with 1,000 RP.",
    cost: new Decimal(50),
    effects: [{ type: "startingRP", amount: 1000 }],
    requires: [],
    tier: 1,
  },
  {
    id: "bp_offline_1",
    name: "Sleepwalking Scientist",
    description: "Offline progress efficiency +20% (50% → 70%).",
    cost: new Decimal(40),
    effects: [{ type: "offlineEfficiencyBonus", bonus: 0.2 }],
    requires: [],
    tier: 1,
  },
  {
    id: "bp_gain_1",
    name: "Breakthrough Intuition",
    description: "Earn 50% more Breakthrough Points on prestige.",
    cost: new Decimal(100),
    effects: [{ type: "bpGainMultiplier", multiplier: 1.5 }],
    requires: [],
    tier: 1,
  },

  // ── Tier 2: Deeper Insights (200-750 BP) ──────────────────────────

  {
    id: "bp_prod_2",
    name: "Systematic Approach",
    description: "All generators produce 3x more RP (permanent).",
    cost: new Decimal(250),
    effects: [{ type: "globalMultiplier", multiplier: 3 }],
    requires: ["bp_prod_1"],
    tier: 2,
  },
  {
    id: "bp_click_2",
    name: "Instinctive Brilliance",
    description: "Clicks produce 5x more RP (permanent).",
    cost: new Decimal(350),
    effects: [{ type: "clickMultiplier", multiplier: 5 }],
    requires: ["bp_click_1"],
    tier: 2,
  },
  {
    id: "bp_notebook_boost",
    name: "Annotated Margins",
    description: "Spiral Notebooks produce 10x more RP.",
    cost: new Decimal(200),
    effects: [{ type: "generatorMultiplier", target: "notebook", multiplier: 10 }],
    requires: ["bp_prod_1"],
    tier: 2,
  },
  {
    id: "bp_offline_2",
    name: "Dream Research",
    description: "Offline progress efficiency +20% (stacks with tier 1).",
    cost: new Decimal(500),
    effects: [{ type: "offlineEfficiencyBonus", bonus: 0.2 }],
    requires: ["bp_offline_1"],
    tier: 2,
  },
  {
    id: "bp_gain_2",
    name: "Eureka Cascade",
    description: "Earn 2x more Breakthrough Points on prestige.",
    cost: new Decimal(750),
    effects: [{ type: "bpGainMultiplier", multiplier: 2 }],
    requires: ["bp_gain_1"],
    tier: 2,
  },

  // ── Tier 3: Transcendent Science (1500-5000 BP) ───────────────────

  {
    id: "bp_prod_3",
    name: "Universal Constants Rewritten",
    description: "All generators produce 5x more RP (permanent).",
    cost: new Decimal(2000),
    effects: [{ type: "globalMultiplier", multiplier: 5 }],
    requires: ["bp_prod_2"],
    tier: 3,
  },
  {
    id: "bp_click_3",
    name: "The Midas Touch",
    description: "Clicks produce 10x more RP (permanent).",
    cost: new Decimal(3000),
    effects: [{ type: "clickMultiplier", multiplier: 10 }],
    requires: ["bp_click_2"],
    tier: 3,
  },
  {
    id: "bp_starting_rp_2",
    name: "Grant Funding",
    description: "Start each run with 1,000,000 RP.",
    cost: new Decimal(1500),
    effects: [{ type: "startingRP", amount: 1000000 }],
    requires: ["bp_starting_rp"],
    tier: 3,
  },
  {
    id: "bp_offline_3",
    name: "Autonomous Lab",
    description: "Offline progress efficiency +10% (can reach 100%).",
    cost: new Decimal(5000),
    effects: [{ type: "offlineEfficiencyBonus", bonus: 0.1 }],
    requires: ["bp_offline_2"],
    tier: 3,
  },
];

// ── Prestige Upgrade Lookup ──────────────────────────────────────────

const PRESTIGE_UPGRADE_MAP = new Map<string, PrestigeUpgradeDef>(
  PRESTIGE_UPGRADES.map((u) => [u.id, u])
);

export function getPrestigeUpgradeDef(id: string): PrestigeUpgradeDef | undefined {
  return PRESTIGE_UPGRADE_MAP.get(id);
}
