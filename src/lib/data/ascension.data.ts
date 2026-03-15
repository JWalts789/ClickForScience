import { Decimal } from "../utils/decimal";

// ── Ascension Upgrade Definitions ───────────────────────────────────

export type AscensionEffectType =
  | "startingRPPercent"
  | "researchSpeedMultiplier"
  | "startingLabLevel"
  | "archetypeBonusMultiplier"
  | "bpFormulaMultiplier"
  | "prestigeUpgradeCostReduction"
  | "globalMultiplier"
  | "ipGainMultiplier"
  | "clickMultiplier"
  | "offlineEfficiencyBonus"
  | "generatorCostReduction"
  | "autobuyerSpeed"
  | "challengeRewardMultiplier"
  | "neighborhoodBonusMultiplier"
  | "startingBP";

export interface AscensionEffect {
  type: AscensionEffectType;
  value: number;
  description: string;
}

export interface AscensionUpgradeDef {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  /** TP cost. */
  cost: number;
  /** Effects granted by this upgrade. */
  effects: AscensionEffect[];
  /** Required upgrade IDs (all must be owned). */
  requires: string[];
  /** Tier for display grouping (1-3). */
  tier: 1 | 2 | 3;
}

// ── Ascension Upgrades ─────────────────────────────────────────────

