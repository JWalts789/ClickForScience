import { Decimal } from "../utils/decimal";
import type { Notation } from "../utils/format";
import { GENERATORS } from "../data/generators.data";

// ── Madness Archetypes ──────────────────────────────────────────────

export type MadnessArchetype =
  | "megalomaniac"
  | "perfectionist"
  | "unhinged"
  | "realityBreaker"
  | "gadgeteer"
  | "accidentalGenius";

export const ALL_ARCHETYPES: MadnessArchetype[] = [
  "megalomaniac",
  "perfectionist",
  "unhinged",
  "realityBreaker",
  "gadgeteer",
  "accidentalGenius",
];

export interface MadnessState {
  /** Accumulated affinity points per archetype. */
  affinities: Record<MadnessArchetype, number>;
  /** Highest-affinity archetype (null if none above threshold). */
  dominantArchetype: MadnessArchetype | null;
  /** Overall madness level 0-8, derived from total affinity. */
  madnessLevel: number;
}

// ── Timed Buffs ─────────────────────────────────────────────────────

export interface TimedBuff {
  id: string;
  multiplier: Decimal;
  /** "all", "click", or a specific generator ID. */
  target: string;
  remainingSeconds: number;
}

// ── Generator Instance State ────────────────────────────────────────

export interface GeneratorState {
  id: string;
  owned: Decimal;
  totalProduced: Decimal;
}

// ── Auto-Buyer Config ──────────────────────────────────────────────

export interface AutobuyerConfig {
  /** Per-generator toggle: is autobuyer enabled for this generator? */
  enabled: Record<string, boolean>;
  /** Global RP reserve — autobuyers won't spend below this % of current RP. */
  reservePercent: number;
}

// ── Settings ────────────────────────────────────────────────────────

export interface GameSettings {
  notation: Notation;
  autosaveIntervalSec: number;
  showConfirmOnPrestige: boolean;
  offlineProgressEnabled: boolean;
}

// ── Active Research ─────────────────────────────────────────────────

export interface ActiveResearch {
  nodeId: string;
  remainingSec: number;
}

// ── Specialization State ──────────────────────────────────────────

export interface SpecializationState {
  /** Which archetype the player has specialized in this run (null if none). */
  archetype: MadnessArchetype | null;
  /** Specialization generator state. */
  generator: GeneratorState | null;
  /** Purchased specialization upgrades this run. */
  purchasedUpgrades: string[];
  /** Total RP spent on generators this run (for Accidental Genius passive). */
  rpSpentOnGenerators: Decimal;
  /** RP recovered so far from the rpRecovery passive. */
  rpRecovered: Decimal;
  /** Peak RP/sec achieved this run (for Unhinged prestige mod). */
  peakRPPerSec: Decimal;
}

// ── Top-Level Game State ────────────────────────────────────────────

export interface GameState {
  /** Save format version — bump on breaking changes. */
  version: number;

  // Resources
  rp: Decimal;
  totalRPThisRun: Decimal;
  totalRPAllTime: Decimal;
  bp: Decimal;
  /** Insight Points — currency for the research tree. */
  ip: Decimal;
  totalIPAllTime: Decimal;

  // Generators
  generators: GeneratorState[];

  // Upgrades
  purchasedUpgrades: string[];

  // Prestige
  prestigeCount: number;
  prestigeUpgrades: string[];

  // Research
  /** Research nodes completed permanently (persistsOnPrestige: true). */
  completedResearch: string[];
  /** Research nodes completed this run (persistsOnPrestige: false). Cleared on prestige. */
  runCompletedResearch: string[];
  /** Currently active research project, or null. */
  activeResearch: ActiveResearch | null;

  // Achievements (persists across prestige)
  unlockedAchievements: string[];

  // Auto-Buyers (config persists across prestige)
  autobuyers: AutobuyerConfig;

  // Specialization (resets on prestige)
  specialization: SpecializationState;

  // Lab Expansion (persists across prestige)
  labLevel: number;

  // Challenge Runs (persists across prestige)
  /** Currently active challenge ID, or null. */
  activeChallenge: string | null;
  /** List of completed challenge IDs (permanent). */
  completedChallenges: string[];

  // Ascension (second prestige layer — persists permanently)
  /** Thesis Points — meta-prestige currency. */
  tp: Decimal;
  ascensionCount: number;
  ascensionUpgrades: string[];
  /** Total BP spent across all time (for TP formula). */
  totalBPSpentAllTime: Decimal;

  // Neighborhood (persists across prestige and ascension)
  /** Relationship level per NPC (0-10). */
  relationships: Record<string, number>;
  /** Cooldown timestamps per favor ID (epoch ms when available). */
  favorCooldowns: Record<string, number>;

  // Madness
  madness: MadnessState;

  // Events
  triggeredEvents: string[];
  /** Maps eventId → choiceIndex so we know WHICH choice was picked. */
  eventChoices: Record<string, number>;
  activeBuffs: TimedBuff[];

  // Lab Notes
  unlockedNotes: string[];

  // Meta / Timing
  lastSaveTimestamp: number;
  totalPlaytimeSec: number;
  fastestPrestigeSec: number | null;
  currentRunTimeSec: number;
  clickCount: Decimal;

  // Settings
  settings: GameSettings;
}

// ── Save Format Version ─────────────────────────────────────────────

export const CURRENT_SAVE_VERSION = 1;

// ── Factory ─────────────────────────────────────────────────────────

function createEmptyAffinities(): Record<MadnessArchetype, number> {
  return {
    megalomaniac: 0,
    perfectionist: 0,
    unhinged: 0,
    realityBreaker: 0,
    gadgeteer: 0,
    accidentalGenius: 0,
  };
}

export function createInitialState(): GameState {
  return {
    version: CURRENT_SAVE_VERSION,

    rp: new Decimal(0),
    totalRPThisRun: new Decimal(0),
    totalRPAllTime: new Decimal(0),
    bp: new Decimal(0),
    ip: new Decimal(0),
    totalIPAllTime: new Decimal(0),

    generators: GENERATORS.map((g) => ({
      id: g.id,
      owned: new Decimal(0),
      totalProduced: new Decimal(0),
    })),

    purchasedUpgrades: [],

    prestigeCount: 0,
    prestigeUpgrades: [],

    completedResearch: [],
    runCompletedResearch: [],
    activeResearch: null,

    unlockedAchievements: [],

    autobuyers: {
      enabled: {},
      reservePercent: 0,
    },

    specialization: {
      archetype: null,
      generator: null,
      purchasedUpgrades: [],
      rpSpentOnGenerators: new Decimal(0),
      rpRecovered: new Decimal(0),
      peakRPPerSec: new Decimal(0),
    },

    labLevel: 0,

    activeChallenge: null,
    completedChallenges: [],

    tp: new Decimal(0),
    ascensionCount: 0,
    ascensionUpgrades: [],
    totalBPSpentAllTime: new Decimal(0),

    relationships: {},
    favorCooldowns: {},

    madness: {
      affinities: createEmptyAffinities(),
      dominantArchetype: null,
      madnessLevel: 0,
    },

    triggeredEvents: [],
    eventChoices: {},
    activeBuffs: [],

    unlockedNotes: [],

    lastSaveTimestamp: Date.now(),
    totalPlaytimeSec: 0,
    fastestPrestigeSec: null,
    currentRunTimeSec: 0,
    clickCount: new Decimal(0),

    settings: {
      notation: "standard",
      autosaveIntervalSec: 30,
      showConfirmOnPrestige: true,
      offlineProgressEnabled: true,
    },
  };
}
