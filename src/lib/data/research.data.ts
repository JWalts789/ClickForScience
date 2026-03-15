import type { MadnessArchetype } from "../engine/state";

// ── Research Effect Types ────────────────────────────────────────────

export type ResearchEffect =
  | { type: "globalMultiplier"; multiplier: number }
  | { type: "generatorMultiplier"; target: string; multiplier: number }
  | { type: "clickMultiplier"; multiplier: number }
  | { type: "clickPercentOfProduction"; percent: number }
  | { type: "ipGainMultiplier"; multiplier: number }
  | { type: "researchSpeedMultiplier"; multiplier: number }
  | { type: "bpGainMultiplier"; multiplier: number }
  | { type: "offlineEfficiencyBonus"; bonus: number };

// ── Research Node Definition ─────────────────────────────────────────

export interface ResearchNodeDef {
  id: string;
  name: string;
  description: string;
  /** Humorous flavor text for Gary's corkboard. */
  flavorText: string;
  /** Visual tier row (1-6). */
  tier: number;
  /** IP cost to start researching. */
  ipCost: number;
  /** Time in seconds to complete once started. */
  researchTimeSec: number;
  /** Must have completed ALL of these nodes. */
  requires: string[];
  /** Must have completed at least ONE of these nodes (OR prerequisite). */
  requiresAny?: string[];
  /** Mutually exclusive — cannot research if any of these are completed. */
  exclusive?: string[];
  /** Only available when this archetype is dominant. */
  archetypeRequired?: MadnessArchetype;
  /** What completing this node grants. */
  effects: ResearchEffect[];
  /** If true, stays completed across prestige. If false, resets each run. */
  persistsOnPrestige: boolean;
}

// ── Research Tree ────────────────────────────────────────────────────
//
// Layout: Gary's Corkboard — a conspiracy-board of interconnected ideas.
//
// Trunk (T1-T2): Always available, persists across prestige
// Production Branch (T2-T5): Power boosts, resets on prestige
// Click Branch (T2-T5): Click boosts, resets on prestige
// Insight Branch (T2-T5): IP/research/BP meta, persists across prestige
// Exclusive Pairs (T3-T4): Pick-one choices, resets on prestige
// Archetype Branches (T4-T5): 3 nodes per archetype, resets on prestige

