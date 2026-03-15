import type { GameState, MadnessArchetype } from "./state";
import { ALL_ARCHETYPES } from "./state";

// ── Affinity Awards ─────────────────────────────────────────────────

/** Points awarded per generator purchased, per lean tag. */
const GENERATOR_AFFINITY = 1;

/** Points awarded per upgrade purchased, per madness tag. */
const UPGRADE_AFFINITY = 3;

/**
 * Award madness affinity for purchasing generators.
 * Called from purchaseGenerator with the lean tags and count bought.
 */
export function awardGeneratorAffinity(
  state: GameState,
  leanTags: MadnessArchetype[],
  count: number
): void {
  if (leanTags.length === 0) return;
  const points = GENERATOR_AFFINITY * count;
  for (const tag of leanTags) {
    state.madness.affinities[tag] += points;
  }
  recalculateMadness(state);
}

/**
 * Award madness affinity for purchasing an upgrade.
 * Called from purchaseUpgrade with the upgrade's madness tags.
 */
export function awardUpgradeAffinity(
  state: GameState,
  tags: MadnessArchetype[]
): void {
  if (tags.length === 0) return;
  for (const tag of tags) {
    state.madness.affinities[tag] += UPGRADE_AFFINITY;
  }
  recalculateMadness(state);
}

// ── Level & Archetype Calculation ────────────────────────────────────

/** Total affinity thresholds for each madness level (0-8). */
const LEVEL_THRESHOLDS = [0, 10, 30, 60, 100, 160, 240, 350, 500];

/** Minimum affinity in a single archetype to be considered "dominant". */
const DOMINANCE_THRESHOLD = 15;

/**
 * Recalculate madnessLevel and dominantArchetype from current affinities.
 */
export function recalculateMadness(state: GameState): void {
  const affinities = state.madness.affinities;

  // Total affinity across all archetypes
  let total = 0;
  for (const arch of ALL_ARCHETYPES) {
    total += affinities[arch];
  }

  // Determine level (0-8)
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  state.madness.madnessLevel = level;

  // Determine dominant archetype (highest above threshold, null if none)
  let dominant: MadnessArchetype | null = null;
  let maxAffinity = 0;

  for (const arch of ALL_ARCHETYPES) {
    if (affinities[arch] >= DOMINANCE_THRESHOLD && affinities[arch] > maxAffinity) {
      maxAffinity = affinities[arch];
      dominant = arch;
    }
  }
  state.madness.dominantArchetype = dominant;
}
