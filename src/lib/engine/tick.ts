import type { GameState, TimedBuff } from "./state";
import { totalProduction, generatorProduction, generatorCost, tickBuffs } from "./formulas";
import { GENERATORS } from "../data/generators.data";
import { ipPerSecond, tickResearch, isResearchComplete } from "./research";
import { purchaseGenerator, handleClick } from "./actions";
import { specGeneratorProduction } from "./specialization";
import { isGeneratorAllowed, isGeneratorCapReached, isTimeLimitExceeded, abandonChallenge } from "./challenges";
import { neighborhoodAutoClickRate, neighborhoodFreeIPPerSec } from "./neighborhood";
import { ascensionAutobuyerSpeed } from "./ascension";
import { Decimal } from "../utils/decimal";

// ── Auto-Buyer Logic ──────────────────────────────────────────────

let autobuyerAccum = 0;

/**
 * Run auto-buyers: buy 1 of each enabled generator per tick.
 * Respects reserve threshold. Gadgeteer archetype runs 3x faster.
 * Perfectionist buys in order of best production/cost ratio.
 */
function tickAutobuyers(state: GameState, deltaSec: number): void {
  // Must have the research unlocked
  if (!isResearchComplete(state, "autobuyer_protocol")) return;

  // Gadgeteer runs 3x faster (tick every 0.33s vs 1s), ascension may speed up further
  const ascSpeedMult = ascensionAutobuyerSpeed(state);
  const baseInterval = state.madness.dominantArchetype === "gadgeteer" ? 0.33 : 1;
  const tickInterval = baseInterval / ascSpeedMult;
  autobuyerAccum += deltaSec;
  if (autobuyerAccum < tickInterval) return;
  autobuyerAccum = 0;

  // Build list of enabled generators (respecting challenge restrictions)
  const enabledGens: number[] = [];
  for (let i = 0; i < GENERATORS.length; i++) {
    const genId = GENERATORS[i].id;
    if (state.autobuyers.enabled[genId] && isGeneratorAllowed(state, genId) && !isGeneratorCapReached(state, genId, state.generators[i].owned)) {
      enabledGens.push(i);
    }
  }
  if (enabledGens.length === 0) return;

  // Perfectionist: sort by efficiency (production per cost, descending)
  if (state.madness.dominantArchetype === "perfectionist") {
    enabledGens.sort((a, b) => {
      const prodA = generatorProduction(state, a);
      const costA = generatorCost(GENERATORS[a], state.generators[a].owned);
      const prodB = generatorProduction(state, b);
      const costB = generatorCost(GENERATORS[b], state.generators[b].owned);
      // Higher ratio = better efficiency = should come first
      const ratioA = costA.gt(0) ? prodA.div(costA) : new Decimal(0);
      const ratioB = costB.gt(0) ? prodB.div(costB) : new Decimal(0);
      return ratioB.cmp(ratioA);
    });
  }

  // Calculate reserve floor
  const reserveFloor = state.rp.mul(state.autobuyers.reservePercent / 100);

  // Buy 1 of each enabled generator (respecting reserve)
  for (const genIdx of enabledGens) {
    const cost = generatorCost(GENERATORS[genIdx], state.generators[genIdx].owned);
    // Only buy if RP after purchase stays above reserve floor
    if (state.rp.sub(cost).gte(reserveFloor)) {
      purchaseGenerator(state, GENERATORS[genIdx].id, 1);
    }
  }
}

// ── Specialization Passive Ticking ────────────────────────────────

let autoClickAccum = 0;
let chaosSpikeTimer = 0;
let chaosSpikeInterval = 60; // seconds until next spike

