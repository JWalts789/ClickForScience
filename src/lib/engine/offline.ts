import { Decimal } from "../utils/decimal";
import type { GameState } from "./state";
import { totalProduction, prestigeOfflineBonus, archetypeOfflineBonus } from "./formulas";
import { ipPerSecond, tickResearch } from "./research";
import { formatNumber } from "../utils/format";
import { formatTime } from "../utils/time";

/** Maximum offline time credited (24 hours). */
const MAX_OFFLINE_SEC = 24 * 60 * 60;

/** Base offline efficiency (50%). Upgradeable via prestige. */
const BASE_OFFLINE_EFFICIENCY = 0.5;

export interface OfflineReport {
  rpGained: Decimal;
  ipGained: Decimal;
  elapsedSec: number;
  efficiency: number;
  summary: string;
}

/**
 * Get the player's offline efficiency multiplier (0-1).
 * Base 0.5, increased by prestige upgrades.
 */
function getOfflineEfficiency(state: GameState): number {
  let eff = BASE_OFFLINE_EFFICIENCY;
  eff += prestigeOfflineBonus(state);
  eff += archetypeOfflineBonus(state);
  return Math.min(eff, 1);
}

/**
 * Calculate what the player earned while away.
 * Uses analytical approach (rate * time * efficiency).
 */
export function calculateOfflineProgress(state: GameState): OfflineReport {
  const now = Date.now();
  const elapsedMs = now - state.lastSaveTimestamp;
  const elapsedSec = Math.min(elapsedMs / 1000, MAX_OFFLINE_SEC);

  if (elapsedSec < 10) {
    return {
      rpGained: new Decimal(0),
      ipGained: new Decimal(0),
      elapsedSec: 0,
      efficiency: 0,
      summary: "",
    };
  }

  const efficiency = getOfflineEfficiency(state);
  const rpPerSec = totalProduction(state);
  const rpGained = rpPerSec.mul(elapsedSec).mul(efficiency);

  // IP also accumulates offline (at full rate — it's a meta currency)
  const ipRate = ipPerSecond(state);
  const ipGained = ipRate.mul(elapsedSec);

  const notation = state.settings.notation;
  let summary =
    `While you were away (${formatTime(elapsedSec)}), ` +
    `your lab produced ${formatNumber(rpGained, notation)} RP ` +
    `at ${(efficiency * 100).toFixed(0)}% efficiency.`;
  if (ipGained.gt(0)) {
    summary += ` You also gained ${formatNumber(ipGained, notation)} Insight Points.`;
  }

  return { rpGained, ipGained, elapsedSec, efficiency, summary };
}

/**
 * Apply offline progress to the game state.
 */
export function applyOfflineProgress(state: GameState, report: OfflineReport): void {
  if (report.rpGained.gt(0)) {
    state.rp = state.rp.add(report.rpGained);
    state.totalRPThisRun = state.totalRPThisRun.add(report.rpGained);
    state.totalRPAllTime = state.totalRPAllTime.add(report.rpGained);
  }
  if (report.ipGained.gt(0)) {
    state.ip = state.ip.add(report.ipGained);
    state.totalIPAllTime = state.totalIPAllTime.add(report.ipGained);
  }
  // Advance active research by offline time
  if (report.elapsedSec > 0 && state.activeResearch) {
    tickResearch(state, report.elapsedSec);
  }
}
