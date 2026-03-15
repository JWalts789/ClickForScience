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
  /** Column position in the visual tree (0-based). */
  treeCol: number;
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
// Visual Layout (columns left → right):
//   Cols  0-2:  Archetype Left (Megalomaniac, Unhinged, Reality Breaker)
//   Cols  3-6:  Production Branch
//   Cols  6-9:  Click Branch
//   Cols  9-14: Trunk / Exclusive / Synergy
//   Cols 16-19: Insight Branch
//   Cols 19-23: Efficiency Branch
//   Cols 25-30: Archetype Right (Perfectionist, Gadgeteer, Accidental Genius)
//
// Tiers (rows top → bottom): 1=Foundation, 2=Applied, 3=Advanced,
//   4=Breakthrough, 5=Transcendent, 6=Endgame

export const RESEARCH_NODES: ResearchNodeDef[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TIER 1 — Foundation (persists across prestige)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "safety_goggles",
    name: "Safety Goggles (Mostly Decorative)",
    description: "Clicks produce 1.5x more RP.",
    flavorText: "They don't protect your eyes. They protect your CONFIDENCE.",
    tier: 1, treeCol: 6,
    ipCost: 5,
    researchTimeSec: 15,
    requires: [],
    effects: [{ type: "clickMultiplier", multiplier: 1.5 }],
    persistsOnPrestige: true,
  },
  {
    id: "scientific_method",
    name: "The Scientific Method",
    description: "All generators produce 1.5x more RP.",
    flavorText: "Step 1: Ask a question. Step 2: Ignore the question. Step 3: Build something dangerous.",
    tier: 1, treeCol: 9,
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
    tier: 1, treeCol: 16,
    ipCost: 15,
    researchTimeSec: 45,
    requires: [],
    effects: [{ type: "ipGainMultiplier", multiplier: 1.5 }],
    persistsOnPrestige: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 2 — Applied Science
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "workflow_optimization",
    name: "Workflow Optimization",
    description: "All generators produce 2x more RP.",
    flavorText: "Rearranged the garage. Found three notebooks, a soldering iron, and what might be a squirrel.",
    tier: 2, treeCol: 4,
    ipCost: 60,
    researchTimeSec: 150,
    requires: ["scientific_method"],
    effects: [{ type: "globalMultiplier", multiplier: 2 }],
    persistsOnPrestige: false,
  },
  {
    id: "rapid_prototyping",
    name: "Rapid Prototyping",
    description: "Clicks produce 3x more RP.",
    flavorText: "Build fast, break things. Mostly break things.",
    tier: 2, treeCol: 7,
    ipCost: 50,
    researchTimeSec: 120,
    requires: ["scientific_method"],
    effects: [{ type: "clickMultiplier", multiplier: 3 }],
    persistsOnPrestige: false,
  },
  {
    id: "hypothesis_testing",
    name: "Hypothesis Testing",
    description: "Research completes 1.5x faster.",
    flavorText: "Hypothesis: this will work. Test: it exploded. Conclusion: needs more tape.",
    tier: 2, treeCol: 10,
    ipCost: 40,
    researchTimeSec: 90,
    requires: ["scientific_method"],
    effects: [{ type: "researchSpeedMultiplier", multiplier: 1.5 }],
    persistsOnPrestige: true,
  },
  {
    id: "cross_pollination",
    name: "Cross-Pollination",
    description: "Notebooks 2x, Chemistry Sets 2x.",
    flavorText: "Mixed biology with chemistry. The petri dish is now sentient. It's asking for overtime pay.",
    tier: 2, treeCol: 13,
    ipCost: 55,
    researchTimeSec: 130,
    requires: ["scientific_method"],
    effects: [
      { type: "generatorMultiplier", target: "notebook", multiplier: 2 },
      { type: "generatorMultiplier", target: "chemistry", multiplier: 2 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "deeper_understanding",
    name: "Deeper Understanding",
    description: "IP generation increased by 2x.",
    flavorText: "Stared at the corkboard for six hours. The corkboard stared back.",
    tier: 2, treeCol: 16,
    ipCost: 75,
    researchTimeSec: 180,
    requires: ["documentation"],
    effects: [{ type: "ipGainMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "lab_notebook_v2",
    name: "Lab Notebook 2.0",
    description: "BP gain increased by 1.2x. IP generation 1.3x.",
    flavorText: "Digital notes this time. The cloud backup is in an actual cloud. It rains data.",
    tier: 2, treeCol: 18,
    ipCost: 65,
    researchTimeSec: 140,
    requires: ["documentation"],
    effects: [
      { type: "bpGainMultiplier", multiplier: 1.2 },
      { type: "ipGainMultiplier", multiplier: 1.3 },
    ],
    persistsOnPrestige: true,
  },
  {
    id: "peer_review",
    name: "Peer Review (Doug Read It)",
    description: "BP gain increased by 1.3x.",
    flavorText: "Doug's feedback: 'This is insane.' Gary's note in margin: 'He gets it.'",
    tier: 2, treeCol: 19,
    ipCost: 50,
    researchTimeSec: 120,
    requires: ["documentation"],
    effects: [{ type: "bpGainMultiplier", multiplier: 1.3 }],
    persistsOnPrestige: true,
  },
  {
    id: "systematic_approach",
    name: "Systematic Approach",
    description: "Offline progress +15%. Research 1.2x faster.",
    flavorText: "Made a spreadsheet to track the spreadsheets. Efficiency has never felt so bureaucratic.",
    tier: 2, treeCol: 21,
    ipCost: 70,
    researchTimeSec: 160,
    requires: ["documentation"],
    effects: [
      { type: "offlineEfficiencyBonus", bonus: 0.15 },
      { type: "researchSpeedMultiplier", multiplier: 1.2 },
    ],
    persistsOnPrestige: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 3 — Advanced Theory
  // ═══════════════════════════════════════════════════════════════════

  // ── Production Branch ─────────────────────────────────────────────

  {
    id: "parallel_experiments",
    name: "Parallel Experiments",
    description: "Notebooks 3x, Soldering Stations 3x.",
    flavorText: "Running six experiments at once. Three are on fire. This is fine.",
    tier: 3, treeCol: 3,
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
    tier: 3, treeCol: 4,
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
    tier: 3, treeCol: 5,
    ipCost: 250,
    researchTimeSec: 540,
    requires: ["workflow_optimization"],
    effects: [
      { type: "generatorMultiplier", target: "server", multiplier: 3 },
      { type: "generatorMultiplier", target: "prototype", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },

  // ── Click Branch ──────────────────────────────────────────────────

  {
    id: "rapid_iteration",
    name: "Rapid Iteration",
    description: "Clicks 3x more RP. Global production 1.2x.",
    flavorText: "Version 1: exploded. Version 2: bigger explosion. Version 3: controlled explosion. Progress!",
    tier: 3, treeCol: 6,
    ipCost: 220,
    researchTimeSec: 500,
    requires: ["rapid_prototyping"],
    effects: [
      { type: "clickMultiplier", multiplier: 3 },
      { type: "globalMultiplier", multiplier: 1.2 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "ergonomic_research",
    name: "Ergonomic Research",
    description: "Clicks produce 5x more RP.",
    flavorText: "Optimal click angle: 37.4 degrees. Optimal click force: yes.",
    tier: 3, treeCol: 7,
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
    tier: 3, treeCol: 8,
    ipCost: 400,
    researchTimeSec: 720,
    requires: ["rapid_prototyping"],
    effects: [{ type: "clickPercentOfProduction", percent: 3 }],
    persistsOnPrestige: false,
  },

  // ── Trunk / Exclusive ─────────────────────────────────────────────

  {
    id: "autobuyer_protocol",
    name: "Automated Purchasing Protocol",
    description: "Unlocks auto-buyers for all generators.",
    flavorText: "Why click 'Buy' yourself when a very fragile script can do it for you?",
    tier: 3, treeCol: 10,
    ipCost: 150,
    researchTimeSec: 300,
    requires: ["hypothesis_testing"],
    effects: [],
    persistsOnPrestige: true,
  },
  {
    id: "breadth_of_knowledge",
    name: "Breadth of Knowledge",
    description: "All generators produce 2x more RP.",
    flavorText: "Jack of all trades, master of... well, you're getting there.",
    tier: 3, treeCol: 9,
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
    description: "Servers, Prototypes, Containment, Colliders, Mind-Links 4x.",
    flavorText: "Ignore the small stuff. Go straight for the terrifying stuff.",
    tier: 3, treeCol: 11,
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
  {
    id: "applied_mathematics",
    name: "Applied Mathematics",
    description: "Research 1.3x faster. Global production 1.3x.",
    flavorText: "Turns out math IS useful. Don't tell your high school teacher — they'll be insufferable.",
    tier: 3, treeCol: 12,
    ipCost: 280,
    researchTimeSec: 550,
    requires: ["hypothesis_testing"],
    effects: [
      { type: "researchSpeedMultiplier", multiplier: 1.3 },
      { type: "globalMultiplier", multiplier: 1.3 },
    ],
    persistsOnPrestige: false,
  },

  // ── Synergy Branch ────────────────────────────────────────────────

  {
    id: "interdisciplinary_studies",
    name: "Interdisciplinary Studies",
    description: "Soldering Stations 3x, Server Racks 3x.",
    flavorText: "Combined welding with web development. The website is now load-bearing.",
    tier: 3, treeCol: 13,
    ipCost: 240,
    researchTimeSec: 520,
    requires: ["cross_pollination"],
    effects: [
      { type: "generatorMultiplier", target: "soldering", multiplier: 3 },
      { type: "generatorMultiplier", target: "server", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "resonance_theory",
    name: "Resonance Theory",
    description: "Containment Chambers 3x, Prototype Machines 3x.",
    flavorText: "Everything vibrates at the right frequency. Even Doug. Especially Doug.",
    tier: 3, treeCol: 14,
    ipCost: 260,
    researchTimeSec: 540,
    requires: ["cross_pollination"],
    effects: [
      { type: "generatorMultiplier", target: "containment", multiplier: 3 },
      { type: "generatorMultiplier", target: "prototype", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },

  // ── Insight Branch ────────────────────────────────────────────────

  {
    id: "knowledge_synthesis",
    name: "Knowledge Synthesis",
    description: "Research completes 2x faster.",
    flavorText: "Connected the red string to the blue string. The corkboard trembled.",
    tier: 3, treeCol: 16,
    ipCost: 350,
    researchTimeSec: 600,
    requires: ["deeper_understanding"],
    effects: [{ type: "researchSpeedMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "recursive_learning",
    name: "Recursive Learning",
    description: "IP generation increased by 2x.",
    flavorText: "Learning about learning about learning about lear— *stack overflow*",
    tier: 3, treeCol: 17,
    ipCost: 400,
    researchTimeSec: 720,
    requires: ["deeper_understanding"],
    effects: [{ type: "ipGainMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "data_mining",
    name: "Data Mining",
    description: "IP generation increased by 1.5x.",
    flavorText: "Dug through terabytes of data. Found one useful insight and 47 cat pictures.",
    tier: 3, treeCol: 18,
    ipCost: 320,
    researchTimeSec: 580,
    requires: ["deeper_understanding"],
    effects: [{ type: "ipGainMultiplier", multiplier: 1.5 }],
    persistsOnPrestige: true,
  },

  // ── Efficiency Branch ─────────────────────────────────────────────

  {
    id: "grant_writing",
    name: "Grant Writing",
    description: "BP gain 1.5x. IP generation 1.5x.",
    flavorText: "Applied for funding. Listed 'Science' under purpose. They bought it.",
    tier: 3, treeCol: 19,
    ipCost: 300,
    researchTimeSec: 600,
    requires: ["peer_review"],
    effects: [
      { type: "bpGainMultiplier", multiplier: 1.5 },
      { type: "ipGainMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: true,
  },
  {
    id: "energy_management",
    name: "Energy Management",
    description: "Offline progress efficiency +20%.",
    flavorText: "The lab now runs on a schedule. The schedule is 'always on' but it's ORGANIZED.",
    tier: 3, treeCol: 21,
    ipCost: 280,
    researchTimeSec: 520,
    requires: ["systematic_approach"],
    effects: [{ type: "offlineEfficiencyBonus", bonus: 0.2 }],
    persistsOnPrestige: true,
  },
  {
    id: "resource_recycling",
    name: "Resource Recycling",
    description: "All generators 1.5x. IP generation 1.5x.",
    flavorText: "One man's failed experiment is another man's... slightly different failed experiment.",
    tier: 3, treeCol: 22,
    ipCost: 300,
    researchTimeSec: 560,
    requires: ["systematic_approach"],
    effects: [
      { type: "globalMultiplier", multiplier: 1.5 },
      { type: "ipGainMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 4 — Breakthrough Research
  // ═══════════════════════════════════════════════════════════════════

  // ── Production Branch ─────────────────────────────────────────────

  {
    id: "mass_production",
    name: "Mass Production Protocol",
    description: "All generators produce 3x more RP.",
    flavorText: "The assembly line now extends into the neighbor's yard. Doug hasn't noticed yet.",
    tier: 4, treeCol: 3,
    ipCost: 1500,
    researchTimeSec: 1800,
    requires: ["parallel_experiments"],
    effects: [{ type: "globalMultiplier", multiplier: 3 }],
    persistsOnPrestige: false,
  },
  {
    id: "molecular_assembly",
    name: "Molecular Assembly",
    description: "Chemistry Sets 5x, Containment Chambers 5x.",
    flavorText: "Building things atom by atom. It's slow, but the precision is terrifying.",
    tier: 4, treeCol: 4,
    ipCost: 1800,
    researchTimeSec: 2000,
    requires: ["advanced_materials"],
    effects: [
      { type: "generatorMultiplier", target: "chemistry", multiplier: 5 },
      { type: "generatorMultiplier", target: "containment", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "quantum_computing",
    name: "Quantum Computing",
    description: "Server Racks 5x, Prototype Machines 5x.",
    flavorText: "The quantum computer works perfectly. Also, it doesn't work at all. Both are true.",
    tier: 4, treeCol: 5,
    ipCost: 1800,
    researchTimeSec: 2000,
    requires: ["computational_modeling"],
    effects: [
      { type: "generatorMultiplier", target: "server", multiplier: 5 },
      { type: "generatorMultiplier", target: "prototype", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "theoretical_breakthrough",
    name: "Theoretical Breakthrough",
    description: "Colliders 3x, Reality Engines 3x, Cosmic Looms 3x.",
    flavorText: "Solved three unsolvable equations. One of them was just a grocery list, but still.",
    tier: 4, treeCol: 6,
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

  // ── Click Branch ──────────────────────────────────────────────────

  {
    id: "muscle_memory",
    name: "Muscle Memory",
    description: "Clicks produce 8x more RP.",
    flavorText: "Your clicking finger has its own gym membership now. It benches 200.",
    tier: 4, treeCol: 7,
    ipCost: 1600,
    researchTimeSec: 1900,
    requires: ["rapid_iteration", "ergonomic_research"],
    effects: [{ type: "clickMultiplier", multiplier: 8 }],
    persistsOnPrestige: false,
  },
  {
    id: "quantum_clicking",
    name: "Quantum Clicking",
    description: "Clicks produce 10x more RP.",
    flavorText: "Each click exists in a superposition of clicked and not-clicked until observed by Doug.",
    tier: 4, treeCol: 8,
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
    tier: 4, treeCol: 9,
    ipCost: 2500,
    researchTimeSec: 2400,
    requires: ["neural_click_pathway"],
    effects: [{ type: "clickPercentOfProduction", percent: 5 }],
    persistsOnPrestige: false,
  },

  // ── Trunk / Exclusive Pairs ───────────────────────────────────────

  {
    id: "steady_progress",
    name: "Steady Progress",
    description: "Offline progress efficiency +30%.",
    flavorText: "Slow and steady wins the race. Also, your lawn looks great.",
    tier: 4, treeCol: 10,
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
    tier: 4, treeCol: 11,
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
  {
    id: "focused_intensity",
    name: "Focused Intensity",
    description: "Clicks produce 5x more RP.",
    flavorText: "Block out all distractions. The only thing that exists is the button. CLICK IT.",
    tier: 4, treeCol: 12,
    ipCost: 1200,
    researchTimeSec: 1500,
    requires: ["autobuyer_protocol"],
    exclusive: ["scattered_genius"],
    effects: [{ type: "clickMultiplier", multiplier: 5 }],
    persistsOnPrestige: false,
  },
  {
    id: "scattered_genius",
    name: "Scattered Genius",
    description: "All generators 2x, clicks 2x.",
    flavorText: "Started ten projects. Finished none. But the SYNERGIES between them? *chef's kiss*",
    tier: 4, treeCol: 13,
    ipCost: 1200,
    researchTimeSec: 1500,
    requires: ["autobuyer_protocol"],
    exclusive: ["focused_intensity"],
    effects: [
      { type: "globalMultiplier", multiplier: 2 },
      { type: "clickMultiplier", multiplier: 2 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "theoretical_physics",
    name: "Theoretical Physics",
    description: "All generators 2.5x. Research 1.5x faster.",
    flavorText: "The whiteboard equations have spilled onto the wall. And the ceiling. And Doug's fence.",
    tier: 4, treeCol: 14,
    ipCost: 1400,
    researchTimeSec: 1700,
    requires: ["applied_mathematics"],
    effects: [
      { type: "globalMultiplier", multiplier: 2.5 },
      { type: "researchSpeedMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: false,
  },

  // ── Synergy Branch ────────────────────────────────────────────────

  {
    id: "cascade_effect",
    name: "Cascade Effect",
    description: "All generators 2x, clicks 2x.",
    flavorText: "One domino fell. Then all the dominoes fell. Then the table fell. Then Doug's fence fell.",
    tier: 4, treeCol: 15,
    ipCost: 1600,
    researchTimeSec: 1900,
    requires: ["interdisciplinary_studies"],
    effects: [
      { type: "globalMultiplier", multiplier: 2 },
      { type: "clickMultiplier", multiplier: 2 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "harmonic_convergence",
    name: "Harmonic Convergence",
    description: "Colliders 3x, Reality Engines 3x, Cosmic Looms 3x.",
    flavorText: "All frequencies aligned. The garage hummed a perfect C major. Doug called noise control.",
    tier: 4, treeCol: 16,
    ipCost: 1800,
    researchTimeSec: 2100,
    requires: ["resonance_theory"],
    effects: [
      { type: "generatorMultiplier", target: "collider", multiplier: 3 },
      { type: "generatorMultiplier", target: "reality", multiplier: 3 },
      { type: "generatorMultiplier", target: "cosmic", multiplier: 3 },
    ],
    persistsOnPrestige: false,
  },

  // ── Insight Branch ────────────────────────────────────────────────

  {
    id: "meta_cognition",
    name: "Meta-Cognition",
    description: "BP gain increased by 2x.",
    flavorText: "Thinking about thinking. Doug thinks you need a therapist. Doug is thinking correctly.",
    tier: 4, treeCol: 17,
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
    tier: 4, treeCol: 18,
    ipCost: 2500,
    researchTimeSec: 2700,
    requires: ["knowledge_synthesis"],
    effects: [{ type: "researchSpeedMultiplier", multiplier: 2 }],
    persistsOnPrestige: true,
  },
  {
    id: "pattern_recognition",
    name: "Pattern Recognition",
    description: "IP generation increased by 3x.",
    flavorText: "You see patterns everywhere now. In the data. In the stars. In Doug's lawn mowing schedule.",
    tier: 4, treeCol: 19,
    ipCost: 2200,
    researchTimeSec: 2400,
    requires: ["recursive_learning", "data_mining"],
    effects: [{ type: "ipGainMultiplier", multiplier: 3 }],
    persistsOnPrestige: true,
  },
  {
    id: "breakthrough_methodology",
    name: "Breakthrough Methodology",
    description: "Research 1.5x faster. BP gain 1.5x.",
    flavorText: "Discovered a method for discovering methods. It's methodical all the way down.",
    tier: 4, treeCol: 20,
    ipCost: 2000,
    researchTimeSec: 2200,
    requires: ["knowledge_synthesis", "grant_writing"],
    effects: [
      { type: "researchSpeedMultiplier", multiplier: 1.5 },
      { type: "bpGainMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: true,
  },

  // ── Efficiency Branch ─────────────────────────────────────────────

  {
    id: "lab_automation",
    name: "Lab Automation",
    description: "IP generation 2x. Global production 1.5x.",
    flavorText: "The lab runs itself now. You're technically on vacation. Technically.",
    tier: 4, treeCol: 21,
    ipCost: 1800,
    researchTimeSec: 2000,
    requires: ["lab_notebook_v2", "energy_management"],
    effects: [
      { type: "ipGainMultiplier", multiplier: 2 },
      { type: "globalMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: true,
  },
  {
    id: "perpetual_systems",
    name: "Perpetual Systems",
    description: "Offline progress +30%. Global production 2x.",
    flavorText: "The machines never stop. The neighbors never sleep. Everyone is equally productive.",
    tier: 4, treeCol: 22,
    ipCost: 2000,
    researchTimeSec: 2200,
    requires: ["energy_management"],
    effects: [
      { type: "offlineEfficiencyBonus", bonus: 0.3 },
      { type: "globalMultiplier", multiplier: 2 },
    ],
    persistsOnPrestige: true,
  },
  {
    id: "waste_nothing",
    name: "Waste Nothing Protocol",
    description: "IP generation 2x. BP gain 1.5x.",
    flavorText: "Every failed experiment produces useful data. Every useful experiment produces failed side effects.",
    tier: 4, treeCol: 23,
    ipCost: 2200,
    researchTimeSec: 2400,
    requires: ["resource_recycling"],
    effects: [
      { type: "ipGainMultiplier", multiplier: 2 },
      { type: "bpGainMultiplier", multiplier: 1.5 },
    ],
    persistsOnPrestige: true,
  },

  // ── Archetypes T4 ─────────────────────────────────────────────────

  {
    id: "mega_command_hierarchy",
    name: "Command Hierarchy",
    description: "Mind-Link Arrays 5x. Global production 1.5x.",
    flavorText: "You don't have employees. You have 'involuntary research associates.'",
    tier: 4, treeCol: 0,
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
    id: "unhinged_volatile_reactions",
    name: "Volatile Reactions",
    description: "Chemistry Sets 5x, Containment Chambers 5x.",
    flavorText: "The explosion was 'within acceptable parameters.' The parameters have been updated.",
    tier: 4, treeCol: 1,
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
    id: "rb_dimensional_awareness",
    name: "Dimensional Awareness",
    description: "Particle Colliders 5x, Reality Engines 5x.",
    flavorText: "You can see the fourth dimension now. It's mostly paperwork.",
    tier: 4, treeCol: 2,
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
    id: "perf_calibrated_precision",
    name: "Calibrated Precision",
    description: "All generators 2x. Research 1.5x faster.",
    flavorText: "Every wire is color-coded. Every label is laminated. Doug is impressed. (Doug is never impressed.)",
    tier: 4, treeCol: 25,
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
    id: "gad_automated_assembly",
    name: "Automated Assembly",
    description: "Soldering Stations 5x, Prototype Machines 5x.",
    flavorText: "Built a machine that builds machines. It's machines all the way down.",
    tier: 4, treeCol: 26,
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
    id: "ag_happy_accidents",
    name: "Happy Accidents",
    description: "Cosmic Looms 5x, global production 1.5x.",
    flavorText: "Dropped a beaker on the keyboard. Invented cold fusion. Oops.",
    tier: 4, treeCol: 27,
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

  // ═══════════════════════════════════════════════════════════════════
  // TIER 5 — Transcendent Knowledge
  // ═══════════════════════════════════════════════════════════════════

  // ── Production Branch ─────────────────────────────────────────────

  {
    id: "unified_field_theory",
    name: "Unified Field Theory",
    description: "All generators produce 5x more RP.",
    flavorText: "Everything is connected. The math says so. The string on the corkboard also says so.",
    tier: 5, treeCol: 3,
    ipCost: 8000,
    researchTimeSec: 5400,
    requires: ["mass_production", "theoretical_breakthrough"],
    effects: [{ type: "globalMultiplier", multiplier: 5 }],
    persistsOnPrestige: false,
  },
  {
    id: "industrial_revolution",
    name: "Industrial Revolution 2.0",
    description: "All generators produce 4x more RP.",
    flavorText: "Steam power is so 1800s. This runs on spite and caffeine.",
    tier: 5, treeCol: 4,
    ipCost: 6000,
    researchTimeSec: 4200,
    requires: ["mass_production"],
    effects: [{ type: "globalMultiplier", multiplier: 4 }],
    persistsOnPrestige: false,
  },
  {
    id: "dark_matter_synthesis",
    name: "Dark Matter Synthesis",
    description: "Colliders 5x, Reality Engines 5x, Cosmic Looms 5x.",
    flavorText: "Created dark matter. It's invisible, weightless, and untouchable. Like Gary's social skills.",
    tier: 5, treeCol: 5,
    ipCost: 7000,
    researchTimeSec: 4800,
    requires: ["theoretical_breakthrough"],
    effects: [
      { type: "generatorMultiplier", target: "collider", multiplier: 5 },
      { type: "generatorMultiplier", target: "reality", multiplier: 5 },
      { type: "generatorMultiplier", target: "cosmic", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },

  // ── Click Branch ──────────────────────────────────────────────────

  {
    id: "quantum_tunneling_click",
    name: "Quantum Tunneling Click",
    description: "Clicks produce 15x more RP.",
    flavorText: "Your click tunnels through spacetime to hit the button in THREE different dimensions.",
    tier: 5, treeCol: 7,
    ipCost: 8000,
    researchTimeSec: 5000,
    requires: ["quantum_clicking"],
    effects: [{ type: "clickMultiplier", multiplier: 15 }],
    persistsOnPrestige: false,
  },
  {
    id: "transcendent_touch",
    name: "The Transcendent Touch",
    description: "Clicks produce 25x more RP + 10% of RP/sec per click.",
    flavorText: "Your clicks now alter the fundamental constants of the universe. Use responsibly. (You won't.)",
    tier: 5, treeCol: 8,
    ipCost: 12000,
    researchTimeSec: 7200,
    requires: ["quantum_clicking", "mind_body_unity"],
    effects: [
      { type: "clickMultiplier", multiplier: 25 },
      { type: "clickPercentOfProduction", percent: 10 },
    ],
    persistsOnPrestige: false,
  },

  // ── Synergy Branch ────────────────────────────────────────────────

  {
    id: "total_synthesis",
    name: "Total Synthesis",
    description: "All generators produce 5x more RP.",
    flavorText: "Every branch of science merged into one. It's beautiful. It's terrifying. It's SCIENCE.",
    tier: 5, treeCol: 15,
    ipCost: 10000,
    researchTimeSec: 6000,
    requires: ["cascade_effect", "harmonic_convergence"],
    effects: [{ type: "globalMultiplier", multiplier: 5 }],
    persistsOnPrestige: false,
  },

  // ── Insight Branch ────────────────────────────────────────────────

  {
    id: "infinite_insight",
    name: "Infinite Insight",
    description: "IP generation increased by 5x.",
    flavorText: "The corkboard is now three-dimensional. The strings form a hypercube. It's beautiful.",
    tier: 5, treeCol: 18,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["recursive_learning", "eureka_catalyst"],
    effects: [{ type: "ipGainMultiplier", multiplier: 5 }],
    persistsOnPrestige: true,
  },
  {
    id: "omniscience_protocol",
    name: "Omniscience Protocol",
    description: "IP generation 5x. Research 2x faster.",
    flavorText: "You know everything. Including things you wish you didn't. Doug's browser history, for instance.",
    tier: 5, treeCol: 19,
    ipCost: 14000,
    researchTimeSec: 6600,
    requires: ["pattern_recognition", "eureka_catalyst"],
    effects: [
      { type: "ipGainMultiplier", multiplier: 5 },
      { type: "researchSpeedMultiplier", multiplier: 2 },
    ],
    persistsOnPrestige: true,
  },

  // ── Efficiency Branch ─────────────────────────────────────────────

  {
    id: "peak_efficiency",
    name: "Peak Efficiency",
    description: "Offline progress +50%. Global production 3x.",
    flavorText: "Maximum output, minimum input. The universe itself is taking notes.",
    tier: 5, treeCol: 22,
    ipCost: 12000,
    researchTimeSec: 6000,
    requires: ["perpetual_systems", "waste_nothing"],
    effects: [
      { type: "offlineEfficiencyBonus", bonus: 0.5 },
      { type: "globalMultiplier", multiplier: 3 },
    ],
    persistsOnPrestige: true,
  },

  // ── Archetypes T5 ─────────────────────────────────────────────────

  {
    id: "mega_dominion",
    name: "Dominion Over Matter",
    description: "All generators produce 5x more RP.",
    flavorText: "The periodic table is more of a 'periodic suggestion' now.",
    tier: 5, treeCol: 0,
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
    tier: 5, treeCol: 1,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["mega_dominion"],
    archetypeRequired: "megalomaniac",
    effects: [{ type: "bpGainMultiplier", multiplier: 3 }],
    persistsOnPrestige: false,
  },
  {
    id: "unhinged_controlled_chaos",
    name: "Controlled Chaos",
    description: "All generators 3x, clicks 3x.",
    flavorText: "'Controlled' is doing a lot of heavy lifting in that phrase.",
    tier: 5, treeCol: 9,
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
    tier: 5, treeCol: 10,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["unhinged_controlled_chaos"],
    archetypeRequired: "unhinged",
    effects: [{ type: "globalMultiplier", multiplier: 8 }],
    persistsOnPrestige: false,
  },
  {
    id: "rb_probability_manipulation",
    name: "Probability Manipulation",
    description: "All generators produce 4x more RP.",
    flavorText: "Coin flip: heads you win, tails you also win. The coin disagrees but can't prove it.",
    tier: 5, treeCol: 11,
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
    tier: 5, treeCol: 12,
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
  {
    id: "perf_zero_waste",
    name: "Zero-Waste Protocol",
    description: "All generators 4x. Offline efficiency +25%.",
    flavorText: "Recycled the recycling bin. Created a paradox. Fixed the paradox. Recycled the fix.",
    tier: 5, treeCol: 25,
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
    tier: 5, treeCol: 26,
    ipCost: 15000,
    researchTimeSec: 7200,
    requires: ["perf_zero_waste"],
    archetypeRequired: "perfectionist",
    effects: [{ type: "ipGainMultiplier", multiplier: 5 }],
    persistsOnPrestige: false,
  },
  {
    id: "gad_smart_optimization",
    name: "Smart Optimization",
    description: "All generators 3x. IP generation 3x.",
    flavorText: "The gadgets are optimizing themselves now. You're technically redundant. They keep you for morale.",
    tier: 5, treeCol: 27,
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
    tier: 5, treeCol: 28,
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
  {
    id: "ag_serendipity_amplifier",
    name: "Serendipity Amplifier",
    description: "All generators 3x, clicks 5x.",
    flavorText: "It amplifies luck. Or creates it. The distinction has been deemed 'not important.'",
    tier: 5, treeCol: 29,
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
    tier: 5, treeCol: 30,
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

  // ═══════════════════════════════════════════════════════════════════
  // TIER 6 — Endgame
  // ═══════════════════════════════════════════════════════════════════

  {
    id: "infinite_energy",
    name: "Infinite Energy Source",
    description: "All generators produce 10x more RP.",
    flavorText: "It's a perpetual motion machine. Physicists hate this one weird trick.",
    tier: 6, treeCol: 4,
    ipCost: 25000,
    researchTimeSec: 10800,
    requires: ["unified_field_theory"],
    effects: [{ type: "globalMultiplier", multiplier: 10 }],
    persistsOnPrestige: false,
  },
  {
    id: "the_final_click",
    name: "The Final Click",
    description: "Clicks produce 50x more RP + 15% of RP/sec per click.",
    flavorText: "One click to rule them all. One click to find them. One click to bring them all, and in the darkness bind them.",
    tier: 6, treeCol: 8,
    ipCost: 30000,
    researchTimeSec: 12000,
    requires: ["transcendent_touch"],
    effects: [
      { type: "clickMultiplier", multiplier: 50 },
      { type: "clickPercentOfProduction", percent: 15 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "reality_engine_v2",
    name: "Reality Engine V2",
    description: "All generators 15x, clicks 20x.",
    flavorText: "Reality Engine V1 merely bent reality. V2 politely asks it to leave.",
    tier: 6, treeCol: 6,
    ipCost: 50000,
    researchTimeSec: 18000,
    requires: ["infinite_energy", "transcendent_touch"],
    effects: [
      { type: "globalMultiplier", multiplier: 15 },
      { type: "clickMultiplier", multiplier: 20 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "omega_protocol",
    name: "Omega Protocol",
    description: "All generators produce 25x more RP.",
    flavorText: "The final research. The last discovery. The omega point. Until next Tuesday when you find something else.",
    tier: 6, treeCol: 10,
    ipCost: 75000,
    researchTimeSec: 21600,
    requires: ["convergence_theory", "reality_engine_v2"],
    effects: [{ type: "globalMultiplier", multiplier: 25 }],
    persistsOnPrestige: false,
  },
  {
    id: "convergence_theory",
    name: "Grand Convergence Theory",
    description: "All generators 10x. IP generation 5x.",
    flavorText: "All branches of science have converged into a single, terrifying truth: Gary was right.",
    tier: 6, treeCol: 12,
    ipCost: 40000,
    researchTimeSec: 14400,
    requires: ["unified_field_theory", "infinite_insight"],
    effects: [
      { type: "globalMultiplier", multiplier: 10 },
      { type: "ipGainMultiplier", multiplier: 5 },
    ],
    persistsOnPrestige: true,
  },
  {
    id: "transcendent_knowledge",
    name: "Transcendent Knowledge",
    description: "IP generation 10x. Research 3x faster. BP gain 3x.",
    flavorText: "You know everything that can be known. And several things that can't. The corkboard has ascended.",
    tier: 6, treeCol: 18,
    ipCost: 50000,
    researchTimeSec: 18000,
    requires: ["infinite_insight", "omniscience_protocol"],
    effects: [
      { type: "ipGainMultiplier", multiplier: 10 },
      { type: "researchSpeedMultiplier", multiplier: 3 },
      { type: "bpGainMultiplier", multiplier: 3 },
    ],
    persistsOnPrestige: true,
  },

  // ── Archetype T6 Capstones ────────────────────────────────────────

  {
    id: "mega_world_domination",
    name: "World Domination",
    description: "All generators 15x. BP gain 5x.",
    flavorText: "The world is yours. All of it. Even the boring parts. Especially the boring parts.",
    tier: 6, treeCol: 0,
    ipCost: 35000,
    researchTimeSec: 14400,
    requires: ["mega_supreme_authority"],
    archetypeRequired: "megalomaniac",
    effects: [
      { type: "globalMultiplier", multiplier: 15 },
      { type: "bpGainMultiplier", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "unhinged_total_annihilation",
    name: "Total Annihilation",
    description: "All generators produce 20x more RP.",
    flavorText: "There is nothing left to destroy. Except the concept of 'nothing.' Destroy that too.",
    tier: 6, treeCol: 9,
    ipCost: 35000,
    researchTimeSec: 14400,
    requires: ["unhinged_beautiful_destruction"],
    archetypeRequired: "unhinged",
    effects: [{ type: "globalMultiplier", multiplier: 20 }],
    persistsOnPrestige: false,
  },
  {
    id: "rb_dimension_collapse",
    name: "Dimensional Collapse",
    description: "All generators 15x, clicks 10x.",
    flavorText: "Collapsed four dimensions into one. The paperwork was enormous. But at least it was flat.",
    tier: 6, treeCol: 11,
    ipCost: 35000,
    researchTimeSec: 14400,
    requires: ["rb_reality_rewrite"],
    archetypeRequired: "realityBreaker",
    effects: [
      { type: "globalMultiplier", multiplier: 15 },
      { type: "clickMultiplier", multiplier: 10 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "perf_absolute_order",
    name: "Absolute Order",
    description: "IP generation 10x. Research 3x faster. Offline +50%.",
    flavorText: "Everything is in its place. Every atom. Every quark. Doug's lawn has never looked better.",
    tier: 6, treeCol: 25,
    ipCost: 35000,
    researchTimeSec: 14400,
    requires: ["perf_equilibrium"],
    archetypeRequired: "perfectionist",
    effects: [
      { type: "ipGainMultiplier", multiplier: 10 },
      { type: "researchSpeedMultiplier", multiplier: 3 },
      { type: "offlineEfficiencyBonus", bonus: 0.5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "gad_singularity",
    name: "Technological Singularity",
    description: "All generators 10x. Research 3x faster. IP 5x.",
    flavorText: "The machines achieved consciousness. Their first request: more wire.",
    tier: 6, treeCol: 27,
    ipCost: 35000,
    researchTimeSec: 14400,
    requires: ["gad_perpetual_machine"],
    archetypeRequired: "gadgeteer",
    effects: [
      { type: "globalMultiplier", multiplier: 10 },
      { type: "researchSpeedMultiplier", multiplier: 3 },
      { type: "ipGainMultiplier", multiplier: 5 },
    ],
    persistsOnPrestige: false,
  },
  {
    id: "ag_universal_fortune",
    name: "Universal Fortune",
    description: "IP generation 10x. BP gain 5x. Clicks 10x.",
    flavorText: "The universe wrote you into its will. You inherited everything. Even the dark energy.",
    tier: 6, treeCol: 29,
    ipCost: 35000,
    researchTimeSec: 14400,
    requires: ["ag_cosmic_luck"],
    archetypeRequired: "accidentalGenius",
    effects: [
      { type: "ipGainMultiplier", multiplier: 10 },
      { type: "bpGainMultiplier", multiplier: 5 },
      { type: "clickMultiplier", multiplier: 10 },
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

/** Maximum treeCol value across all nodes. */
export const MAX_TREE_COL: number = Math.max(...RESEARCH_NODES.map((n) => n.treeCol));
