import { Decimal } from "../utils/decimal";

// ── Lab Expansion Definition ────────────────────────────────────────

export interface LabExpansionEffect {
  type: "globalMultiplier" | "ipGainMultiplier" | "researchSpeedMultiplier" | "offlineEfficiencyBonus";
  value: number;
}

export interface LabExpansionDef {
  level: number;
  id: string;
  name: string;
  description: string;
  flavorText: string;
  /** Hidden lore flavor text, revealed through deeper investigation. */
  secretFlavorText?: string;
  /** IP cost to purchase this expansion. */
  ipCost: Decimal;
  /** Cumulative effects granted at this lab level. */
  effects: LabExpansionEffect[];
  /** What this expansion unlocks (for display). */
  unlocks: string[];
}

// ── The 5 Lab Levels ───────────────────────────────────────────────
//
// Level 0 = Garage (starting, free)
// Levels 1-4 = Purchased with IP, permanent across prestige

export const LAB_EXPANSIONS: LabExpansionDef[] = [
  {
    level: 0,
    id: "garage",
    name: "Gary's Garage",
    description: "A single-car garage with a folding table and a dream.",
    flavorText: "The neighbors think you're fixing a lawnmower. You are not fixing a lawnmower.",
    secretFlavorText: "If you look closely at the foundation, there are marks. Deliberate marks. Someone measured this space very carefully before it was built.",
    ipCost: new Decimal(0),
    effects: [],
    unlocks: ["The beginning of everything"],
  },
  {
    level: 1,
    id: "basement",
    name: "The Basement",
    description: "You've dug beneath the garage. Doug noticed but said nothing.",
    flavorText: "Linda asked why there's dirt in the driveway. You said 'gardening.' At 2 AM. In winter.",
    secretFlavorText: "The soil composition changes abruptly at 3 meters. Below that line, the earth is warm. Not from pipes. Not from anything you can explain.",
    ipCost: new Decimal(500),
    effects: [
      { type: "globalMultiplier", value: 1.25 },
    ],
    unlocks: ["Challenge Runs", "+25% global production"],
  },
  {
    level: 2,
    id: "warehouse",
    name: "The Warehouse",
    description: "Purchased an abandoned warehouse on the edge of town. Totally normal.",
    flavorText: "The real estate agent asked what it's for. You said 'storage.' She didn't ask what you're storing.",
    secretFlavorText: "The warehouse's previous owner left in 1988. One year after Voss disappeared. The walls have the same spiral scratched into the concrete.",
    ipCost: new Decimal(2000),
    effects: [
      { type: "globalMultiplier", value: 1.5 },
      { type: "ipGainMultiplier", value: 1.25 },
    ],
    unlocks: ["Neighborhood System (Phase 9)", "+50% global production", "+25% IP generation"],
  },
  {
    level: 3,
    id: "underground",
    name: "Underground Facility",
    description: "A sprawling complex beneath the suburb. The ground occasionally hums.",
    flavorText: "Agent Reeves left a note: 'We know.' You left a note back: 'Good.' He hasn't returned.",
    secretFlavorText: "At this depth, your instruments detect a low-frequency vibration. 42.7-second intervals. It predates every structure above it. It predates the city.",
    ipCost: new Decimal(10000),
    effects: [
      { type: "globalMultiplier", value: 2 },
      { type: "ipGainMultiplier", value: 1.5 },
      { type: "researchSpeedMultiplier", value: 1.5 },
    ],
    unlocks: ["Ascension (Phase 9)", "+100% global production", "+50% IP generation", "+50% research speed"],
  },
  {
    level: 4,
    id: "orbital",
    name: "Orbital Platform",
    description: "You've launched a lab into orbit. NASA didn't help. NASA is confused.",
    flavorText: "The ISS crew waved. You waved back. They radioed Houston. Houston has questions.",
    secretFlavorText: "From orbit, the seven sites form a perfect heptagram. The lines connecting them pass through every major scientific breakthrough of the last century. This is not a coincidence. There are no coincidences on Elm Street.",
    ipCost: new Decimal(50000),
    effects: [
      { type: "globalMultiplier", value: 3 },
      { type: "ipGainMultiplier", value: 2 },
      { type: "researchSpeedMultiplier", value: 2 },
      { type: "offlineEfficiencyBonus", value: 0.25 },
    ],
    unlocks: ["3x global production", "2x IP generation", "2x research speed", "+25% offline efficiency"],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

export const MAX_LAB_LEVEL = LAB_EXPANSIONS.length - 1;

export function getLabExpansionDef(level: number): LabExpansionDef | undefined {
  return LAB_EXPANSIONS.find((e) => e.level === level);
}

export function getNextLabExpansion(currentLevel: number): LabExpansionDef | undefined {
  return LAB_EXPANSIONS.find((e) => e.level === currentLevel + 1);
}

/** Get the display name for a lab level. */
export function labLevelName(level: number): string {
  const def = getLabExpansionDef(level);
  return def?.name ?? "Gary's Garage";
}
