import type { MadnessArchetype } from "../engine/state";

// ── Achievement Tier ─────────────────────────────────────────────────

export type AchievementTier = "bronze" | "silver" | "gold";

// ── Achievement Reward Types ─────────────────────────────────────────

export type AchievementReward =
  | { type: "globalMultiplier"; multiplier: number }
  | { type: "generatorMultiplier"; target: string; multiplier: number }
  | { type: "clickMultiplier"; multiplier: number }
  | { type: "ipGainMultiplier"; multiplier: number }
  | { type: "bpGainMultiplier"; multiplier: number }
  | { type: "offlineEfficiencyBonus"; bonus: number };

// ── Achievement Trigger Types ────────────────────────────────────────

export type AchievementTrigger =
  | { type: "clickCount"; count: number }
  | { type: "totalRPAllTime"; amount: number }
  | { type: "totalRPThisRun"; amount: number }
  | { type: "generatorOwned"; genId: string; count: number }
  | { type: "generatorOwnedTotal"; count: number } // total across all gens
  | { type: "allGeneratorsOwned"; count: number } // each gen has at least N
  | { type: "distinctGenerators"; count: number } // how many different gen types owned
  | { type: "upgradeCount"; count: number }
  | { type: "prestigeCount"; count: number }
  | { type: "prestigeUpgradeCount"; count: number }
  | { type: "researchCount"; count: number } // total completed research
  | { type: "totalPlaytimeSec"; seconds: number }
  | { type: "fastestPrestigeSec"; seconds: number } // fastest prestige under N seconds
  | { type: "madnessLevel"; level: number }
  | { type: "dominantArchetype"; archetype: MadnessArchetype }
  | { type: "bpTotal"; amount: number }
  | { type: "ipTotal"; amount: number };

// ── Achievement Definition ───────────────────────────────────────────

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  trigger: AchievementTrigger;
  reward: AchievementReward;
  rewardDescription: string;
  /** If true, description is hidden until unlocked. */
  secret?: boolean;
}

// ── Achievement Definitions ──────────────────────────────────────────

