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
  {
    id: "notebook_3",
    name: "Automatic Transcription",
    description: "Spiral Notebooks produce 5x more RP.",
    cost: new Decimal(5000000),
    effects: [{ type: "generatorMultiplier", target: "notebook", multiplier: 5 }],
    requires: ["notebook_2"],
    madnessTags: ["gadgeteer"],
    category: "production",
  },
  {
    id: "notebook_4",
    name: "Living Ink",
    description: "Spiral Notebooks produce 10x more RP. The notes write themselves now.",
    cost: new Decimal(50000000000),
    effects: [{ type: "generatorMultiplier", target: "notebook", multiplier: 10 }],
    requires: ["notebook_3"],
    madnessTags: ["accidentalGenius"],
    category: "production",
  },

  // Whiteboard chain
  {
    id: "whiteboard_1",
    name: "Color-Coded Markers",
    description: "Whiteboard Walls produce 2x more RP.",
    cost: new Decimal(500),
    effects: [{ type: "generatorMultiplier", target: "whiteboard", multiplier: 2 }],
    requires: [],
    madnessTags: ["perfectionist"],
    category: "production",
  },
  {
    id: "whiteboard_2",
    name: "Magnetic Whiteboard Surface",
    description: "Whiteboard Walls produce 3x more RP.",
    cost: new Decimal(25000),
    effects: [{ type: "generatorMultiplier", target: "whiteboard", multiplier: 3 }],
    requires: ["whiteboard_1"],
    madnessTags: ["perfectionist"],
    category: "production",
  },
  {
    id: "whiteboard_3",
    name: "Smart Surface Display",
    description: "Whiteboard Walls produce 5x more RP.",
    cost: new Decimal(10000000),
    effects: [{ type: "generatorMultiplier", target: "whiteboard", multiplier: 5 }],
    requires: ["whiteboard_2"],
    madnessTags: ["gadgeteer"],
    category: "production",
  },
  {
    id: "whiteboard_4",
    name: "Dimensional Whiteboard",
    description: "Whiteboard Walls produce 10x more RP. It writes on both sides of reality.",
    cost: new Decimal(100000000000),
    effects: [{ type: "generatorMultiplier", target: "whiteboard", multiplier: 10 }],
    requires: ["whiteboard_3"],
    madnessTags: ["realityBreaker"],
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
  {
    id: "soldering_3",
    name: "Plasma Welding Arm",
    description: "Soldering Stations produce 5x more RP.",
    cost: new Decimal(25000000),
    effects: [{ type: "generatorMultiplier", target: "soldering", multiplier: 5 }],
    requires: ["soldering_2"],
    madnessTags: ["gadgeteer", "unhinged"],
    category: "production",
  },
  {
    id: "soldering_4",
    name: "Atomic Bond Welder",
    description: "Soldering Stations produce 10x more RP. Joins atoms by asking nicely.",
    cost: new Decimal(200000000000),
    effects: [{ type: "generatorMultiplier", target: "soldering", multiplier: 10 }],
    requires: ["soldering_3"],
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
  {
    id: "chemistry_3",
    name: "Transmutation Circle",
    description: "Chemistry Sets produce 5x more RP.",
    cost: new Decimal(100000000),
    effects: [{ type: "generatorMultiplier", target: "chemistry", multiplier: 5 }],
    requires: ["chemistry_2"],
    madnessTags: ["unhinged", "realityBreaker"],
    category: "production",
  },
  {
    id: "chemistry_4",
    name: "Philosopher's Catalyst",
    description: "Chemistry Sets produce 10x more RP. Every reaction yields gold. Metaphorical gold.",
    cost: new Decimal(500000000000),
    effects: [{ type: "generatorMultiplier", target: "chemistry", multiplier: 10 }],
    requires: ["chemistry_3"],
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
  {
    id: "server_3",
    name: "Quantum Co-Processors",
    description: "Server Racks produce 5x more RP.",
    cost: new Decimal(500000000),
    effects: [{ type: "generatorMultiplier", target: "server", multiplier: 5 }],
    requires: ["server_2"],
    madnessTags: ["perfectionist"],
    category: "production",
  },
  {
    id: "server_4",
    name: "Self-Evolving Architecture",
    description: "Server Racks produce 10x more RP. The servers upgrade themselves now.",
    cost: new Decimal(1000000000000),
    effects: [{ type: "generatorMultiplier", target: "server", multiplier: 10 }],
    requires: ["server_3"],
    madnessTags: ["perfectionist", "megalomaniac"],
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
  {
    id: "prototype_3",
    name: "Self-Replicating Blueprints",
    description: "Prototype Machines produce 5x more RP.",
    cost: new Decimal(2000000000),
    effects: [{ type: "generatorMultiplier", target: "prototype", multiplier: 5 }],
    requires: ["prototype_2"],
    madnessTags: ["accidentalGenius"],
    category: "production",
  },
  {
    id: "prototype_4",
    name: "Prototypes All the Way Down",
    description: "Prototype Machines produce 10x more RP. Each prototype builds a smaller prototype inside it.",
    cost: new Decimal(5000000000000),
    effects: [{ type: "generatorMultiplier", target: "prototype", multiplier: 10 }],
    requires: ["prototype_3"],
    madnessTags: ["accidentalGenius", "unhinged"],
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
  {
    id: "containment_2",
    name: "Electromagnetic Seals",
    description: "Containment Chambers produce 3x more RP.",
    cost: new Decimal(5000000000),
    effects: [{ type: "generatorMultiplier", target: "containment", multiplier: 3 }],
    requires: ["containment_1"],
    madnessTags: ["unhinged", "gadgeteer"],
    category: "production",
  },
  {
    id: "containment_3",
    name: "Pocket Universe Isolation",
    description: "Containment Chambers produce 10x more RP. Each chamber is its own reality.",
    cost: new Decimal(10000000000000),
    effects: [{ type: "generatorMultiplier", target: "containment", multiplier: 10 }],
    requires: ["containment_2"],
    madnessTags: ["realityBreaker"],
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
  {
    id: "collider_2",
    name: "Superconducting Ring",
    description: "Particle Colliders produce 3x more RP.",
    cost: new Decimal(20000000000),
    effects: [{ type: "generatorMultiplier", target: "collider", multiplier: 3 }],
    requires: ["collider_1"],
    madnessTags: ["realityBreaker"],
    category: "production",
  },
  {
    id: "collider_3",
    name: "Planck-Scale Accelerator",
    description: "Particle Colliders produce 10x more RP. Colliding things that shouldn't be collided.",
    cost: new Decimal(50000000000000),
    effects: [{ type: "generatorMultiplier", target: "collider", multiplier: 10 }],
    requires: ["collider_2"],
    madnessTags: ["realityBreaker", "unhinged"],
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
  {
    id: "mindlink_2",
    name: "Hive-Mind Synchronizer",
    description: "Mind-Link Arrays produce 3x more RP.",
    cost: new Decimal(100000000000),
    effects: [{ type: "generatorMultiplier", target: "mindlink", multiplier: 3 }],
    requires: ["mindlink_1"],
    madnessTags: ["megalomaniac"],
    category: "production",
  },
  {
    id: "mindlink_3",
    name: "Collective Consciousness Engine",
    description: "Mind-Link Arrays produce 10x more RP. Every mind on Elm Street contributes.",
    cost: new Decimal(100000000000000),
    effects: [{ type: "generatorMultiplier", target: "mindlink", multiplier: 10 }],
    requires: ["mindlink_2"],
    madnessTags: ["megalomaniac", "ethicallyUnhinged"],
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
  {
    id: "reality_2",
    name: "Multiverse Compiler",
    description: "Reality Engines produce 3x more RP.",
    cost: new Decimal(500000000000),
    effects: [{ type: "generatorMultiplier", target: "reality", multiplier: 3 }],
    requires: ["reality_1"],
    madnessTags: ["realityBreaker"],
    category: "production",
  },
  {
    id: "reality_3",
    name: "Consensus Reality Override",
    description: "Reality Engines produce 10x more RP. Physics is now a suggestion.",
    cost: new Decimal(500000000000000),
    effects: [{ type: "generatorMultiplier", target: "reality", multiplier: 10 }],
    requires: ["reality_2"],
    madnessTags: ["realityBreaker", "megalomaniac"],
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
  {
    id: "cosmic_2",
    name: "Fate Weaving Protocols",
    description: "Cosmic Looms produce 3x more RP.",
    cost: new Decimal(5000000000000),
    effects: [{ type: "generatorMultiplier", target: "cosmic", multiplier: 3 }],
    requires: ["cosmic_1"],
    madnessTags: ["megalomaniac"],
    category: "production",
  },
  {
    id: "cosmic_3",
    name: "Universal Tapestry",
    description: "Cosmic Looms produce 10x more RP. You're weaving the story of everything.",
    cost: new Decimal(1e15),
    effects: [{ type: "generatorMultiplier", target: "cosmic", multiplier: 10 }],
    requires: ["cosmic_2"],
    madnessTags: [],
    category: "production",
  },

  // ── New Generator Upgrade Chains ──────────────────────────────────

  // Temporal chain
  {
    id: "temporal_1",
    name: "Chronometric Lens Polish",
    description: "Temporal Lenses produce 2x more RP.",
    cost: new Decimal(1e10),
    effects: [{ type: "generatorMultiplier", target: "temporal", multiplier: 2 }],
    requires: [],
    madnessTags: ["realityBreaker"],
    category: "production",
  },
  {
    id: "temporal_2",
    name: "Paradox Buffer",
    description: "Temporal Lenses produce 3x more RP. Prevents most grandfather paradoxes.",
    cost: new Decimal(1e13),
    effects: [{ type: "generatorMultiplier", target: "temporal", multiplier: 3 }],
    requires: ["temporal_1"],
    madnessTags: ["realityBreaker", "perfectionist"],
    category: "production",
  },

  // Quantum Forge chain
  {
    id: "quantum_forge_1",
    name: "Probability Anvil",
    description: "Quantum Forges produce 2x more RP.",
    cost: new Decimal(1e11),
    effects: [{ type: "generatorMultiplier", target: "quantum_forge", multiplier: 2 }],
    requires: [],
    madnessTags: ["gadgeteer"],
    category: "production",
  },
  {
    id: "quantum_forge_2",
    name: "Schrödinger's Hammer",
    description: "Quantum Forges produce 3x more RP. It hits and misses simultaneously.",
    cost: new Decimal(1e14),
    effects: [{ type: "generatorMultiplier", target: "quantum_forge", multiplier: 3 }],
    requires: ["quantum_forge_1"],
    madnessTags: ["gadgeteer", "unhinged"],
    category: "production",
  },

  // Void Siphon chain
  {
    id: "void_tap_1",
    name: "Deeper Straw",
    description: "Void Siphons produce 2x more RP.",
    cost: new Decimal(1e12),
    effects: [{ type: "generatorMultiplier", target: "void_tap", multiplier: 2 }],
    requires: [],
    madnessTags: ["megalomaniac"],
    category: "production",
  },
  {
    id: "void_tap_2",
    name: "Void Communion",
    description: "Void Siphons produce 3x more RP. The void appreciates being asked first.",
    cost: new Decimal(1e15),
    effects: [{ type: "generatorMultiplier", target: "void_tap", multiplier: 3 }],
    requires: ["void_tap_1"],
    madnessTags: ["megalomaniac", "realityBreaker"],
    category: "production",
  },

  // Neural Garden chain
  {
    id: "neural_garden_1",
    name: "Miracle-Gro (Neural Edition)",
    description: "Neural Gardens produce 2x more RP.",
    cost: new Decimal(1e13),
    effects: [{ type: "generatorMultiplier", target: "neural_garden", multiplier: 2 }],
    requires: [],
    madnessTags: ["accidentalGenius"],
    category: "production",
  },
  {
    id: "neural_garden_2",
    name: "Symbiotic Root Network",
    description: "Neural Gardens produce 3x more RP. The garden thinks, therefore it grows.",
    cost: new Decimal(1e16),
    effects: [{ type: "generatorMultiplier", target: "neural_garden", multiplier: 3 }],
    requires: ["neural_garden_1"],
    madnessTags: ["accidentalGenius", "ethicallyUnhinged"],
    category: "production",
  },

  // Gravity Sculptor chain
  {
    id: "gravity_well_1",
    name: "Mass Calibration Weights",
    description: "Gravity Sculptors produce 2x more RP.",
    cost: new Decimal(1e14),
    effects: [{ type: "generatorMultiplier", target: "gravity_well", multiplier: 2 }],
    requires: [],
    madnessTags: ["perfectionist"],
    category: "production",
  },
  {
    id: "gravity_well_2",
    name: "Graviton Chisel",
    description: "Gravity Sculptors produce 3x more RP. Carves space itself.",
    cost: new Decimal(1e17),
    effects: [{ type: "generatorMultiplier", target: "gravity_well", multiplier: 3 }],
    requires: ["gravity_well_1"],
    madnessTags: ["perfectionist", "megalomaniac"],
    category: "production",
  },

  // Dimensional Weaver chain
  {
    id: "dimensional_loom_1",
    name: "Extra-Dimensional Thread",
    description: "Dimensional Weavers produce 2x more RP.",
    cost: new Decimal(1e15),
    effects: [{ type: "generatorMultiplier", target: "dimensional_loom", multiplier: 2 }],
    requires: [],
    madnessTags: ["realityBreaker"],
    category: "production",
  },
  {
    id: "dimensional_loom_2",
    name: "Infinite Spool",
    description: "Dimensional Weavers produce 3x more RP. Never runs out. Literally never.",
    cost: new Decimal(1e18),
    effects: [{ type: "generatorMultiplier", target: "dimensional_loom", multiplier: 3 }],
    requires: ["dimensional_loom_1"],
    madnessTags: ["realityBreaker", "gadgeteer"],
    category: "production",
  },

  // Singularity Core chain
  {
    id: "singularity_1",
    name: "Event Horizon Polisher",
    description: "Singularity Cores produce 2x more RP.",
    cost: new Decimal(1e16),
    effects: [{ type: "generatorMultiplier", target: "singularity", multiplier: 2 }],
    requires: [],
    madnessTags: ["unhinged"],
    category: "production",
  },
  {
    id: "singularity_2",
    name: "Hawking Radiation Harvester",
    description: "Singularity Cores produce 3x more RP. Waste not, want not.",
    cost: new Decimal(1e19),
    effects: [{ type: "generatorMultiplier", target: "singularity", multiplier: 3 }],
    requires: ["singularity_1"],
    madnessTags: ["unhinged", "megalomaniac"],
    category: "production",
  },

  // Omniscience Engine chain
  {
    id: "omniscience_1",
    name: "Expanded Awareness Buffer",
    description: "Omniscience Engines produce 2x more RP.",
    cost: new Decimal(1e18),
    effects: [{ type: "generatorMultiplier", target: "omniscience", multiplier: 2 }],
    requires: [],
    madnessTags: [],
    category: "production",
  },
  {
    id: "omniscience_2",
    name: "Total Perspective Integration",
    description: "Omniscience Engines produce 3x more RP. It now knows what it doesn't know.",
    cost: new Decimal(1e21),
    effects: [{ type: "generatorMultiplier", target: "omniscience", multiplier: 3 }],
    requires: ["omniscience_1"],
    madnessTags: ["megalomaniac"],
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
  tier: 1 | 2 | 3 | 4;
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

  // ── Tier 4: Beyond the Breakthrough (1B – 100B BP) ────────────────

  {
    id: "bp_prod_4",
    name: "Fundamental Forces Retuned",
    description: "All generators produce 10x more RP (permanent).",
    cost: new Decimal(1e9),
    effects: [{ type: "globalMultiplier", multiplier: 10 }],
    requires: ["bp_prod_3"],
    tier: 4,
  },
  {
    id: "bp_click_4",
    name: "The Voss Touch",
    description: "Clicks produce 25x more RP (permanent).",
    cost: new Decimal(2e9),
    effects: [{ type: "clickMultiplier", multiplier: 25 }],
    requires: ["bp_click_3"],
    tier: 4,
  },
  {
    id: "bp_gain_3",
    name: "CHRYSALIS Resonance",
    description: "Earn 3x more Breakthrough Points on prestige.",
    cost: new Decimal(5e9),
    effects: [{ type: "bpGainMultiplier", multiplier: 3 }],
    requires: ["bp_gain_2"],
    tier: 4,
  },
  {
    id: "bp_starting_rp_3",
    name: "Voss's Endowment",
    description: "Start each run with 1 Billion RP.",
    cost: new Decimal(3e9),
    effects: [{ type: "startingRP", amount: 1e9 }],
    requires: ["bp_starting_rp_2"],
    tier: 4,
  },
  {
    id: "bp_temporal_boost",
    name: "Temporal Lens Calibration",
    description: "Temporal Lenses produce 5x more RP.",
    cost: new Decimal(1.5e9),
    effects: [{ type: "generatorMultiplier", target: "temporal", multiplier: 5 }],
    requires: ["bp_prod_3"],
    tier: 4,
  },
  {
    id: "bp_void_boost",
    name: "Void Resonance Amplifier",
    description: "Void Siphons produce 5x more RP.",
    cost: new Decimal(4e9),
    effects: [{ type: "generatorMultiplier", target: "void_tap", multiplier: 5 }],
    requires: ["bp_prod_3"],
    tier: 4,
  },
  {
    id: "bp_neural_garden_boost",
    name: "Symbiotic Growth Protocol",
    description: "Neural Gardens produce 5x more RP.",
    cost: new Decimal(8e9),
    effects: [{ type: "generatorMultiplier", target: "neural_garden", multiplier: 5 }],
    requires: ["bp_prod_3"],
    tier: 4,
  },
  {
    id: "bp_gravity_boost",
    name: "Patterson's Gravity Equations",
    description: "Gravity Sculptors produce 5x more RP.",
    cost: new Decimal(15e9),
    effects: [{ type: "generatorMultiplier", target: "gravity_well", multiplier: 5 }],
    requires: ["bp_prod_3"],
    tier: 4,
  },
  {
    id: "bp_dimensional_boost",
    name: "Tuesday Space Harmonics",
    description: "Dimensional Weavers produce 5x more RP.",
    cost: new Decimal(25e9),
    effects: [{ type: "generatorMultiplier", target: "dimensional_loom", multiplier: 5 }],
    requires: ["bp_prod_3"],
    tier: 4,
  },
  {
    id: "bp_singularity_boost",
    name: "Anchor Point Stabilization",
    description: "Singularity Cores produce 5x more RP.",
    cost: new Decimal(50e9),
    effects: [{ type: "generatorMultiplier", target: "singularity", multiplier: 5 }],
    requires: ["bp_prod_3"],
    tier: 4,
  },
  {
    id: "bp_omniscience_boost",
    name: "Total Perspective Vortex",
    description: "Omniscience Engines produce 5x more RP.",
    cost: new Decimal(75e9),
    effects: [{ type: "generatorMultiplier", target: "omniscience", multiplier: 5 }],
    requires: ["bp_prod_3"],
    tier: 4,
  },
  {
    id: "bp_prod_5",
    name: "Elm Street Superconductor",
    description: "All generators produce 25x more RP. The soil is alive with energy.",
    cost: new Decimal(100e9),
    effects: [{ type: "globalMultiplier", multiplier: 25 }],
    requires: ["bp_prod_4"],
    tier: 4,
  },
];

// ── Prestige Upgrade Lookup ──────────────────────────────────────────

const PRESTIGE_UPGRADE_MAP = new Map<string, PrestigeUpgradeDef>(
  PRESTIGE_UPGRADES.map((u) => [u.id, u])
);

export function getPrestigeUpgradeDef(id: string): PrestigeUpgradeDef | undefined {
  return PRESTIGE_UPGRADE_MAP.get(id);
}
