import type { MadnessArchetype } from "../engine/state";

// ── Challenge Definitions ─────────────────────────────────────────────

export type ChallengeRestriction =
  | { type: "singleGeneratorType"; genId: string }
  | { type: "noClicking" }
  | { type: "timeLimit"; seconds: number }
  | { type: "maxGenerators"; maxEach: number }
  | { type: "noUpgrades" }
  | { type: "noPrestigeUpgrades" }
  | { type: "noResearch" }
  | { type: "requireArchetype"; archetype: MadnessArchetype };

export type ChallengeReward =
  | { type: "generatorMultiplier"; genId: string; multiplier: number }
  | { type: "globalMultiplier"; multiplier: number }
  | { type: "bpGainMultiplier"; multiplier: number }
  | { type: "clickMultiplier"; multiplier: number }
  | { type: "offlineEfficiency"; bonus: number }
  | { type: "milestoneMultiplier"; multiplier: number }
  | { type: "specPassiveStrength"; multiplier: number }
  | { type: "ipGainMultiplier"; multiplier: number };

export interface ChallengeDef {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  /** Restrictions active during the challenge run. */
  restrictions: ChallengeRestriction[];
  /** Permanent rewards earned upon completion. */
  rewards: ChallengeReward[];
  /** Human-readable reward description. */
  rewardDescription: string;
  /** Prestige goal — must earn at least this many BP to complete. */
  bpGoal: number;
  /** Required lab level to attempt (default: 1 = Basement). */
  requiredLabLevel: number;
}

// ── Challenge List ──────────────────────────────────────────────────

