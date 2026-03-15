import { Decimal } from "../utils/decimal";
import type { GameState, MadnessArchetype } from "./state";
import { GENERATORS } from "../data/generators.data";
import { EVENTS, type EventDef } from "../data/events.data";
import { totalProduction } from "./formulas";
import { recalculateMadness } from "./madness";

// ── Trigger Evaluation ──────────────────────────────────────────────

function isEventTriggerMet(trigger: EventDef["trigger"], state: GameState): boolean {
  const t = trigger;

  if (t.type === "generatorOwned" && t.genId && t.count != null) {
    const genIdx = GENERATORS.findIndex((g) => g.id === t.genId);
    if (genIdx !== -1) return state.generators[genIdx].owned.gte(t.count);
  } else if (t.type === "upgradeOwned" && t.upgradeId) {
    return state.purchasedUpgrades.includes(t.upgradeId);
  } else if (t.type === "prestigeCount" && t.count != null) {
    return state.prestigeCount >= t.count;
  } else if (t.type === "madnessLevel" && t.level != null) {
    return state.madness.madnessLevel >= t.level;
  } else if (t.type === "dominantArchetype" && t.archetype) {
    return state.madness.dominantArchetype === t.archetype;
  } else if (t.type === "totalRPAllTime" && t.amount != null) {
    return state.totalRPAllTime.gte(t.amount);
  } else if (t.type === "clickCount" && t.count != null) {
    return state.clickCount.gte(t.count);
  } else if (t.type === "generatorCount" && t.count != null) {
    let distinct = 0;
    for (const gen of state.generators) {
      if (gen.owned.gt(0)) distinct++;
    }
    return distinct >= t.count;
  } else if (t.type === "labLevel" && t.level != null) {
    return state.labLevel >= t.level;
  } else if (t.type === "ascensionCount" && t.count != null) {
    return state.ascensionCount >= t.count;
  } else if (t.type === "challengesCompleted" && t.count != null) {
    return state.completedChallenges.length >= t.count;
  }

  return false;
}

// ── Find Triggered Event ────────────────────────────────────────────

/**
 * Returns the first event whose trigger is met and hasn't been triggered yet.
 * Returns null if no event is ready.
 */
export function findTriggeredEvent(state: GameState): EventDef | null {
  for (const event of EVENTS) {
    // Skip already triggered
    if (state.triggeredEvents.includes(event.id)) continue;

    // Check optional prerequisites
    if (event.requiresArchetype && state.madness.dominantArchetype !== event.requiresArchetype) continue;
    if (event.requiresMadnessLevel != null && state.madness.madnessLevel < event.requiresMadnessLevel) continue;

    // Check trigger condition
    if (isEventTriggerMet(event.trigger, state)) {
      return event;
    }
  }
  return null;
}

// ── Outcome Application ─────────────────────────────────────────────

export interface EventResult {
  tickerTexts: string[];
  toastMessage: string;
}

/**
 * Apply the outcomes of a player's event choice.
 * Mutates state directly; returns side-effect data for the UI layer.
 */
export function applyEventChoice(
  state: GameState,
  eventId: string,
  choiceIndex: number
): EventResult {
  const event = EVENTS.find((e) => e.id === eventId);
  if (!event) return { tickerTexts: [], toastMessage: "" };

  const choice = event.choices[choiceIndex];
  if (!choice) return { tickerTexts: [], toastMessage: "" };

  const result: EventResult = {
    tickerTexts: [],
    toastMessage: `Event resolved: ${event.title}`,
  };

  for (const outcome of choice.outcomes) {
    switch (outcome.type) {
      case "rpBonus": {
        const bonus = new Decimal(outcome.amount);
        state.rp = state.rp.add(bonus);
        state.totalRPThisRun = state.totalRPThisRun.add(bonus);
        state.totalRPAllTime = state.totalRPAllTime.add(bonus);
        break;
      }

      case "rpMultSeconds": {
        const rpPerSec = totalProduction(state);
        const bonus = rpPerSec.mul(outcome.seconds);
        state.rp = state.rp.add(bonus);
        state.totalRPThisRun = state.totalRPThisRun.add(bonus);
        state.totalRPAllTime = state.totalRPAllTime.add(bonus);
        break;
      }

      case "productionBuff": {
        state.activeBuffs.push({
          id: `event_${eventId}_${outcome.target}`,
          multiplier: new Decimal(outcome.multiplier),
          target: outcome.target,
          remainingSeconds: outcome.durationSec,
        });
        break;
      }

      case "clickBuff": {
        state.activeBuffs.push({
          id: `event_${eventId}_click`,
          multiplier: new Decimal(outcome.multiplier),
          target: "click",
          remainingSeconds: outcome.durationSec,
        });
        break;
      }

      case "madnessAffinity": {
        const arch = outcome.archetype as MadnessArchetype;
        state.madness.affinities[arch] = Math.max(
          0,
          state.madness.affinities[arch] + outcome.points
        );
        break;
      }

      case "unlockNote": {
        if (!state.unlockedNotes.includes(outcome.noteId)) {
          state.unlockedNotes.push(outcome.noteId);
        }
        break;
      }

      case "queueTicker": {
        result.tickerTexts.push(outcome.text);
        break;
      }

      case "rpCost": {
        const cost = state.rp.mul(outcome.percent / 100);
        state.rp = state.rp.sub(cost);
        if (state.rp.lt(0)) state.rp = new Decimal(0);
        break;
      }
    }
  }

  // Recalculate madness after all affinity changes
  recalculateMadness(state);

  // Mark event as triggered (if not already) and record which choice was made
  if (!state.triggeredEvents.includes(eventId)) {
    state.triggeredEvents.push(eventId);
  }
  state.eventChoices[eventId] = choiceIndex;

  return result;
}