export const RESEARCH_NODES: ResearchNodeDef[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TRUNK — Foundation (persists across prestige)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "scientific_method",
    name: "The Scientific Method",
    description: "All generators produce 1.5x more RP.",
    flavorText: "Step 1: Ask a question. Step 2: Ignore the question. Step 3: Build something dangerous.",
    tier: 1,
    ipCost: 10,
    researchTimeSec: 30,
    requires: [],
    effects: [{ type: "globalMultiplier", multiplier: 1.5 }],
    persistsOnPrestige: true,
  },
  {
    id: "documentation",
    name: "Actually Writing Things Down",
    description: "IP generation increased by 1.5x.",
    flavorText: "The notebook said 'DO NOT FORGET THIS.' The next page was blank.",
    tier: 1,
    ipCost: 15,
    researchTimeSec: 45,
    requires: [],
    effects: [{ type: "ipGainMultiplier", multiplier: 1.5 }],
    persistsOnPrestige: true,
  },
  {
    id: "hypothesis_testing",
    name: "Hypothesis Testing",
    description: "Research completes 1.5x faster.",
    flavorText: "Hypothesis: this will work. Test: it exploded. Conclusion: needs more tape.",
    tier: 2,
    ipCost: 40,
    researchTimeSec: 90,
    requires: ["scientific_method"],
    effects: [{ type: "researchSpeedMultiplier", multiplier: 1.5 }],
    persistsOnPrestige: true,
  },
  {
    id: "peer_review",
    name: "Peer Review (Doug Read It)",
    description: "BP gain increased by 1.3x.",
    flavorText: "Doug's feedback: 'This is insane.' Gary's note in margin: 'He gets it.'",
    tier: 2,
    ipCost: 50,
    researchTimeSec: 120,
    requires: ["documentation"],
    effects: [{ type: "bpGainMultiplier", multiplier: 1.3 }],
    persistsOnPrestige: true,
  },

  // ── Auto-Buyer Unlock (Trunk, persists) ────────────────────────────

  {
    id: "autobuyer_protocol",
    name: "Automated Purchasing Protocol",
    description: "Unlocks auto-buyers for all generators.",
    flavorText: "Why click 'Buy' yourself when a very fragile script can do it for you?",
    tier: 3,
    ipCost: 150,
    researchTimeSec: 300,
    requires: ["hypothesis_testing"],
    effects: [], // Unlock only — no numeric effects
    persistsOnPrestige: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRODUCTION BRANCH — Raw power (resets on prestige)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "workflow_optimization",
    name: "Workflow Optimization",
    description: "All generators produce 2x more RP.",
    flavorText: "Rearranged the garage. Found three notebooks, a soldering iron, and what might be a squirrel.",
    tier: 2,
    ipCost: 60,
    researchTimeSec: 150,
    requires: ["scientific_method"],
    effects: [{ type: "globalMultiplier", multiplier: 2 }],
    persistsOnPrestige: false,
  },
  {
    id: "parallel_experiments",
    name: "Parallel Experiments",
    description: "Notebooks 3x, Soldering Stations 3x.",
    flavorText: "Running six experiments at once. Three are on fire. This is fine.",
    tier: 3,
    ipCost: 200,
    researchTimeSec: 480,
    requires: ["workflow_optimization"],
    effects: [
      { type: "generatorMultiplier", target: "notebook", multiplier: 3 },
      { type: "generatorMultiplier", target: "soldering", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "advanced_materials",
    name: "Advanced Materials Science",
    description: "Chemistry Sets 3x, Containment Chambers 3x.",
    flavorText: "Created a new element. It's angry. Named it Garynium.",
    tier: 3,
    ipCost: 250,
    researchTimeSec: 540,
    requires: ["workflow_optimization"],
    effects: [
      { type: "generatorMultiplier", target: "chemistry", multiplier: 3 },
      { type: "generatorMultiplier", target: "containment", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "computational_modeling",
    name: "Computational Modeling",
    description: "Server Racks 3x, Prototype Machines 3x.",
    flavorText: "The simulation predicted its own existence. It's having a crisis.",
    tier: 3,
    ipCost: 250,
    researchTimeSec: 540,
    requires: ["workflow_optimization"],
    effects: [
      { type: "generatorMultiplier", target: "server", multiplier: 3 },
      { type: "generatorMultiplier", target: "prototype", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "mass_production",
    name: "Mass Production Protocol",
    description: "All generators produce 3x more RP.",
    flavorText: "The assembly line now extends into the neighbor's yard. Doug hasn't noticed yet.",
    tier: 4,
    ipCost: 1500,
    researchTimeSec: 1800,
    requires: ["parallel_experiments"],
    effects: [{ type: "globalMultiplier", multiplier: 3 }],
    persistsOnPrestige: false,
  },
  {
    id: "theoretical_breakthrough",
    name: "Theoretical Breakthrough",
    description: "Colliders 3x, Reality Engines 3x, Cosmic Looms 3x.",
    flavorText: "Solved three unsolvable equations. One of them was just a grocery list, but still.",
    tier: 4,
    ipCost: 2000,
    researchTimeSec: 2400,
    requires: ["computational_modeling"],
    effects: [
      { type: "generatorMultiplier", target: "collider", multiplier: 3 },
      { type: "generatorMultiplier", target: "reality", multiplier: 3 },
      { type: "generatorMultiplier", target: "cosmic", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "unified_field_theory",
    name: "Unified Field Theory",
    description: "All generators produce 5x more RP.",
    flavorText: "Everything is connected. The math says so. The string on the corkboard also says so.",
    tier: 5,
    ipCost: 8000,
    researchTimeSec: 5400,
    requires: ["mass_production", "theoretical_breakthrough"],
    effects: [{ type: "globalMultiplier", multiplier: 5 }],
    persistsOnPrestige: false,
  },
  {
    id: "infinite_energy",
    name: "Infinite Energy Source",
    description: "All generators produce 10x more RP.",
    flavorText: "It's a perpetual motion machine. Physicists hate this one weird trick.",
    tier: 6,
    ipCost: 25000,
    researchTimeSec: 10800,
    requires: ["unified_field_theory"],
    effects: [{ type: "globalMultiplier", multiplier: 10 }],
    persistsOnPrestige: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // CLICK BRANCH — Manual power (resets on prestige)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "rapid_prototyping",
    name: "Rapid Prototyping",
    description: "Clicks produce 3x more RP.",
    flavorText: "Build fast, break things. Mostly break things.",
    tier: 2,
    ipCost: 50,
    researchTimeSec: 120,
    requires: ["scientific_method"],
    effects: [{ type: "clickMultiplier", multiplier: 3 }],
    persistsOnPrestige: false,
  },
  {
    id: "ergonomic_research",
    name: "Ergonomic Research",
    description: "Clicks produce 5x more RP.",
    flavorText: "Optimal click angle: 37.4 degrees. Optimal click force: yes.",
    tier: 3,
    ipCost: 300,
    researchTimeSec: 600,
    requires: ["rapid_prototyping"],
    effects: [{ type: "clickMultiplier", multiplier: 5 }],
    persistsOnPrestige: false,
  },
  {
    id: "neural_click_pathway",
    name: "Neural Click Pathway",
    description: "Each click also produces 3% of your RP/sec.",
    flavorText: "The mouse is now a direct extension of your nervous system. The warranty is void.",
    tier: 3,
    ipCost: 400,
    researchTimeSec: 720,
    requires: ["rapid_prototyping"],
    effects: [{ type: "clickPercentOfProduction", percent: 3 }],
    persistsOnPrestige: false,
  },
  {
    id: "quantum_clicking",
    name: "Quantum Clicking",
    description: "Clicks produce 10x more RP.",
    flavorText: "Each click exists in a superposition of clicked and not-clicked until observed by Doug.",
    tier: 4,
    ipCost: 2000,
    researchTimeSec: 2100,
    requires: ["ergonomic_research"],
    effects: [{ type: "clickMultiplier", multiplier: 10 }],
    persistsOnPrestige: false,
  },
  {
    id: "mind_body_unity",
    name: "Mind-Body Unity",
    description: "Each click also produces 5% of your RP/sec.",
    flavorText: "You don't click the mouse. The mouse clicks you. (That's not how it works but it sounds deep.)",
    tier: 4,
    ipCost: 2500,
    researchTimeSec: 2400,
    requires: ["neural_click_pathway"],
    effects: [{ type: "clickPercentOfProduction", percent: 5 }],
    persistsOnPrestige: false,
  },
  {
    id: "transcendent_touch",
    name: "The Transcendent Touch",
    description: "Clicks produce 25x more RP + 10% of RP/sec per click.",
    flavorText: "Your clicks now alter the fundamental constants of the universe. Use responsibly. (You won't.)",
    tier: 5,
    ipCost: 12000,
    researchTimeSec: 7200,
    requires: ["quantum_clicking", "mind_body_unity"],
    effects: [
      { type: "clickMultiplier", multiplier: 25 },
      { type: "clickPercentOfProduction", percent: 10 },
    ],
    persistsOnPrestige: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // INSIGHT BRANCH — Meta/IP/BP (persists across prestige)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "deeper_understanding",
    name: "Deeper Understanding",
    description: "IP generation increased by 2x.",
    flavorText: "Stared at the corkboard for six hours. The corkboard stared back.",
    tier: 2,
    ipCost: 75,
    researchTimeSec: 180,
    requires: ["documentation"],
    effects: [{ type: "ipGainMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "knowledge_synthesis",
    name: "Knowledge Synthesis",
    description: "Research completes 2x faster.",
    flavorText: "Connected the red string to the blue string. The corkboard trembled.",
    tier: 3,
    ipCost: 350,
    researchTimeSec: 600,
    requires: ["deeper_understanding"],
    effects: [{ type: "researchSpeedMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "recursive_learning",
    name: "Recursive Learning",
    description: "IP generation increased by 2x (stacks with other IP boosts).",
    flavorText: "Learning about learning about learning about lear— *stack overflow*",
    tier: 3,
    ipCost: 400,
    researchTimeSec: 720,
    requires: ["deeper_understanding"],
    effects: [{ type: "ipGainMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "meta_cognition",
    name: "Meta-Cognition",
    description: "BP gain increased by 2x.",
    flavorText: "Thinking about thinking. Doug thinks you need a therapist. Doug is thinking correctly.",
    tier: 4,
    ipCost: 1800,
    researchTimeSec: 2100,
    requires: ["deeper_understanding"],
    effects: [{ type: "bpGainMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "eureka_catalyst",
    name: "Eureka Catalyst",
    description: "Research completes 2x faster (stacks).",
    flavorText: "Installed a bathtub in the garage. Three breakthroughs in the first week.",
    tier: 4,
    ipCost: 2500,
    researchTimeSec: 2700,
    requires: ["knowledge_synthesis"],
    effects: [{ type: "researchSpeedMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "infinite_insight",
    name: "Infinite Insight",
    description: "IP generation increased by 5x.",
    flavorText: "The corkboard is now three-dimensional. The strings form a hypercube. It's beautiful.",
    tier: 5,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["recursive_learning", "eureka_catalyst"],
    effects: [{ type: "ipGainMultiplier", multiplier: 5 }],
    persistsOnPrestige: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // EXCLUSIVE PAIRS — Meaningful choices (resets on prestige)
  // ═══════════════════════════════════════════════════════════════════

  // Pair 1: Breadth vs Depth
  {
    id: "breadth_of_knowledge",
    name: "Breadth of Knowledge",
    description: "All generators produce 2x more RP.",
    flavorText: "Jack of all trades, master of... well, you're getting there.",
    tier: 3,
    ipCost: 300,
    researchTimeSec: 600,
    requires: ["hypothesis_testing"],
    exclusive: ["depth_of_focus"],
    effects: [{ type: "globalMultiplier", multiplier: 2 }],
    persistsOnPrestige: false,
  },
  {
    id: "depth_of_focus",
    name: "Depth of Focus",
    description: "Servers, Prototypes, Containment, Colliders, and Mind-Links produce 4x.",
    flavorText: "Ignore the small stuff. Go straight for the terrifying stuff.",
    tier: 3,
    ipCost: 300,
    researchTimeSec: 600,
    requires: ["hypothesis_testing"],
    exclusive: ["breadth_of_knowledge"],
    effects: [
      { type: "generatorMultiplier", target: "server", multiplier: 4 },
      { type: "generatorMultiplier", target: "prototype", multiplier: 4 },
      { type: "generatorMultiplier", target: "containment", multiplier: 4 },
      { type: "generatorMultiplier", target: "collider", multiplier: 4 },
      { type: "generatorMultiplier", target: "mindlink", multiplier: 4 },
    ],
    persistsOnPrestige: false,
  },

  // Pair 2: Steady vs Chaotic (requires either from Pair 1)
  {
    id: "steady_progress",
    name: "Steady Progress",
    description: "Offline progress efficiency +30%.",
    flavorText: "Slow and steady wins the race. Also, your lawn looks great.",
    tier: 4,
    ipCost: 1500,
    researchTimeSec: 1800,
    requires: [],
    requiresAny: ["breadth_of_knowledge", "depth_of_focus"],
    exclusive: ["chaotic_brilliance"],
    effects: [{ type: "offlineEfficiencyBonus", bonus: 0.3 }],
    persistsOnPrestige: false,
  },
  {
    id: "chaotic_brilliance",
    name: "Chaotic Brilliance",
    description: "All generators 3x, clicks 3x.",
    flavorText: "Random doesn't mean wrong. It means EXCITINGLY wrong.",
    tier: 4,
    ipCost: 1500,
    researchTimeSec: 1800,
    requires: [],
    requiresAny: ["breadth_of_knowledge", "depth_of_focus"],
    exclusive: ["steady_progress"],
    effects: [
      { type: "globalMultiplier", multiplier: 3 },
      { type: "clickMultiplier", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // ARCHETYPE BRANCHES — 3 nodes each (resets on prestige)
  // ═══════════════════════════════════════════════════════════════════

  // ── Megalomaniac ────────────────────────────────────────────────────

  {
    id: "mega_command_hierarchy",
    name: "Command Hierarchy",
    description: "Mind-Link Arrays 5x. Global production 1.5x.",
    flavorText: "You don't have employees. You have 'involuntary research associates.'",
    tier: 4,
    ipCost: 1200,
    researchTimeSec: 1500,
    requires: ["scientific_method"],
    archetypeRequired: "megalomaniac",
    effects: [
      { type: "generatorMultiplier", target: "mindlink", multiplier: 5 },
      { type: "globalMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "mega_dominion",
    name: "Dominion Over Matter",
    description: "All generators produce 5x more RP.",
    flavorText: "The periodic table is more of a 'periodic suggestion' now.",
    tier: 5,
    ipCost: 8000,
    researchTimeSec: 5400,
    requires: ["mega_command_hierarchy"],
    archetypeRequired: "megalomaniac",
    effects: [{ type: "globalMultiplier", multiplier: 5 }],
    persistsOnPrestige: false,
  },
  {
    id: "mega_supreme_authority",
    name: "Supreme Authority",
    description: "BP gain increased by 3x.",
    flavorText: "You've written yourself into the laws of thermodynamics. As an exception.",
    tier: 5,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["mega_dominion"],
    archetypeRequired: "megalomaniac",
    effects: [{ type: "bpGainMultiplier", multiplier: 3 }],
    persistsOnPrestige: false,
  },

  // ── Perfectionist ──────────────────────────────────────────────────

  {
    id: "perf_calibrated_precision",
    name: "Calibrated Precision",
    description: "All generators 2x. Research 1.5x faster.",
    flavorText: "Every wire is color-coded. Every label is laminated. Doug is impressed. (Doug is never impressed.)",
    tier: 4,
    ipCost: 1200,
    researchTimeSec: 1500,
    requires: ["scientific_method"],
    archetypeRequired: "perfectionist",
    effects: [
      { type: "globalMultiplier", multiplier: 2 },
      { type: "researchSpeedMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "perf_zero_waste",
    name: "Zero-Waste Protocol",
    description: "All generators 4x. Offline efficiency +25%.",
    flavorText: "Recycled the recycling bin. Created a paradox. Fixed the paradox. Recycled the fix.",
    tier: 5,
    ipCost: 8000,
    researchTimeSec: 5400,
    requires: ["perf_calibrated_precision"],
    archetypeRequired: "perfectionist",
    effects: [
      { type: "globalMultiplier", multiplier: 4 },
      { type: "offlineEfficiencyBonus", bonus: 0.25 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "perf_equilibrium",
    name: "Perfect Equilibrium",
    description: "IP generation increased by 5x.",
    flavorText: "Achieved thermodynamic equilibrium in the garage. The universe is jealous.",
    tier: 5,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["perf_zero_waste"],
    archetypeRequired: "perfectionist",
    effects: [{ type: "ipGainMultiplier", multiplier: 5 }],
    persistsOnPrestige: false,
  },

  // ── Ethically Unhinged ─────────────────────────────────────────────

  {
    id: "unhinged_volatile_reactions",
    name: "Volatile Reactions",
    description: "Chemistry Sets 5x, Containment Chambers 5x.",
    flavorText: "The explosion was 'within acceptable parameters.' The parameters have been updated.",
    tier: 4,
    ipCost: 1200,
    researchTimeSec: 1500,
    requires: ["scientific_method"],
    archetypeRequired: "unhinged",
    effects: [
      { type: "generatorMultiplier", target: "chemistry", multiplier: 5 },
      { type: "generatorMultiplier", target: "containment", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "unhinged_controlled_chaos",
    name: "Controlled Chaos",
    description: "All generators 3x, clicks 3x.",
    flavorText: "'Controlled' is doing a lot of heavy lifting in that phrase.",
    tier: 5,
    ipCost: 8000,
    researchTimeSec: 5400,
    requires: ["unhinged_volatile_reactions"],
    archetypeRequired: "unhinged",
    effects: [
      { type: "globalMultiplier", multiplier: 3 },
      { type: "clickMultiplier", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "unhinged_beautiful_destruction",
    name: "Beautiful Destruction",
    description: "All generators produce 8x more RP.",
    flavorText: "The mushroom cloud was technically heart-shaped. That has to count for something.",
    tier: 5,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["unhinged_controlled_chaos"],
    archetypeRequired: "unhinged",
    effects: [{ type: "globalMultiplier", multiplier: 8 }],
    persistsOnPrestige: false,
  },

  // ── Reality Breaker ────────────────────────────────────────────────

  {
    id: "rb_dimensional_awareness",
    name: "Dimensional Awareness",
    description: "Particle Colliders 5x, Reality Engines 5x.",
    flavorText: "You can see the fourth dimension now. It's mostly paperwork.",
    tier: 4,
    ipCost: 1200,
    researchTimeSec: 1500,
    requires: ["scientific_method"],
    archetypeRequired: "realityBreaker",
    effects: [
      { type: "generatorMultiplier", target: "collider", multiplier: 5 },
      { type: "generatorMultiplier", target: "reality", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "rb_probability_manipulation",
    name: "Probability Manipulation",
    description: "All generators produce 4x more RP.",
    flavorText: "Coin flip: heads you win, tails you also win. The coin disagrees but can't prove it.",
    tier: 5,
    ipCost: 8000,
    researchTimeSec: 5400,
    requires: ["rb_dimensional_awareness"],
    archetypeRequired: "realityBreaker",
    effects: [{ type: "globalMultiplier", multiplier: 4 }],
    persistsOnPrestige: false,
  },
  {
    id: "rb_reality_rewrite",
    name: "Reality Rewrite",
    description: "All generators 10x, clicks 5x.",
    flavorText: "Ctrl+Z, but for the laws of physics. What could go wrong? (Everything. Everything could go wrong.)",
    tier: 5,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["rb_probability_manipulation"],
    archetypeRequired: "realityBreaker",
    effects: [
      { type: "globalMultiplier", multiplier: 10 },
      { type: "clickMultiplier", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },

  // ── Gadgeteer ──────────────────────────────────────────────────────

  {
    id: "gad_automated_assembly",
    name: "Automated Assembly",
    description: "Soldering Stations 5x, Prototype Machines 5x.",
    flavorText: "Built a machine that builds machines. It's machines all the way down.",
    tier: 4,
    ipCost: 1200,
    researchTimeSec: 1500,
    requires: ["scientific_method"],
    archetypeRequired: "gadgeteer",
    effects: [
      { type: "generatorMultiplier", target: "soldering", multiplier: 5 },
      { type: "generatorMultiplier", target: "prototype", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "gad_smart_optimization",
    name: "Smart Optimization",
    description: "All generators 3x. IP generation 3x.",
    flavorText: "The gadgets are optimizing themselves now. You're technically redundant. They keep you for morale.",
    tier: 5,
    ipCost: 8000,
    researchTimeSec: 5400,
    requires: ["gad_automated_assembly"],
    archetypeRequired: "gadgeteer",
    effects: [
      { type: "globalMultiplier", multiplier: 3 },
      { type: "ipGainMultiplier", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "gad_perpetual_machine",
    name: "Perpetual Machine",
    description: "All generators 5x. Research 2x faster.",
    flavorText: "It doesn't stop. It CANNOT stop. Please send help. (And more wire.)",
    tier: 5,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["gad_smart_optimization"],
    archetypeRequired: "gadgeteer",
    effects: [
      { type: "globalMultiplier", multiplier: 5 },
      { type: "researchSpeedMultiplier", multiplier: 2 },
    ],
    persistsOnPrestige: false,
  },

  // ── Accidental Genius ──────────────────────────────────────────────

  {
    id: "ag_happy_accidents",
    name: "Happy Accidents",
    description: "Cosmic Looms 5x, global production 1.5x.",
    flavorText: "Dropped a beaker on the keyboard. Invented cold fusion. Oops.",
    tier: 4,
    ipCost: 1200,
    researchTimeSec: 1500,
    requires: ["scientific_method"],
    archetypeRequired: "accidentalGenius",
    effects: [
      { type: "generatorMultiplier", target: "cosmic", multiplier: 5 },
      { type: "globalMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "ag_serendipity_amplifier",
    name: "Serendipity Amplifier",
    description: "All generators 3x, clicks 5x.",
    flavorText: "It amplifies luck. Or creates it. The distinction has been deemed 'not important.'",
    tier: 5,
    ipCost: 8000,
    researchTimeSec: 5400,
    requires: ["ag_happy_accidents"],
    archetypeRequired: "accidentalGenius",
    effects: [
      { type: "globalMultiplier", multiplier: 3 },
      { type: "clickMultiplier", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "ag_cosmic_luck",
    name: "Cosmic Luck",
    description: "IP generation 5x, BP gain 2x.",
    flavorText: "The universe is on your side now. Literally. It wrote a letter of recommendation.",
    tier: 5,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["ag_serendipity_amplifier"],
    archetypeRequired: "accidentalGenius",
    effects: [
      { type: "ipGainMultiplier", multiplier: 5 },
      { type: "bpGainMultiplier", multiplier: 2 },
    ],
    persistsOnPrestige: false,
  },
];

// ── Lookup Helpers ───────────────────────────────────────────────────

const RESEARCH_MAP = new Map<string, ResearchNodeDef>(
  RESEARCH_NODES.map((n) => [n.id, n])
);

export function getResearchNodeDef(id: string): ResearchNodeDef | undefined {
  return RESEARCH_MAP.get(id);
}

/** All unique tier numbers, sorted ascending. */
export const RESEARCH_TIERS: number[] = [
  ...new Set(RESEARCH_NODES.map((n) => n.tier)),
].sort((a, b) => a - b);