export const ACHIEVEMENTS: AchievementDef[] = [
  // ═══════════════════════════════════════════════════════════════════
  // CLICKING ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "click_10",
    name: "First Steps",
    description: "Click 10 times.",
    tier: "bronze",
    trigger: { type: "clickCount", count: 10 },
    reward: { type: "clickMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x click power",
  },
  {
    id: "click_100",
    name: "Dedicated Clicker",
    description: "Click 100 times.",
    tier: "bronze",
    trigger: { type: "clickCount", count: 100 },
    reward: { type: "clickMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x click power",
  },
  {
    id: "click_500",
    name: "Carpal Tunnel Candidate",
    description: "Click 500 times.",
    tier: "silver",
    trigger: { type: "clickCount", count: 500 },
    reward: { type: "clickMultiplier", multiplier: 1.5 },
    rewardDescription: "1.5x click power",
  },
  {
    id: "click_1000",
    name: "The Human Piston",
    description: "Click 1,000 times.",
    tier: "silver",
    trigger: { type: "clickCount", count: 1000 },
    reward: { type: "clickMultiplier", multiplier: 2 },
    rewardDescription: "2x click power",
  },
  {
    id: "click_5000",
    name: "Finger of God",
    description: "Click 5,000 times.",
    tier: "gold",
    trigger: { type: "clickCount", count: 5000 },
    reward: { type: "clickMultiplier", multiplier: 3 },
    rewardDescription: "3x click power",
  },
  {
    id: "click_10000",
    name: "Beyond Mortal Clicking",
    description: "Click 10,000 times.",
    tier: "gold",
    trigger: { type: "clickCount", count: 10000 },
    reward: { type: "clickMultiplier", multiplier: 5 },
    rewardDescription: "5x click power",
  },

  // ═══════════════════════════════════════════════════════════════════
  // RP MILESTONES
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "rp_1k",
    name: "Pocket Change",
    description: "Earn 1,000 total RP.",
    tier: "bronze",
    trigger: { type: "totalRPAllTime", amount: 1000 },
    reward: { type: "globalMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x all production",
  },
  {
    id: "rp_1m",
    name: "Serious Funding",
    description: "Earn 1,000,000 total RP.",
    tier: "bronze",
    trigger: { type: "totalRPAllTime", amount: 1e6 },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },
  {
    id: "rp_1b",
    name: "Grant Money",
    description: "Earn 1,000,000,000 total RP.",
    tier: "silver",
    trigger: { type: "totalRPAllTime", amount: 1e9 },
    reward: { type: "globalMultiplier", multiplier: 1.5 },
    rewardDescription: "1.5x all production",
  },
  {
    id: "rp_1t",
    name: "National Budget",
    description: "Earn 1 trillion total RP.",
    tier: "silver",
    trigger: { type: "totalRPAllTime", amount: 1e12 },
    reward: { type: "globalMultiplier", multiplier: 2 },
    rewardDescription: "2x all production",
  },
  {
    id: "rp_1qa",
    name: "GDP of Science",
    description: "Earn 1 quadrillion total RP.",
    tier: "gold",
    trigger: { type: "totalRPAllTime", amount: 1e15 },
    reward: { type: "globalMultiplier", multiplier: 3 },
    rewardDescription: "3x all production",
  },

  // ═══════════════════════════════════════════════════════════════════
  // GENERATOR MILESTONES (per-generator)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "notebook_50",
    name: "Notebook Hoarder",
    description: "Own 50 Spiral Notebooks.",
    tier: "bronze",
    trigger: { type: "generatorOwned", genId: "notebook", count: 50 },
    reward: { type: "generatorMultiplier", target: "notebook", multiplier: 1.5 },
    rewardDescription: "1.5x notebook production",
  },
  {
    id: "notebook_200",
    name: "Library of Alexandria",
    description: "Own 200 Spiral Notebooks.",
    tier: "silver",
    trigger: { type: "generatorOwned", genId: "notebook", count: 200 },
    reward: { type: "generatorMultiplier", target: "notebook", multiplier: 2 },
    rewardDescription: "2x notebook production",
  },
  {
    id: "notebook_500",
    name: "Deforestation Event",
    description: "Own 500 Spiral Notebooks.",
    tier: "gold",
    trigger: { type: "generatorOwned", genId: "notebook", count: 500 },
    reward: { type: "generatorMultiplier", target: "notebook", multiplier: 3 },
    rewardDescription: "3x notebook production",
  },
  {
    id: "soldering_50",
    name: "Burnt Fingers",
    description: "Own 50 Soldering Stations.",
    tier: "bronze",
    trigger: { type: "generatorOwned", genId: "soldering", count: 50 },
    reward: { type: "generatorMultiplier", target: "soldering", multiplier: 1.5 },
    rewardDescription: "1.5x soldering production",
  },
  {
    id: "soldering_200",
    name: "Solder Everything",
    description: "Own 200 Soldering Stations.",
    tier: "silver",
    trigger: { type: "generatorOwned", genId: "soldering", count: 200 },
    reward: { type: "generatorMultiplier", target: "soldering", multiplier: 2 },
    rewardDescription: "2x soldering production",
  },
  {
    id: "chemistry_50",
    name: "Safety Goggles Optional",
    description: "Own 50 Chemistry Sets.",
    tier: "bronze",
    trigger: { type: "generatorOwned", genId: "chemistry", count: 50 },
    reward: { type: "generatorMultiplier", target: "chemistry", multiplier: 1.5 },
    rewardDescription: "1.5x chemistry production",
  },
  {
    id: "chemistry_200",
    name: "Breaking Bad",
    description: "Own 200 Chemistry Sets.",
    tier: "silver",
    trigger: { type: "generatorOwned", genId: "chemistry", count: 200 },
    reward: { type: "generatorMultiplier", target: "chemistry", multiplier: 2 },
    rewardDescription: "2x chemistry production",
  },
  {
    id: "server_50",
    name: "Data Center",
    description: "Own 50 Server Racks.",
    tier: "bronze",
    trigger: { type: "generatorOwned", genId: "server", count: 50 },
    reward: { type: "generatorMultiplier", target: "server", multiplier: 1.5 },
    rewardDescription: "1.5x server production",
  },
  {
    id: "server_200",
    name: "Cloud Computing",
    description: "Own 200 Server Racks.",
    tier: "silver",
    trigger: { type: "generatorOwned", genId: "server", count: 200 },
    reward: { type: "generatorMultiplier", target: "server", multiplier: 2 },
    rewardDescription: "2x server production",
  },
  {
    id: "prototype_50",
    name: "Assembly Line",
    description: "Own 50 Prototype Machines.",
    tier: "silver",
    trigger: { type: "generatorOwned", genId: "prototype", count: 50 },
    reward: { type: "generatorMultiplier", target: "prototype", multiplier: 1.5 },
    rewardDescription: "1.5x prototype production",
  },
  {
    id: "containment_50",
    name: "Containment Breach",
    description: "Own 50 Containment Chambers.",
    tier: "silver",
    trigger: { type: "generatorOwned", genId: "containment", count: 50 },
    reward: { type: "generatorMultiplier", target: "containment", multiplier: 1.5 },
    rewardDescription: "1.5x containment production",
  },
  {
    id: "collider_25",
    name: "Particle Party",
    description: "Own 25 Particle Colliders.",
    tier: "silver",
    trigger: { type: "generatorOwned", genId: "collider", count: 25 },
    reward: { type: "generatorMultiplier", target: "collider", multiplier: 1.5 },
    rewardDescription: "1.5x collider production",
  },
  {
    id: "collider_100",
    name: "Mini CERN",
    description: "Own 100 Particle Colliders.",
    tier: "gold",
    trigger: { type: "generatorOwned", genId: "collider", count: 100 },
    reward: { type: "generatorMultiplier", target: "collider", multiplier: 3 },
    rewardDescription: "3x collider production",
  },
  {
    id: "mindlink_25",
    name: "Hive Mind",
    description: "Own 25 Mind-Link Arrays.",
    tier: "silver",
    trigger: { type: "generatorOwned", genId: "mindlink", count: 25 },
    reward: { type: "generatorMultiplier", target: "mindlink", multiplier: 1.5 },
    rewardDescription: "1.5x mind-link production",
  },
  {
    id: "reality_25",
    name: "Reality TV",
    description: "Own 25 Reality Engines.",
    tier: "gold",
    trigger: { type: "generatorOwned", genId: "reality", count: 25 },
    reward: { type: "generatorMultiplier", target: "reality", multiplier: 2 },
    rewardDescription: "2x reality engine production",
  },
  {
    id: "cosmic_10",
    name: "Fabric of Spacetime",
    description: "Own 10 Cosmic Looms.",
    tier: "gold",
    trigger: { type: "generatorOwned", genId: "cosmic", count: 10 },
    reward: { type: "generatorMultiplier", target: "cosmic", multiplier: 2 },
    rewardDescription: "2x cosmic loom production",
  },
  {
    id: "cosmic_50",
    name: "Master Weaver",
    description: "Own 50 Cosmic Looms.",
    tier: "gold",
    trigger: { type: "generatorOwned", genId: "cosmic", count: 50 },
    reward: { type: "generatorMultiplier", target: "cosmic", multiplier: 5 },
    rewardDescription: "5x cosmic loom production",
  },

  // ═══════════════════════════════════════════════════════════════════
  // COLLECTION / DIVERSITY ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "distinct_3",
    name: "Diversified Portfolio",
    description: "Own at least 3 different generator types.",
    tier: "bronze",
    trigger: { type: "distinctGenerators", count: 3 },
    reward: { type: "globalMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x all production",
  },
  {
    id: "distinct_5",
    name: "Jack of All Trades",
    description: "Own at least 5 different generator types.",
    tier: "bronze",
    trigger: { type: "distinctGenerators", count: 5 },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },
  {
    id: "distinct_8",
    name: "Renaissance Scientist",
    description: "Own at least 8 different generator types.",
    tier: "silver",
    trigger: { type: "distinctGenerators", count: 8 },
    reward: { type: "globalMultiplier", multiplier: 1.5 },
    rewardDescription: "1.5x all production",
  },
  {
    id: "distinct_10",
    name: "Full Lab",
    description: "Own at least 1 of every generator type.",
    tier: "gold",
    trigger: { type: "distinctGenerators", count: 10 },
    reward: { type: "globalMultiplier", multiplier: 2 },
    rewardDescription: "2x all production",
  },
  {
    id: "all_gens_25",
    name: "Balanced Approach",
    description: "Own at least 25 of every generator type.",
    tier: "gold",
    trigger: { type: "allGeneratorsOwned", count: 25 },
    reward: { type: "globalMultiplier", multiplier: 2 },
    rewardDescription: "2x all production",
  },
  {
    id: "all_gens_100",
    name: "Full Set",
    description: "Own at least 100 of every generator type.",
    tier: "gold",
    trigger: { type: "allGeneratorsOwned", count: 100 },
    reward: { type: "globalMultiplier", multiplier: 3 },
    rewardDescription: "3x all production",
  },
  {
    id: "total_gens_100",
    name: "Bulk Order",
    description: "Own 100 total generators (combined).",
    tier: "bronze",
    trigger: { type: "generatorOwnedTotal", count: 100 },
    reward: { type: "globalMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x all production",
  },
  {
    id: "total_gens_500",
    name: "Industrial Scale",
    description: "Own 500 total generators.",
    tier: "silver",
    trigger: { type: "generatorOwnedTotal", count: 500 },
    reward: { type: "globalMultiplier", multiplier: 1.3 },
    rewardDescription: "1.3x all production",
  },
  {
    id: "total_gens_2000",
    name: "Factory Floor",
    description: "Own 2,000 total generators.",
    tier: "gold",
    trigger: { type: "generatorOwnedTotal", count: 2000 },
    reward: { type: "globalMultiplier", multiplier: 2 },
    rewardDescription: "2x all production",
  },

  // ═══════════════════════════════════════════════════════════════════
  // UPGRADE ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "upgrades_5",
    name: "Tinkerer",
    description: "Purchase 5 upgrades.",
    tier: "bronze",
    trigger: { type: "upgradeCount", count: 5 },
    reward: { type: "globalMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x all production",
  },
  {
    id: "upgrades_15",
    name: "Optimizer",
    description: "Purchase 15 upgrades.",
    tier: "silver",
    trigger: { type: "upgradeCount", count: 15 },
    reward: { type: "globalMultiplier", multiplier: 1.3 },
    rewardDescription: "1.3x all production",
  },
  {
    id: "upgrades_all",
    name: "Upgrade Completionist",
    description: "Purchase all 30 upgrades in a single run.",
    tier: "gold",
    trigger: { type: "upgradeCount", count: 30 },
    reward: { type: "globalMultiplier", multiplier: 2 },
    rewardDescription: "2x all production",
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRESTIGE ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "prestige_1",
    name: "Snap Out of It!",
    description: "Prestige for the first time.",
    tier: "bronze",
    trigger: { type: "prestigeCount", count: 1 },
    reward: { type: "bpGainMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x BP gain",
  },
  {
    id: "prestige_3",
    name: "Repeat Offender",
    description: "Prestige 3 times.",
    tier: "bronze",
    trigger: { type: "prestigeCount", count: 3 },
    reward: { type: "bpGainMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x BP gain",
  },
  {
    id: "prestige_10",
    name: "Serial Resetter",
    description: "Prestige 10 times.",
    tier: "silver",
    trigger: { type: "prestigeCount", count: 10 },
    reward: { type: "bpGainMultiplier", multiplier: 1.5 },
    rewardDescription: "1.5x BP gain",
  },
  {
    id: "prestige_25",
    name: "Groundhog Scientist",
    description: "Prestige 25 times.",
    tier: "gold",
    trigger: { type: "prestigeCount", count: 25 },
    reward: { type: "bpGainMultiplier", multiplier: 2 },
    rewardDescription: "2x BP gain",
  },
  {
    id: "prestige_50",
    name: "Eternal Return",
    description: "Prestige 50 times.",
    tier: "gold",
    trigger: { type: "prestigeCount", count: 50 },
    reward: { type: "bpGainMultiplier", multiplier: 3 },
    rewardDescription: "3x BP gain",
  },

  // ═══════════════════════════════════════════════════════════════════
  // SPEED RUN ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "speed_30m",
    name: "Quick Study",
    description: "Prestige in under 30 minutes.",
    tier: "bronze",
    trigger: { type: "fastestPrestigeSec", seconds: 1800 },
    reward: { type: "bpGainMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x BP gain",
  },
  {
    id: "speed_15m",
    name: "Speed Demon",
    description: "Prestige in under 15 minutes.",
    tier: "silver",
    trigger: { type: "fastestPrestigeSec", seconds: 900 },
    reward: { type: "bpGainMultiplier", multiplier: 1.5 },
    rewardDescription: "1.5x BP gain",
  },
  {
    id: "speed_10m",
    name: "Speed Run",
    description: "Prestige in under 10 minutes.",
    tier: "gold",
    trigger: { type: "fastestPrestigeSec", seconds: 600 },
    reward: { type: "bpGainMultiplier", multiplier: 2 },
    rewardDescription: "2x BP gain",
  },
  {
    id: "speed_5m",
    name: "Blink and You'll Miss It",
    description: "Prestige in under 5 minutes.",
    tier: "gold",
    trigger: { type: "fastestPrestigeSec", seconds: 300 },
    reward: { type: "bpGainMultiplier", multiplier: 3 },
    rewardDescription: "3x BP gain",
    secret: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRESTIGE UPGRADE ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "prestige_ups_3",
    name: "Breakthrough Buyer",
    description: "Purchase 3 prestige upgrades.",
    tier: "bronze",
    trigger: { type: "prestigeUpgradeCount", count: 3 },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },
  {
    id: "prestige_ups_8",
    name: "Investment Portfolio",
    description: "Purchase 8 prestige upgrades.",
    tier: "silver",
    trigger: { type: "prestigeUpgradeCount", count: 8 },
    reward: { type: "globalMultiplier", multiplier: 1.5 },
    rewardDescription: "1.5x all production",
  },
  {
    id: "prestige_ups_all",
    name: "Fully Upgraded",
    description: "Purchase all prestige upgrades.",
    tier: "gold",
    trigger: { type: "prestigeUpgradeCount", count: 14 },
    reward: { type: "globalMultiplier", multiplier: 3 },
    rewardDescription: "3x all production",
  },

  // ═══════════════════════════════════════════════════════════════════
  // RESEARCH ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "research_5",
    name: "Corkboard Beginner",
    description: "Complete 5 research nodes.",
    tier: "bronze",
    trigger: { type: "researchCount", count: 5 },
    reward: { type: "ipGainMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x IP gain",
  },
  {
    id: "research_15",
    name: "String Theory",
    description: "Complete 15 research nodes.",
    tier: "silver",
    trigger: { type: "researchCount", count: 15 },
    reward: { type: "ipGainMultiplier", multiplier: 1.5 },
    rewardDescription: "1.5x IP gain",
  },
  {
    id: "research_30",
    name: "Beautiful Mind",
    description: "Complete 30 research nodes.",
    tier: "gold",
    trigger: { type: "researchCount", count: 30 },
    reward: { type: "ipGainMultiplier", multiplier: 2 },
    rewardDescription: "2x IP gain",
  },

  // ═══════════════════════════════════════════════════════════════════
  // BP ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "bp_100",
    name: "Breaking Through",
    description: "Accumulate 100 BP.",
    tier: "bronze",
    trigger: { type: "bpTotal", amount: 100 },
    reward: { type: "bpGainMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x BP gain",
  },
  {
    id: "bp_1000",
    name: "Breakthrough Investor",
    description: "Accumulate 1,000 BP.",
    tier: "silver",
    trigger: { type: "bpTotal", amount: 1000 },
    reward: { type: "bpGainMultiplier", multiplier: 1.3 },
    rewardDescription: "1.3x BP gain",
  },
  {
    id: "bp_10000",
    name: "Breakthrough Mogul",
    description: "Accumulate 10,000 BP.",
    tier: "gold",
    trigger: { type: "bpTotal", amount: 10000 },
    reward: { type: "bpGainMultiplier", multiplier: 2 },
    rewardDescription: "2x BP gain",
  },

  // ═══════════════════════════════════════════════════════════════════
  // IP ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "ip_100",
    name: "Insightful",
    description: "Earn 100 total IP.",
    tier: "bronze",
    trigger: { type: "ipTotal", amount: 100 },
    reward: { type: "ipGainMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x IP gain",
  },
  {
    id: "ip_1000",
    name: "Deep Thinker",
    description: "Earn 1,000 total IP.",
    tier: "silver",
    trigger: { type: "ipTotal", amount: 1000 },
    reward: { type: "ipGainMultiplier", multiplier: 1.3 },
    rewardDescription: "1.3x IP gain",
  },
  {
    id: "ip_10000",
    name: "Transcendent Intellect",
    description: "Earn 10,000 total IP.",
    tier: "gold",
    trigger: { type: "ipTotal", amount: 10000 },
    reward: { type: "ipGainMultiplier", multiplier: 2 },
    rewardDescription: "2x IP gain",
  },

  // ═══════════════════════════════════════════════════════════════════
  // PLAYTIME ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "time_1h",
    name: "Just Getting Started",
    description: "Play for 1 hour total.",
    tier: "bronze",
    trigger: { type: "totalPlaytimeSec", seconds: 3600 },
    reward: { type: "globalMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x all production",
  },
  {
    id: "time_8h",
    name: "Full Shift",
    description: "Play for 8 hours total.",
    tier: "silver",
    trigger: { type: "totalPlaytimeSec", seconds: 28800 },
    reward: { type: "globalMultiplier", multiplier: 1.3 },
    rewardDescription: "1.3x all production",
  },
  {
    id: "time_24h",
    name: "The Long Game",
    description: "Play for 24 hours total.",
    tier: "gold",
    trigger: { type: "totalPlaytimeSec", seconds: 86400 },
    reward: { type: "offlineEfficiencyBonus", bonus: 0.1 },
    rewardDescription: "+10% offline efficiency",
  },
  {
    id: "time_100h",
    name: "Obsessed",
    description: "Play for 100 hours total.",
    tier: "gold",
    trigger: { type: "totalPlaytimeSec", seconds: 360000 },
    reward: { type: "globalMultiplier", multiplier: 2 },
    rewardDescription: "2x all production",
    secret: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // MADNESS / ARCHETYPE ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "madness_1",
    name: "Slightly Unhinged",
    description: "Reach madness level 1.",
    tier: "bronze",
    trigger: { type: "madnessLevel", level: 1 },
    reward: { type: "globalMultiplier", multiplier: 1.1 },
    rewardDescription: "1.1x all production",
  },
  {
    id: "madness_3",
    name: "Losing It",
    description: "Reach madness level 3.",
    tier: "silver",
    trigger: { type: "madnessLevel", level: 3 },
    reward: { type: "globalMultiplier", multiplier: 1.3 },
    rewardDescription: "1.3x all production",
  },
  {
    id: "madness_5",
    name: "Full Mad Scientist",
    description: "Reach madness level 5.",
    tier: "gold",
    trigger: { type: "madnessLevel", level: 5 },
    reward: { type: "globalMultiplier", multiplier: 2 },
    rewardDescription: "2x all production",
  },
  {
    id: "madness_8",
    name: "Beyond Sanity",
    description: "Reach madness level 8.",
    tier: "gold",
    trigger: { type: "madnessLevel", level: 8 },
    reward: { type: "globalMultiplier", multiplier: 3 },
    rewardDescription: "3x all production",
    secret: true,
  },
  {
    id: "arch_megalomaniac",
    name: "World Domination",
    description: "Become a Megalomaniac.",
    tier: "silver",
    trigger: { type: "dominantArchetype", archetype: "megalomaniac" },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },
  {
    id: "arch_perfectionist",
    name: "Nothing Less Than Perfect",
    description: "Become a Perfectionist.",
    tier: "silver",
    trigger: { type: "dominantArchetype", archetype: "perfectionist" },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },
  {
    id: "arch_unhinged",
    name: "Ethics? Never Heard of Her",
    description: "Become Ethically Unhinged.",
    tier: "silver",
    trigger: { type: "dominantArchetype", archetype: "unhinged" },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },
  {
    id: "arch_realityBreaker",
    name: "Physics Called, You Declined",
    description: "Become a Reality Breaker.",
    tier: "silver",
    trigger: { type: "dominantArchetype", archetype: "realityBreaker" },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },
  {
    id: "arch_gadgeteer",
    name: "If It Ain't Broke, Improve It",
    description: "Become a Gadgeteer.",
    tier: "silver",
    trigger: { type: "dominantArchetype", archetype: "gadgeteer" },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },
  {
    id: "arch_accidentalGenius",
    name: "Wait, That Worked?",
    description: "Become an Accidental Genius.",
    tier: "silver",
    trigger: { type: "dominantArchetype", archetype: "accidentalGenius" },
    reward: { type: "globalMultiplier", multiplier: 1.2 },
    rewardDescription: "1.2x all production",
  },

  // ═══════════════════════════════════════════════════════════════════
  // SECRET / SPECIAL ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "run_rp_1e10",
    name: "Billionaire Run",
    description: "Earn 10 billion RP in a single run.",
    tier: "silver",
    trigger: { type: "totalRPThisRun", amount: 1e10 },
    reward: { type: "globalMultiplier", multiplier: 1.5 },
    rewardDescription: "1.5x all production",
  },
  {
    id: "run_rp_1e15",
    name: "Quadrillionaire Run",
    description: "Earn 1 quadrillion RP in a single run.",
    tier: "gold",
    trigger: { type: "totalRPThisRun", amount: 1e15 },
    reward: { type: "globalMultiplier", multiplier: 3 },
    rewardDescription: "3x all production",
    secret: true,
  },
];

// ── Lookup Helpers ───────────────────────────────────────────────────

const ACHIEVEMENT_MAP = new Map<string, AchievementDef>(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_MAP.get(id);
}

export const ACHIEVEMENT_COUNT = ACHIEVEMENTS.length;

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

export const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};