export const ASCENSION_UPGRADES: AscensionUpgradeDef[] = [
  // ── Tier 1: Foundation (1-3 TP) ────────────────────────────────
  {
    id: "asc_momentum",
    name: "Residual Momentum",
    description: "Start each prestige with 10% of your previous peak RP/sec.",
    flavorText: "Some things carry over. Like momentum. And madness.",
    cost: 1,
    effects: [{ type: "startingRPPercent", value: 0.1, description: "Start with 10% of peak RP/sec" }],
    requires: [],
    tier: 1,
  },
  {
    id: "asc_swift_research",
    name: "Swift Research",
    description: "Research completes 2x faster.",
    flavorText: "Gary's corkboard has evolved into a mind palace. A messy one.",
    cost: 1,
    effects: [{ type: "researchSpeedMultiplier", value: 2, description: "2x research speed" }],
    requires: [],
    tier: 1,
  },
  {
    id: "asc_head_start",
    name: "Head Start",
    description: "Start each ascension at lab level 1 (Basement) instead of 0.",
    flavorText: "The basement is always there. Waiting.",
    cost: 2,
    effects: [{ type: "startingLabLevel", value: 1, description: "Start at Basement lab level" }],
    requires: [],
    tier: 1,
  },
  {
    id: "asc_global_boost",
    name: "Fundamental Insight",
    description: "2x global production permanently.",
    flavorText: "Everything just... clicks. Pun intended.",
    cost: 2,
    effects: [{ type: "globalMultiplier", value: 2, description: "2x global production" }],
    requires: [],
    tier: 1,
  },
  {
    id: "asc_click_mastery",
    name: "Click Mastery",
    description: "3x click value permanently.",
    flavorText: "Gary's index finger has its own gravitational pull now.",
    cost: 2,
    effects: [{ type: "clickMultiplier", value: 3, description: "3x click value" }],
    requires: [],
    tier: 1,
  },
  {
    id: "asc_bp_seed",
    name: "Breakthrough Seed",
    description: "Start each prestige cycle with 5 BP.",
    flavorText: "A small gift from your future self.",
    cost: 3,
    effects: [{ type: "startingBP", value: 5, description: "Start with 5 BP" }],
    requires: [],
    tier: 1,
  },

  // ── Tier 2: Enhancement (3-6 TP) ──────────────────────────────
  {
    id: "asc_archetype_power",
    name: "Archetype Resonance",
    description: "Archetype bonuses are 50% stronger.",
    flavorText: "Your madness echoes through the timeline.",
    cost: 4,
    effects: [{ type: "archetypeBonusMultiplier", value: 1.5, description: "1.5x archetype bonuses" }],
    requires: ["asc_global_boost"],
    tier: 2,
  },
  {
    id: "asc_bp_formula",
    name: "Refined Breakthrough",
    description: "BP formula gives 50% more.",
    flavorText: "Gary found a more efficient way to have epiphanies.",
    cost: 4,
    effects: [{ type: "bpFormulaMultiplier", value: 1.5, description: "1.5x BP gain" }],
    requires: ["asc_bp_seed"],
    tier: 2,
  },
  {
    id: "asc_cheap_prestige",
    name: "Experienced Researcher",
    description: "Prestige upgrades cost 30% less BP.",
    flavorText: "You've done this so many times, it's practically muscle memory.",
    cost: 5,
    effects: [{ type: "prestigeUpgradeCostReduction", value: 0.3, description: "30% cheaper prestige upgrades" }],
    requires: ["asc_bp_formula"],
    tier: 2,
  },
  {
    id: "asc_ip_boost",
    name: "Insight Amplifier",
    description: "2x IP generation permanently.",
    flavorText: "Your brain produces insight like other people produce anxiety.",
    cost: 4,
    effects: [{ type: "ipGainMultiplier", value: 2, description: "2x IP generation" }],
    requires: ["asc_swift_research"],
    tier: 2,
  },
  {
    id: "asc_offline",
    name: "Temporal Persistence",
    description: "+25% offline efficiency.",
    flavorText: "Your lab works even when you're not watching. Especially when you're not watching.",
    cost: 3,
    effects: [{ type: "offlineEfficiencyBonus", value: 0.25, description: "+25% offline efficiency" }],
    requires: ["asc_momentum"],
    tier: 2,
  },
  {
    id: "asc_gen_discount",
    name: "Bulk Supplier",
    description: "Generators cost 20% less.",
    flavorText: "Gary found a wholesaler. They don't ask questions.",
    cost: 3,
    effects: [{ type: "generatorCostReduction", value: 0.2, description: "20% cheaper generators" }],
    requires: ["asc_global_boost"],
    tier: 2,
  },

  // ── Tier 3: Transcendence (6-10 TP) ───────────────────────────
  {
    id: "asc_autobuyer_turbo",
    name: "Autobuyer Turbo",
    description: "Autobuyers run 2x faster.",
    flavorText: "The machines are buying machines that buy machines.",
    cost: 6,
    effects: [{ type: "autobuyerSpeed", value: 2, description: "2x autobuyer speed" }],
    requires: ["asc_gen_discount"],
    tier: 3,
  },
  {
    id: "asc_challenge_amp",
    name: "Challenge Amplifier",
    description: "Challenge rewards are 50% stronger.",
    flavorText: "The harder the road, the sweeter the destination.",
    cost: 7,
    effects: [{ type: "challengeRewardMultiplier", value: 1.5, description: "1.5x challenge rewards" }],
    requires: ["asc_bp_formula"],
    tier: 3,
  },
  {
    id: "asc_neighbor_boost",
    name: "Community Pillar",
    description: "All neighborhood bonuses are 50% stronger.",
    flavorText: "Gary is now the guy everyone goes to. For everything. At all hours.",
    cost: 6,
    effects: [{ type: "neighborhoodBonusMultiplier", value: 1.5, description: "1.5x neighborhood bonuses" }],
    requires: ["asc_archetype_power"],
    tier: 3,
  },
  {
    id: "asc_lab_head_start_2",
    name: "Lab Legacy",
    description: "Start each ascension at lab level 2 (Warehouse).",
    flavorText: "The warehouse was here all along. You just forgot.",
    cost: 8,
    effects: [{ type: "startingLabLevel", value: 2, description: "Start at Warehouse lab level" }],
    requires: ["asc_head_start"],
    tier: 3,
  },
  {
    id: "asc_global_boost_2",
    name: "Universal Constant",
    description: "Another 3x global production.",
    flavorText: "Gary has become a universal constant. Literally.",
    cost: 8,
    effects: [{ type: "globalMultiplier", value: 3, description: "3x global production" }],
    requires: ["asc_archetype_power"],
    tier: 3,
  },
  {
    id: "asc_thesis_boost",
    name: "Thesis Defense",
    description: "Gain 50% more TP on ascension.",
    flavorText: "Your thesis committee is terrified. And impressed. Mostly terrified.",
    cost: 10,
    effects: [{ type: "bpFormulaMultiplier", value: 1.5, description: "1.5x TP gain" }],
    requires: ["asc_challenge_amp", "asc_global_boost_2"],
    tier: 3,
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

export function getAscensionUpgradeDef(id: string): AscensionUpgradeDef | undefined {
  return ASCENSION_UPGRADES.find((u) => u.id === id);
}
