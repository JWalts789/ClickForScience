import { Decimal } from "../utils/decimal";
import type { GameState } from "./state";
import { ACHIEVEMENTS, getAchievementDef } from "../data/achievements.data";
import type { AchievementDef, AchievementTrigger, AchievementReward } from "../data/achievements.data";
import { GENERATORS } from "../data/generators.data";

// ── Trigger Evaluation ───────────────────────────────────────────────

function isTriggerMet(state: GameState, trigger: AchievementTrigger): boolean {
  switch (trigger.type) {
    case "clickCount":
      return state.clickCount.gte(trigger.count);

    case "totalRPAllTime":
      return state.totalRPAllTime.gte(trigger.amount);

    case "totalRPThisRun":
      return state.totalRPThisRun.gte(trigger.amount);

    case "generatorOwned": {
      const genIdx = GENERATORS.findIndex((g) => g.id === trigger.genId);
      if (genIdx === -1) return false;
      return state.generators[genIdx].owned.gte(trigger.count);
    }

    case "generatorOwnedTotal": {
      let total = new Decimal(0);
      for (const gen of state.generators) {
        total = total.add(gen.owned);
      }
      return total.gte(trigger.count);
    }

    case "allGeneratorsOwned":
      return state.generators.every((g) => g.owned.gte(trigger.count));

    case "distinctGenerators": {
      let distinct = 0;
      for (const gen of state.generators) {
        if (gen.owned.gt(0)) distinct++;
      }
      return distinct >= trigger.count;
    }

    case "upgradeCount":
      return state.purchasedUpgrades.length >= trigger.count;

    case "prestigeCount":
      return state.prestigeCount >= trigger.count;

    case "prestigeUpgradeCount":
      return state.prestigeUpgrades.length >= trigger.count;

    case "researchCount": {
      const total = state.completedResearch.length + state.runCompletedResearch.length;
      return total >= trigger.count;
    }

    case "totalPlaytimeSec":
      return state.totalPlaytimeSec >= trigger.seconds;

    case "fastestPrestigeSec":
      return state.fastestPrestigeSec !== null && state.fastestPrestigeSec <= trigger.seconds;

    case "madnessLevel":
      return state.madness.madnessLevel >= trigger.level;

    case "dominantArchetype":
      return state.madness.dominantArchetype === trigger.archetype;

    case "bpTotal":
      return state.bp.gte(trigger.amount);

    case "ipTotal":
      return state.totalIPAllTime.gte(trigger.amount);

    default:
      return false;
  }
}

// ── Achievement Checking ─────────────────────────────────────────────

/**
 * Check all achievements and return newly unlocked ones.
 * Automatically adds them to state.unlockedAchievements.
 */
export function checkAchievements(state: GameState): AchievementDef[] {
  const newlyUnlocked: AchievementDef[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(achievement.id)) continue;

    if (isTriggerMet(state, achievement.trigger)) {
      state.unlockedAchievements.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

// ── Reward Multiplier Queries ────────────────────────────────────────

/** Collect all rewards from all unlocked achievements. */
function allRewards(state: GameState): AchievementReward[] {
  const rewards: AchievementReward[] = [];
  for (const id of state.unlockedAchievements) {
    const def = getAchievementDef(id);
    if (!def) continue;
    rewards.push(def.reward);
  }
  return rewards;
}

/** Global production multiplier from achievements. */
export function achievementGlobalMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const reward of allRewards(state)) {
    if (reward.type === "globalMultiplier") {
      mult = mult.mul(reward.multiplier);
    }
  }
  return mult;
}

/** Generator-specific multiplier from achievements. */
export function achievementGeneratorMultiplier(state: GameState, genId: string): Decimal {
  let mult = new Decimal(1);
  for (const reward of allRewards(state)) {
    if (reward.type === "generatorMultiplier" && reward.target === genId) {
      mult = mult.mul(reward.multiplier);
    }
  }
  return mult;
}

/** Click multiplier from achievements. */
export function achievementClickMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const reward of allRewards(state)) {
    if (reward.type === "clickMultiplier") {
      mult = mult.mul(reward.multiplier);
    }
  }
  return mult;
}

/** IP gain multiplier from achievements. */
export function achievementIPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const reward of allRewards(state)) {
    if (reward.type === "ipGainMultiplier") {
      mult = mult.mul(reward.multiplier);
    }
  }
  return mult;
}

/** BP gain multiplier from achievements. */
export function achievementBPGainMultiplier(state: GameState): Decimal {
  let mult = new Decimal(1);
  for (const reward of allRewards(state)) {
    if (reward.type === "bpGainMultiplier") {
      mult = mult.mul(reward.multiplier);
    }
  }
  return mult;
}

/** Offline efficiency bonus from achievements. */
export function achievementOfflineBonus(state: GameState): number {
  let bonus = 0;
  for (const reward of allRewards(state)) {
    if (reward.type === "offlineEfficiencyBonus") {
      bonus += reward.bonus;
    }
  }
  return bonus;
}