/** Tick specialization passive abilities. */
function tickSpecPassives(state: GameState, deltaSec: number, rpPerSec: Decimal): void {
  const arch = state.specialization.archetype;
  if (!arch) return;

  // Unhinged: Chaos Spikes — random 2-5x production for 3-8 seconds
  if (arch === "unhinged") {
    chaosSpikeTimer += deltaSec;
    if (chaosSpikeTimer >= chaosSpikeInterval) {
      chaosSpikeTimer = 0;
      chaosSpikeInterval = 30 + Math.random() * 60; // 30-90s
      const multiplier = 2 + Math.random() * 3; // 2-5x
      const duration = 3 + Math.random() * 5; // 3-8s
      const spike: TimedBuff = {
        id: "chaos_spike",
        multiplier: new Decimal(multiplier),
        target: "all",
        remainingSeconds: duration,
      };
      // Remove old spike if still active, add new one
      state.activeBuffs = state.activeBuffs.filter((b) => b.id !== "chaos_spike");
      state.activeBuffs.push(spike);
    }
  }

  // Reality Breaker: Dimensional Bleed — 5% chance/sec of 10x for 5s
  if (arch === "realityBreaker") {
    // Check once per second (scaled by deltaSec for frame independence)
    if (Math.random() < 0.05 * deltaSec) {
      const rift: TimedBuff = {
        id: "dimensional_bleed",
        multiplier: new Decimal(10),
        target: "all",
        remainingSeconds: 5,
      };
      state.activeBuffs = state.activeBuffs.filter((b) => b.id !== "dimensional_bleed");
      state.activeBuffs.push(rift);
    }
  }

  // Accidental Genius: RP Recovery — 1% of spent RP returns over time
  if (arch === "accidentalGenius") {
    const totalToRecover = state.specialization.rpSpentOnGenerators.mul(0.01);
    const remaining = totalToRecover.sub(state.specialization.rpRecovered);
    if (remaining.gt(0)) {
      // Recover over ~60 seconds
      const recoveryRate = totalToRecover.div(60);
      const recovered = Decimal.min(remaining, recoveryRate.mul(deltaSec));
      state.rp = state.rp.add(recovered);
      state.specialization.rpRecovered = state.specialization.rpRecovered.add(recovered);
    }
  }

  // Perfectionist ramp and Megalomaniac cascade are handled in formulas.ts
  // Gadgeteer cost discount is handled in formulas.ts
}

/**
 * Advance the game state by `deltaSec` seconds.
 * Pure logic — no side effects, no DOM, no framework deps.
 *
 * Returns the ID of a research node that just completed (or null).
 */
export function gameTick(state: GameState, deltaSec: number): string | null {
  // 1. Calculate and add RP from generators
  const rpPerSec = totalProduction(state);
  const rpGained = rpPerSec.mul(deltaSec);

  state.rp = state.rp.add(rpGained);
  state.totalRPThisRun = state.totalRPThisRun.add(rpGained);
  state.totalRPAllTime = state.totalRPAllTime.add(rpGained);

  // 2. Track per-generator production (uses full pipeline, not just base)
  for (let i = 0; i < GENERATORS.length; i++) {
    const genState = state.generators[i];
    if (genState && genState.owned.gt(0)) {
      const produced = generatorProduction(state, i).mul(deltaSec);
      genState.totalProduced = genState.totalProduced.add(produced);
    }
  }

  // 3. Accumulate Insight Points (IP)
  const ipGained = ipPerSecond(state).mul(deltaSec);
  state.ip = state.ip.add(ipGained);
  state.totalIPAllTime = state.totalIPAllTime.add(ipGained);

  // 4. Tick active research
  const completedResearch = tickResearch(state, deltaSec);

  // 5. Tick down active buffs
  state.activeBuffs = tickBuffs(state.activeBuffs, deltaSec);

  // 6. Auto-buyers
  tickAutobuyers(state, deltaSec);

  // 7. Specialization passive abilities
  tickSpecPassives(state, deltaSec, rpPerSec);

  // 8. Track specialization generator production
  if (state.specialization.generator && state.specialization.generator.owned.gt(0)) {
    const specProd = specGeneratorProduction(state).mul(deltaSec);
    state.specialization.generator.totalProduced = state.specialization.generator.totalProduced.add(specProd);
  }

  // 9. Track peak RP/sec for Unhinged prestige mod
  if (state.specialization.archetype === "unhinged") {
    if (rpPerSec.gt(state.specialization.peakRPPerSec)) {
      state.specialization.peakRPPerSec = rpPerSec;
    }
  }

  // 10. Neighborhood bonuses: free IP/sec and auto-click
  const freeIP = neighborhoodFreeIPPerSec(state) * deltaSec;
  if (freeIP > 0) {
    state.ip = state.ip.add(freeIP);
    state.totalIPAllTime = state.totalIPAllTime.add(freeIP);
  }

  autoClickAccum += deltaSec;
  const autoClickRate = neighborhoodAutoClickRate(state);
  if (autoClickRate > 0 && autoClickAccum >= 1 / autoClickRate) {
    autoClickAccum = 0;
    handleClick(state);
  }

  // 11. Update timing
  state.totalPlaytimeSec += deltaSec;
  state.currentRunTimeSec += deltaSec;

  // 12. Auto-fail timed challenges
  if (state.activeChallenge && isTimeLimitExceeded(state)) {
    abandonChallenge(state);
  }

  return completedResearch;
}