export const CHALLENGES: ChallengeDef[] = [
  // ── Core Challenges ──────────────────────────────────────────────
  {
    id: "one_trick_notebooks",
    name: "One-Trick Pony: Notebooks",
    description: "Only Notebook generators allowed. Reach the BP goal with sheer volume.",
    flavorText: "Gary filled 47 notebooks with the word 'notebooks.' It counts as research.",
    restrictions: [{ type: "singleGeneratorType", genId: "notebook" }],
    rewards: [{ type: "generatorMultiplier", genId: "notebook", multiplier: 5 }],
    rewardDescription: "5x Notebook production permanently",
    bpGoal: 10,
    requiredLabLevel: 1,
  },
  {
    id: "one_trick_whiteboard",
    name: "One-Trick Pony: Whiteboards",
    description: "Only Whiteboard generators allowed. Draw your way to victory.",
    flavorText: "The entire garage wall is now a whiteboard. Doug offered to help. Gary said no.",
    restrictions: [{ type: "singleGeneratorType", genId: "whiteboard" }],
    rewards: [{ type: "generatorMultiplier", genId: "whiteboard", multiplier: 5 }],
    rewardDescription: "5x Whiteboard production permanently",
    bpGoal: 10,
    requiredLabLevel: 1,
  },
  {
    id: "hands_off",
    name: "Hands Off",
    description: "No clicking allowed. Let your generators do all the work.",
    flavorText: "Gary taped his mouse to the desk. 'Automation,' he whispered. 'This is the way.'",
    restrictions: [{ type: "noClicking" }],
    rewards: [{ type: "offlineEfficiency", bonus: 0.2 }],
    rewardDescription: "+20% offline efficiency permanently",
    bpGoal: 10,
    requiredLabLevel: 1,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Prestige within 5 minutes. Every second counts.",
    flavorText: "Gary's personal best is 4:59. He celebrated by starting another run immediately.",
    restrictions: [{ type: "timeLimit", seconds: 300 }],
    rewards: [{ type: "bpGainMultiplier", multiplier: 1.5 }],
    rewardDescription: "+50% BP gain permanently",
    bpGoal: 5,
    requiredLabLevel: 1,
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Maximum 10 of each generator. Quality over quantity.",
    flavorText: "'Less is more,' Gary said, buying exactly 10 particle accelerators.",
    restrictions: [{ type: "maxGenerators", maxEach: 10 }],
    rewards: [{ type: "milestoneMultiplier", multiplier: 1.5 }],
    rewardDescription: "1.5x milestone multiplier permanently",
    bpGoal: 8,
    requiredLabLevel: 1,
  },
  {
    id: "purist",
    name: "Purist",
    description: "No upgrades allowed. Raw production only.",
    flavorText: "Gary threw out all the fancy equipment. 'Back to basics,' he muttered, using a calculator from 1987.",
    restrictions: [{ type: "noUpgrades" }],
    rewards: [{ type: "globalMultiplier", multiplier: 1.5 }],
    rewardDescription: "1.5x global production permanently",
    bpGoal: 10,
    requiredLabLevel: 1,
  },
  {
    id: "click_frenzy",
    name: "Click Frenzy",
    description: "No generators. Only clicking. Good luck with that carpal tunnel.",
    flavorText: "Gary's mouse is making noises it shouldn't. His hand is making noises it REALLY shouldn't.",
    restrictions: [
      { type: "maxGenerators", maxEach: 0 },
    ],
    rewards: [{ type: "clickMultiplier", multiplier: 3 }],
    rewardDescription: "3x click value permanently",
    bpGoal: 5,
    requiredLabLevel: 1,
  },

  // ── Advanced Challenges ──────────────────────────────────────────
  {
    id: "naked_run",
    name: "Naked Run",
    description: "No upgrades, no prestige upgrades, no research. Just you and your generators.",
    flavorText: "Gary stripped the lab of everything. 'Purity,' he said, covered in duct tape.",
    restrictions: [
      { type: "noUpgrades" },
      { type: "noPrestigeUpgrades" },
      { type: "noResearch" },
    ],
    rewards: [{ type: "globalMultiplier", multiplier: 2 }],
    rewardDescription: "2x global production permanently",
    bpGoal: 15,
    requiredLabLevel: 2,
  },
  {
    id: "speed_master",
    name: "Speed Master",
    description: "Prestige within 3 minutes. For true speedrunners only.",
    flavorText: "Gary's run was so fast, he forgot to breathe. Twice.",
    restrictions: [{ type: "timeLimit", seconds: 180 }],
    rewards: [{ type: "bpGainMultiplier", multiplier: 2 }],
    rewardDescription: "2x BP gain permanently",
    bpGoal: 5,
    requiredLabLevel: 2,
  },
  {
    id: "insight_hunter",
    name: "Insight Hunter",
    description: "No upgrades and no clicking. Earn IP through pure production patience.",
    flavorText: "'Patience is a virtue,' Gary said, watching paint dry. Literally. It's an experiment.",
    restrictions: [
      { type: "noClicking" },
      { type: "noUpgrades" },
    ],
    rewards: [{ type: "ipGainMultiplier", multiplier: 1.5 }],
    rewardDescription: "1.5x IP gain permanently",
    bpGoal: 10,
    requiredLabLevel: 2,
  },

  // ── Archetype Mastery Challenges ─────────────────────────────────
  {
    id: "mastery_megalomaniac",
    name: "Archetype Mastery: Megalomaniac",
    description: "Complete a run as a Megalomaniac specialist. Show them ALL.",
    flavorText: "They laughed at Gary. They ALL laughed. They won't be laughing soon.",
    restrictions: [{ type: "requireArchetype", archetype: "megalomaniac" }],
    rewards: [{ type: "specPassiveStrength", multiplier: 1.5 }],
    rewardDescription: "Megalomaniac specialization passive 50% stronger",
    bpGoal: 15,
    requiredLabLevel: 1,
  },
  {
    id: "mastery_perfectionist",
    name: "Archetype Mastery: Perfectionist",
    description: "Complete a run as a Perfectionist specialist. No shortcuts.",
    flavorText: "Gary aligned every molecule in the lab. Twice. The second time was better.",
    restrictions: [{ type: "requireArchetype", archetype: "perfectionist" }],
    rewards: [{ type: "specPassiveStrength", multiplier: 1.5 }],
    rewardDescription: "Perfectionist specialization passive 50% stronger",
    bpGoal: 15,
    requiredLabLevel: 1,
  },
  {
    id: "mastery_unhinged",
    name: "Archetype Mastery: Unhinged",
    description: "Complete a run as an Unhinged specialist. Safety third.",
    flavorText: "Gary removed the safety labels. Then the safety equipment. Then the doors.",
    restrictions: [{ type: "requireArchetype", archetype: "unhinged" }],
    rewards: [{ type: "specPassiveStrength", multiplier: 1.5 }],
    rewardDescription: "Unhinged specialization passive 50% stronger",
    bpGoal: 15,
    requiredLabLevel: 1,
  },
  {
    id: "mastery_realityBreaker",
    name: "Archetype Mastery: Reality Breaker",
    description: "Complete a run as a Reality Breaker specialist. Physics are guidelines.",
    flavorText: "The laws of thermodynamics filed a restraining order. Gary ignored it.",
    restrictions: [{ type: "requireArchetype", archetype: "realityBreaker" }],
    rewards: [{ type: "specPassiveStrength", multiplier: 1.5 }],
    rewardDescription: "Reality Breaker specialization passive 50% stronger",
    bpGoal: 15,
    requiredLabLevel: 1,
  },
  {
    id: "mastery_gadgeteer",
    name: "Archetype Mastery: Gadgeteer",
    description: "Complete a run as a Gadgeteer specialist. If it's not broken, add more gears.",
    flavorText: "Gary's toaster now makes coffee. His coffee maker now produces antimatter. It's fine.",
    restrictions: [{ type: "requireArchetype", archetype: "gadgeteer" }],
    rewards: [{ type: "specPassiveStrength", multiplier: 1.5 }],
    rewardDescription: "Gadgeteer specialization passive 50% stronger",
    bpGoal: 15,
    requiredLabLevel: 1,
  },
  {
    id: "mastery_accidentalGenius",
    name: "Archetype Mastery: Accidental Genius",
    description: "Complete a run as an Accidental Genius specialist. Trip your way to greatness.",
    flavorText: "Gary sneezed into a beaker and cured something. He's not sure what. Neither is the CDC.",
    restrictions: [{ type: "requireArchetype", archetype: "accidentalGenius" }],
    rewards: [{ type: "specPassiveStrength", multiplier: 1.5 }],
    rewardDescription: "Accidental Genius specialization passive 50% stronger",
    bpGoal: 15,
    requiredLabLevel: 1,
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

export function getChallengeDef(id: string): ChallengeDef | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

/** Get all challenges available at the player's current lab level. */
export function getAvailableChallenges(labLevel: number): ChallengeDef[] {
  return CHALLENGES.filter((c) => labLevel >= c.requiredLabLevel);
}
