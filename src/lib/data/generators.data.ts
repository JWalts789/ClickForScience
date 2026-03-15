import { Decimal } from "../utils/decimal";
import type { MadnessArchetype } from "../engine/state";

// ── Generator Definition ────────────────────────────────────────────

export interface GeneratorDef {
  id: string;
  name: string;
  description: string;
  baseCost: Decimal;
  baseProduction: Decimal;
  costGrowthRate: number;
  /** Which archetype(s) this generator leans toward. */
  madnessLean: MadnessArchetype[];
  /** Milestone-based description overrides. Checked in order; first match wins. */
  milestoneDescs?: { count: number; text: string }[];
}

// ── Milestone Multipliers ───────────────────────────────────────────

export interface MilestoneThreshold {
  count: number;
  multiplier: number;
}

export const MILESTONES: MilestoneThreshold[] = [
  { count: 10, multiplier: 2 },
  { count: 25, multiplier: 2 },
  { count: 50, multiplier: 2 },
  { count: 100, multiplier: 2 },
  { count: 150, multiplier: 2 },
  { count: 200, multiplier: 2 },
  { count: 250, multiplier: 3 },
  { count: 500, multiplier: 10 },
];

// ── The 10 Generators ───────────────────────────────────────────────

export const GENERATORS: GeneratorDef[] = [
  {
    id: "notebook",
    name: "Spiral Notebook",
    description: "You jot down observations. Most are doodles.",
    baseCost: new Decimal(10),
    baseProduction: new Decimal(0.1),
    costGrowthRate: 1.07,
    madnessLean: [],
    milestoneDescs: [
      { count: 10, text: "The doodles are starting to look like equations." },
      { count: 25, text: "Office supply store has you on a watch list." },
      { count: 50, text: "Your garage is wallpapered in notes. Literally." },
      { count: 100, text: "The paper company has a file with your name on it." },
      { count: 200, text: "You've written more than most novelists. None of it is fiction. Probably." },
    ],
  },
  {
    id: "soldering",
    name: "Soldering Station",
    description: "The smell of melting solder is oddly calming.",
    baseCost: new Decimal(100),
    baseProduction: new Decimal(0.5),
    costGrowthRate: 1.08,
    madnessLean: ["gadgeteer"],
    milestoneDescs: [
      { count: 10, text: "The power company has noticed you." },
      { count: 25, text: "The fire department has a truck pre-staged nearby." },
      { count: 50, text: "Everything you touch has solder on it. Everything." },
      { count: 100, text: "You can solder by feel now. Also by smell. Also by taste, but let's not talk about that." },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry Set",
    description: "The beakers came from Amazon. The compounds... didn't.",
    baseCost: new Decimal(1100),
    baseProduction: new Decimal(4),
    costGrowthRate: 1.09,
    madnessLean: ["unhinged"],
    milestoneDescs: [
      { count: 10, text: "Elm Street smells like a swimming pool crossed with fireworks." },
      { count: 25, text: "The EPA has received an anonymous tip about you." },
      { count: 50, text: "Your lawn spontaneously changed color. You claim it was 'intentional.'" },
      { count: 100, text: "You've invented three new colors. Two of them are angry." },
    ],
  },
  {
    id: "server",
    name: "Server Rack",
    description: "It was an old Dell. Now it dreams.",
    baseCost: new Decimal(12000),
    baseProduction: new Decimal(10),
    costGrowthRate: 1.1,
    madnessLean: ["perfectionist"],
    milestoneDescs: [
      { count: 10, text: "Your household uses 40% of the neighborhood's bandwidth." },
      { count: 25, text: "The garage temperature exceeds 120°F. Neighbors report 'data center smell.'" },
      { count: 50, text: "The NSA has asked you — politely — to stop pinging them." },
      { count: 100, text: "Your garage has more computing power than most countries." },
    ],
  },
  {
    id: "prototype",
    name: "Prototype Machine",
    description:
      "It does something. You're not sure what. It keeps doing it.",
    baseCost: new Decimal(130000),
    baseProduction: new Decimal(40),
    costGrowthRate: 1.11,
    madnessLean: ["accidentalGenius"],
    milestoneDescs: [
      { count: 10, text: "A satellite has detected your prototypes. The Pentagon wants answers." },
      { count: 25, text: "They've started communicating with each other. You didn't program that." },
      { count: 50, text: "One of them filed a patent. You're not sure how." },
    ],
  },
  {
    id: "containment",
    name: "Containment Chamber",
    description: "What's inside? Better question: what was inside?",
    baseCost: new Decimal(1400000),
    baseProduction: new Decimal(100),
    costGrowthRate: 1.12,
    madnessLean: ["unhinged", "realityBreaker"],
    milestoneDescs: [
      { count: 10, text: "Containment breach reported. Contents: 'unclear.'" },
      { count: 25, text: "The zoning board discovered your underground expansion." },
      { count: 50, text: "You've lost track of which chambers have things in them and which ones ARE things." },
    ],
  },
  {
    id: "collider",
    name: "Particle Collider (Mini)",
    description: "It's mini. The explosions are not.",
    baseCost: new Decimal(20000000),
    baseProduction: new Decimal(400),
    costGrowthRate: 1.13,
    madnessLean: ["realityBreaker"],
    milestoneDescs: [
      { count: 10, text: "You insist the explosion was 'mini.' Neighbors disagree." },
      { count: 25, text: "CERN called. They want to know where you got those readings." },
      { count: 50, text: "The hum is constant. Mrs. Patterson does yoga to it." },
    ],
  },
  {
    id: "mindlink",
    name: "Mind-Link Array",
    description: "Volunteers? No. Participants.",
    baseCost: new Decimal(330000000),
    baseProduction: new Decimal(1600),
    costGrowthRate: 1.13,
    madnessLean: ["megalomaniac"],
    milestoneDescs: [
      { count: 10, text: "You can feel the data now. It tastes blue." },
      { count: 25, text: "Every data stream, every calculation — it's like a hundred versions of yourself, all slightly smarter." },
    ],
  },
  {
    id: "reality",
    name: "Reality Engine",
    description: "The laws of physics sent a cease-and-desist.",
    baseCost: new Decimal(5100000000),
    baseProduction: new Decimal(6400),
    costGrowthRate: 1.14,
    madnessLean: ["realityBreaker"],
    milestoneDescs: [
      { count: 10, text: "You're not editing reality anymore. You're AUTHORING it." },
      { count: 25, text: "Reality v23.7 is your favorite — the sky is more purple and dogs can talk." },
    ],
  },
  {
    id: "cosmic",
    name: "Cosmic Loom",
    description: "You're not weaving fabric. You're weaving causality.",
    baseCost: new Decimal(75000000000),
    baseProduction: new Decimal(25600),
    costGrowthRate: 1.14,
    madnessLean: [],
    milestoneDescs: [
      { count: 10, text: "Astronomers have detected an anomaly. It's coming from... a suburb?" },
      { count: 25, text: "Each loom weaves a different thread of existence. Together, they're making a very complex sweater." },
    ],
  },
];
