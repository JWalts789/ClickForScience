import { Decimal } from "../utils/decimal";
import type { GameState } from "./state";
import { getChallengeDef, CHALLENGES } from "../data/challenges.data";
import type { ChallengeRestriction, ChallengeReward } from "../data/challenges.data";

// ── Challenge Queries ─────────────────────────────────────────────────

/** Check if a challenge can be started (lab level met, not already completed, no active challenge). */
export function canStartChallenge(state: GameState, challengeId: string): boolean {
  if (state.activeChallenge !== null) return false;
  if (state.completedChallenges.includes(challengeId)) return false;

  const def = getChallengeDef(challengeId);
  if (!def) return false;

  return state.labLevel >= def.requiredLabLevel;
}

/** Start a challenge run. Triggers a prestige-like reset with restrictions active. */
export function startChallenge(state: GameState, challengeId: string): boolean {
  if (!canStartChallenge(state, challengeId)) return false;
  state.activeChallenge = challengeId;
  return true;
}

/** Abandon the current challenge without completing it. */
export function abandonChallenge(state: GameState): boolean {
  if (!state.activeChallenge) return false;
  state.activeChallenge = null;
  return true;
}

/** Check if the current challenge's BP goal is met. */
export function isChallengeGoalMet(state: GameState): boolean {
  if (!state.activeChallenge) return false;
  const def = getChallengeDef(state.activeChallenge);
  if (!def) return false;

  // For time-limited challenges, check if we're still within the time limit
  for (const r of def.restrictions) {
    if (r.type === "timeLimit" && state.currentRunTimeSec > r.seconds) {
      return false; // Ran out of time
    }
  }

  return true; // Goal is met via the prestige BP threshold
}

/** Complete the current challenge (called during prestige if goal is met). */
export function completeChallenge(state: GameState): string | null {
  if (!state.activeChallenge) return null;
  const challengeId = state.activeChallenge;

  if (!state.completedChallenges.includes(challengeId)) {
    state.completedChallenges.push(challengeId);
  }

  state.activeChallenge = null;
  return challengeId;
}

// ── Restriction Enforcement ──────────────────────────────────────────

/** Get active challenge restrictions (empty array if no challenge active). */
export function getActiveRestrictions(state: GameState): ChallengeRestriction[] {
  if (!state.activeChallenge) return [];
  const def = getChallengeDef(state.activeChallenge);
  return def?.restrictions ?? [];
}

/** Check if clicking is allowed (blocked by "noClicking" restriction). */
export function isClickingAllowed(state: GameState): boolean {
  return !getActiveRestrictions(state).some((r) => r.type === "noClicking");
}

/** Check if a specific generator can be purchased. */
export function isGeneratorAllowed(state: GameState, genId: string): boolean {
  for (const r of getActiveRestrictions(state)) {
    if (r.type === "singleGeneratorType" && r.genId !== genId) return false;
    if (r.type === "maxGenerators") {
      // Check handled at purchase time — this just checks if the type is allowed
      // For maxEach = 0, no generators are allowed at all
      if (r.maxEach === 0) return false;
    }
  }
  return true;
}

/** Check if a generator purchase would exceed the maxGenerators cap. */
export function isGeneratorCapReached(state: GameState, genId: string, currentOwned: Decimal): boolean {
  for (const r of getActiveRestrictions(state)) {
    if (r.type === "maxGenerators" && currentOwned.gte(r.maxEach)) return true;
  }
  return false;
}

/** Check if upgrades are allowed. */
export function areUpgradesAllowed(state: GameState): boolean {
  return !getActiveRestrictions(state).some((r) => r.type === "noUpgrades");
}

/** Check if prestige upgrades can be used (for noPrestigeUpgrades restriction). */
export function arePrestigeUpgradesAllowed(state: GameState): boolean {
  return !getActiveRestrictions(state).some((r) => r.type === "noPrestigeUpgrades");
}

/** Check if research is allowed. */
export function isResearchAllowedInChallenge(state: GameState): boolean {
  return !getActiveRestrictions(state).some((r) => r.type === "noResearch");
}

/** Check if the time limit has been exceeded (for timeLimit challenges). */
export function isTimeLimitExceeded(state: GameState): boolean {
  for (const r of getActiveRestrictions(state)) {
    if (r.type === "timeLimit" && state.currentRunTimeSec > r.seconds) return true;
  }
  return false;
}

/** Get required archetype for the challenge (if any). */
export function getRequiredArchetype(state: GameState): string | null {
  for (const r of getActiveRestrictions(state)) {
    if (r.type === "requireArchetype") return r.archetype;
  }
  return null;
}

/** Get the time limit in seconds (if any). */
export function getChallengeTimeLimit(state: GameState): number | null {
  for (const r of getActiveRestrictions(state)) {
    if (r.type === "timeLimit") return r.seconds;
  }
  return null;
}

// ── Reward Multiplier Queries ────────────────────────────────────────

/** Collect all rewards from completed challenges. */
function allCompletedRewards(state: GameState): ChallengeReward[] {
  const rewards: ChallengeReward[] = [];
  for (const cId of state.completedChallenges) {
    const def = getChallengeDef(cId);
    if (!def) continue;
    for (const reward of def.rewards) {
      rewards.push(reward);
    }
  }
  return rewards;
}

/** Global production multiplier from completed challenges. */
export function challengeGlobalMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const r of allCompletedRewards(state)) {
    if (r.type === "globalMultiplier") mult = mult.mul(r.multiplier);
  }
  return mult;
}

/** Generator-specific multiplier from completed challenges. */
export function challengeGeneratorMultiplier(state: GameState, genId: string): Decimal {
  let mult = new Decimal(1);
  for (const r of allCompletedRewards(state)) {
    if (r.type === "generatorMultiplier" && r.genId === genId) mult = mult.mul(r.multiplier);
  }
  return mult;
}

/** Click multiplier from completed challenges. */
export function challengeClickMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const r of allCompletedRewards(state)) {
    if (r.type === "clickMultiplier") mult = mult.mul(r.multiplier);
  }
  return mult;
}

/** BP gain multiplier from completed challenges. */
export function challengeBPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const r of allCompletedRewards(state)) {
    if (r.type === "bpGainMultiplier") mult = mult.mul(r.multiplier);
  }
  return mult;
}

/** Offline efficiency bonus from completed challenges. */
export function challengeOfflineBonus(state: GameState): number {
  let bonus = 0;
  for (const r of allCompletedRewards(state)) {
    if (r.type === "offlineEfficiency") bonus += r.bonus;
  }
  return bonus;
}

/** Milestone multiplier bonus from completed challenges. */
export function challengeMilestoneMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const r of allCompletedRewards(state)) {
    if (r.type === "milestoneMultiplier") mult = mult.mul(r.multiplier);
  }
  return mult;
}

/** Specialization passive strength multiplier from archetype mastery challenges. */
export function challengeSpecPassiveMultiplier(state: GameState): number {
  let mult = 1;
  for (const r of allCompletedRewards(state)) {
    if (r.type === "specPassiveStrength") mult *= r.multiplier;
  }
  return mult;
}

/** IP gain multiplier from completed challenges. */
export function challengeIPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const r of allCompletedRewards(state)) {
    if (r.type === "ipGainMultiplier") mult = mult.mul(r.multiplier);
  }
  return mult;
}
