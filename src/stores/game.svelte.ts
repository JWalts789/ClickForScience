import { Decimal } from "../lib/utils/decimal";
import { createInitialState, type GameState } from "../lib/engine/state";
import { gameTick } from "../lib/engine/tick";
import { handleClick, purchaseGenerator, purchaseUpgrade, doPrestige as enginePrestige, purchasePrestigeUpgrade, getLastCompletedChallenge } from "../lib/engine/actions";
import { saveGame, loadGame, exportSave, importSave, deleteSave, deserializeState } from "../lib/engine/save";
import { calculateOfflineProgress, applyOfflineProgress } from "../lib/engine/offline";
import { totalProduction, clickValue, breakthroughPointsOnPrestige } from "../lib/engine/formulas";
import { ipPerSecond, startResearch, cancelResearch, isResearchAvailable, isResearchComplete, isResearchVisible } from "../lib/engine/research";
export { isResearchComplete } from "../lib/engine/research";
import { getResearchNodeDef } from "../lib/data/research.data";
import { checkAchievements } from "../lib/engine/achievements";
import { TICKER_HEADLINES, TICKER_POOLS } from "../lib/data/ticker.data";
import { GENERATORS, MILESTONES } from "../lib/data/generators.data";
import { LAB_NOTES } from "../lib/data/notes.data";
import type { NoteTrigger } from "../lib/data/notes.data";
import { findTriggeredEvent, applyEventChoice } from "../lib/engine/events";
import { canSpecialize, activateSpecialization, purchaseSpecGenerator, purchaseSpecUpgrade } from "../lib/engine/specialization";
export { canSpecialize } from "../lib/engine/specialization";
import { purchaseLabExpansion } from "../lib/engine/lab-expansion";
import { labLevelName } from "../lib/data/lab-expansions.data";
import { abandonChallenge as engineAbandonChallenge } from "../lib/engine/challenges";
import { getChallengeDef } from "../lib/data/challenges.data";
import { doFavor as engineDoFavor } from "../lib/engine/neighborhood";
import { getNPCDef } from "../lib/data/neighborhood.data";
import { doAscension as engineAscension, purchaseAscensionUpgrade, thesisPointsOnAscension } from "../lib/engine/ascension";
import { getAscensionUpgradeDef } from "../lib/data/ascension.data";
import { queueTicker, showToast, getActiveEvent, showEvent, dismissEvent } from "./ui.svelte";
import { getActiveSeasonalContent } from "../lib/data/seasonal.data";

// ── Reactive State ──────────────────────────────────────────────────
// We use $state.raw because Decimal objects break under Svelte's deep proxy.
// Instead, we bump a revision counter to trigger UI re-reads.

let state = $state.raw<GameState>(createInitialState());
let revision = $state(0);

function notify() {
  revision++;
  // Create a new reference so $derived(getState()) propagates.
  // $state.raw uses referential equality — same object = no update.
  // Shallow spread is safe: nested objects (generators, etc.) are shared refs.
  state = { ...state } as GameState;
}

// ── Getters (call inside $derived to track changes) ─────────────────

export function getState(): GameState {
  // Reading `revision` inside a $derived context subscribes to changes
  void revision;
  return state;
}

/**
 * Returns the current revision counter. Components should read this
 * inside $derived to subscribe to state changes, since $state.raw
 * returns the same object reference and Svelte may skip re-renders.
 */
export function getRevision(): number {
  return revision;
}

export function getRPPerSec() {
  void revision;
  return totalProduction(state);
}

export function getClickValue() {
  void revision;
  return clickValue(state);
}

export function getPendingBP() {
  void revision;
  return breakthroughPointsOnPrestige(state);
}

export function getIPPerSec() {
  void revision;
  return ipPerSecond(state);
}

// ── Actions ─────────────────────────────────────────────────────────

export function doClick(): void {
  handleClick(state);
  checkTickerTriggers();
  checkPoolTickers();
  checkNoteUnlocks();
  checkEvents();
  checkAchievementUnlocks();
  notify();
}

export function buyGenerator(id: string, amount: number): void {
  purchaseGenerator(state, id, amount);
  checkTickerTriggers();
  checkPoolTickers();
  checkNoteUnlocks();
  checkEvents();
  notify();
}

export function buyUpgrade(id: string): boolean {
  const success = purchaseUpgrade(state, id);
  if (success) {
    checkTickerTriggers();
  checkPoolTickers();
    checkEvents();
    notify();
  }
  return success;
}

export function doPrestigeAction(): Decimal | null {
  const result = enginePrestige(state);
  if (result) {
    // Check if a challenge was completed during this prestige
    const completedId = getLastCompletedChallenge();
    if (completedId) {
      const cDef = getChallengeDef(completedId);
      if (cDef) {
        showToast(`Challenge Complete: ${cDef.name}!`, 5000);
        queueTicker(`CHALLENGE COMPLETE: "${cDef.name}" — ${cDef.rewardDescription}. Gary adds another trophy to the shelf.`);
      }
    }

    // Reset pool milestones so generators re-trigger fresh headlines
    firedPoolMilestones.clear();
    checkTickerTriggers();
    checkPoolTickers();
    checkEvents();
    notify();
  }
  return result;
}

export function buyPrestigeUpgrade(id: string): boolean {
  const success = purchasePrestigeUpgrade(state, id);
  if (success) {
    checkTickerTriggers();
  checkPoolTickers();
    notify();
  }
  return success;
}

export function doStartResearch(nodeId: string): boolean {
  const success = startResearch(state, nodeId);
  if (success) {
    notify();
  }
  return success;
}

export function doCancelResearch(): boolean {
  const success = cancelResearch(state);
  if (success) {
    notify();
  }
  return success;
}

// ── Auto-Buyer Actions ──────────────────────────────────────────────

export function toggleAutobuyer(genId: string): void {
  state.autobuyers.enabled[genId] = !state.autobuyers.enabled[genId];
  notify();
}

export function setAutobuyerReserve(percent: number): void {
  state.autobuyers.reservePercent = Math.max(0, Math.min(100, percent));
  notify();
}

export function toggleAllAutobuyers(enabled: boolean): void {
  for (const gen of GENERATORS) {
    state.autobuyers.enabled[gen.id] = enabled;
  }
  notify();
}

// ── Specialization Actions ───────────────────────────────────────────

export function doSpecialize(): boolean {
  const success = activateSpecialization(state);
  if (success) {
    const arch = state.specialization.archetype!;
    const name = arch.charAt(0).toUpperCase() + arch.slice(1);
    showToast(`Specialized as ${name}!`, 4000);
    queueTicker(`SPECIALIZATION ACTIVATED: Gary has embraced the ${name} path. There's no going back. (Until prestige.)`);
    notify();
  }
  return success;
}

export function buySpecGenerator(amount: number): boolean {
  const success = purchaseSpecGenerator(state, amount);
  if (success) notify();
  return success;
}

export function buySpecUpgrade(upgradeId: string): boolean {
  const success = purchaseSpecUpgrade(state, upgradeId);
  if (success) {
    notify();
  }
  return success;
}

// ── Lab Expansion Actions ───────────────────────────────────────────

export function doLabExpansion(): boolean {
  const oldLevel = state.labLevel;
  const success = purchaseLabExpansion(state);
  if (success) {
    const name = labLevelName(state.labLevel);
    showToast(`Lab expanded: ${name}!`, 5000);
    queueTicker(`LAB EXPANSION: Gary has expanded to ${name}. The neighbors have questions.`);
    notify();
  }
  return success;
}

// ── Ascension Actions ──────────────────────────────────────────────

export function getPendingTP() {
  void revision;
  return thesisPointsOnAscension(state);
}

export function doAscensionAction(): Decimal | null {
  const result = engineAscension(state);
  if (result) {
    showToast(`Ascended! Earned ${result.toFixed(0)} Thesis Points.`, 5000);
    queueTicker(`ASCENSION COMPLETE: Gary's thesis has been accepted. By the universe itself.`);
    firedPoolMilestones.clear();
    firedHeadlines.clear();
    notify();
  }
  return result;
}

export function buyAscensionUpgrade(id: string): boolean {
  const success = purchaseAscensionUpgrade(state, id);
  if (success) {
    const def = getAscensionUpgradeDef(id);
    if (def) {
      showToast(`Ascension upgrade: ${def.name}`, 3000);
    }
    notify();
  }
  return success;
}

// ── Neighborhood Actions ───────────────────────────────────────────

export function doNeighborhoodFavor(npcId: string, favorId: string): boolean {
  const success = engineDoFavor(state, npcId, favorId);
  if (success) {
    const npc = getNPCDef(npcId);
    const level = state.relationships[npcId] ?? 0;
    if (npc) {
      showToast(`${npc.name}: Relationship +1 (Level ${level})`, 3000);
    }
    notify();
  }
  return success;
}

// ── Challenge Run Actions ───────────────────────────────────────────

export function doStartChallenge(challengeId: string): boolean {
  // Validate first (before resetting)
  const cDef = getChallengeDef(challengeId);
  if (!cDef) return false;
  if (state.activeChallenge !== null) return false;
  if (state.completedChallenges.includes(challengeId)) return false;
  if (state.labLevel < cDef.requiredLabLevel) return false;

  // Do a prestige-like reset (force it even if BP threshold not met)
  // Reset run-specific state
  state.rp = new Decimal(0);
  state.totalRPThisRun = new Decimal(0);
  state.currentRunTimeSec = 0;
  for (const gen of state.generators) {
    gen.owned = new Decimal(0);
    gen.totalProduced = new Decimal(0);
  }
  state.purchasedUpgrades = [];
  state.runCompletedResearch = [];
  state.activeResearch = null;
  state.activeBuffs = [];
  state.specialization = {
    archetype: null,
    generator: null,
    purchasedUpgrades: [],
    rpSpentOnGenerators: new Decimal(0),
    rpRecovered: new Decimal(0),
    peakRPPerSec: new Decimal(0),
  };

  // NOW set the challenge active
  state.activeChallenge = challengeId;

  showToast(`Challenge Started: ${cDef.name}`, 4000);
  queueTicker(`CHALLENGE ACCEPTED: "${cDef.name}" — ${cDef.description}`);
  firedPoolMilestones.clear();
  notify();
  return true;
}

export function doAbandonChallenge(): boolean {
  const challengeId = state.activeChallenge;
  const success = engineAbandonChallenge(state);
  if (success) {
    const cDef = challengeId ? getChallengeDef(challengeId) : null;
    showToast("Challenge abandoned", 3000);
    if (cDef) {
      queueTicker(`CHALLENGE ABANDONED: Gary gave up on "${cDef.name}." There's always next time.`);
    }
    notify();
  }
  return success;
}

let tickerCheckAccum = 0;

export function doTick(deltaSec: number): void {
  const completedNodeId = gameTick(state, deltaSec);

  // Research completion notification
  if (completedNodeId) {
    const def = getResearchNodeDef(completedNodeId);
    if (def) {
      showToast(`Research complete: ${def.name}`, 4000);
      queueTicker(`RESEARCH BREAKTHROUGH: ${def.name} — ${def.description}`);
    }
  }

  // Check ticker triggers once per second, not every frame
  tickerCheckAccum += deltaSec;
  if (tickerCheckAccum >= 1) {
    tickerCheckAccum = 0;
    checkTickerTriggers();
  checkPoolTickers();
    checkNoteUnlocks();
    checkEvents();
    checkAchievementUnlocks();
  }

  notify();
}

// ── Save/Load ───────────────────────────────────────────────────────

export function doSave(): void {
  saveGame(state);
}

export function doLoad(): string | null {
  const loaded = loadGame();
  if (loaded) {
    state = loaded;

    // Check for offline progress
    if (state.settings.offlineProgressEnabled) {
      const report = calculateOfflineProgress(state);
      if (report.rpGained.gt(0)) {
        applyOfflineProgress(state, report);
        // Update timestamp and save immediately to prevent double rewards on refresh
        state.lastSaveTimestamp = Date.now();
        saveGame(state);
        notify();
        return report.summary;
      }
    }
    notify();
  }
  return null;
}

export function doExport(): string {
  return exportSave(state);
}

export function doImport(encoded: string): boolean {
  const imported = importSave(encoded);
  if (imported) {
    state = imported;
    notify();
    return true;
  }
  return false;
}

/** Load from a raw JSON string (used by cloud save). */
export function doLoadFromString(raw: string): boolean {
  try {
    const loaded = deserializeState(raw);
    state = loaded;
    notify();
    return true;
  } catch (e) {
    console.error("Failed to load from string:", e);
    return false;
  }
}

export function doHardReset(): void {
  deleteSave();
  state = createInitialState();
  firedHeadlines.clear();
  notify();
}

// ── News Ticker Detection ────────────────────────────────────────────

const firedHeadlines = new Set<number>();

function checkTickerTriggers(): void {
  for (let i = 0; i < TICKER_HEADLINES.length; i++) {
    if (firedHeadlines.has(i)) continue;

    const h = TICKER_HEADLINES[i];
    const t = h.trigger;
    let triggered = false;

    if (t.type === "generatorMilestone") {
      const genIdx = GENERATORS.findIndex((g) => g.id === t.genId);
      if (genIdx !== -1) {
        triggered = state.generators[genIdx].owned.gte(t.count);
      }
    } else if (t.type === "clickCount") {
      triggered = state.clickCount.gte(t.count);
    } else if (t.type === "totalRPReached") {
      triggered = state.totalRPAllTime.gte(t.amount);
    } else if (t.type === "upgradePurchased") {
      triggered = state.purchasedUpgrades.includes(t.upgradeId);
    } else if (t.type === "prestigeCount") {
      triggered = state.prestigeCount >= t.count;
    } else if (t.type === "prestigeUpgradePurchased") {
      triggered = state.prestigeUpgrades.includes(t.upgradeId);
    } else if (t.type === "madnessLevel") {
      triggered = state.madness.madnessLevel >= t.level;
    } else if (t.type === "labLevel") {
      triggered = state.labLevel >= t.level;
    } else if (t.type === "ascensionCount") {
      triggered = state.ascensionCount >= t.count;
    } else if (t.type === "challengesCompleted") {
      triggered = state.completedChallenges.length >= t.count;
    } else if (t.type === "researchCompleted") {
      triggered = state.completedResearch.includes(t.nodeId) || state.runCompletedResearch.includes(t.nodeId);
    } else if (t.type === "relationshipLevel") {
      triggered = (state.relationships[t.npcId] ?? 0) >= t.level;
    }

    if (triggered) {
      firedHeadlines.add(i);
      // Check suppression rules before queuing
      if (!isHeadlineSuppressed(h)) {
        queueTicker(h.text);
      }
    }
  }
}

function isHeadlineSuppressed(h: (typeof TICKER_HEADLINES)[number]): boolean {
  if (!h.suppressIf) return false;
  const { eventId, choices } = h.suppressIf;
  const choiceMade = state.eventChoices[eventId];
  if (choiceMade == null) return false; // event not resolved yet
  if (!choices) return true; // any resolution suppresses
  return choices.includes(choiceMade);
}

/**
 * Pre-populate firedHeadlines for milestones already achieved,
 * so only NEW milestones trigger the ticker on this session.
 */
function snapshotCurrentHeadlines(): void {
  firedHeadlines.clear();
  for (let i = 0; i < TICKER_HEADLINES.length; i++) {
    const t = TICKER_HEADLINES[i].trigger;
    let already = false;

    if (t.type === "generatorMilestone") {
      const genIdx = GENERATORS.findIndex((g) => g.id === t.genId);
      if (genIdx !== -1) already = state.generators[genIdx].owned.gte(t.count);
    } else if (t.type === "clickCount") {
      already = state.clickCount.gte(t.count);
    } else if (t.type === "totalRPReached") {
      already = state.totalRPAllTime.gte(t.amount);
    } else if (t.type === "upgradePurchased") {
      already = state.purchasedUpgrades.includes(t.upgradeId);
    } else if (t.type === "prestigeCount") {
      already = state.prestigeCount >= t.count;
    } else if (t.type === "prestigeUpgradePurchased") {
      already = state.prestigeUpgrades.includes(t.upgradeId);
    } else if (t.type === "madnessLevel") {
      already = state.madness.madnessLevel >= t.level;
    } else if (t.type === "labLevel") {
      already = state.labLevel >= t.level;
    } else if (t.type === "ascensionCount") {
      already = state.ascensionCount >= t.count;
    } else if (t.type === "challengesCompleted") {
      already = state.completedChallenges.length >= t.count;
    } else if (t.type === "researchCompleted") {
      already = state.completedResearch.includes(t.nodeId) || state.runCompletedResearch.includes(t.nodeId);
    } else if (t.type === "relationshipLevel") {
      already = (state.relationships[t.npcId] ?? 0) >= t.level;
    }

    if (already) firedHeadlines.add(i);
  }
}

// ── Random Milestone Pool Tickers ───────────────────────────────────

// Track which milestone counts have already fired pool headlines per gen
// Key: "genId:count", so we fire exactly once per milestone crossing.
const firedPoolMilestones = new Set<string>();
// Track last headline index per generator to avoid back-to-back repeats
const lastPoolIndex: Record<string, number> = {};

function checkPoolTickers(): void {
  for (let genIdx = 0; genIdx < GENERATORS.length; genIdx++) {
    const gen = GENERATORS[genIdx];
    const pool = TICKER_POOLS[gen.id];
    if (!pool || pool.length === 0) continue;

    const owned = state.generators[genIdx].owned;
    for (const m of MILESTONES) {
      const key = `${gen.id}:${m.count}`;
      if (firedPoolMilestones.has(key)) continue;
      if (owned.gte(m.count)) {
        firedPoolMilestones.add(key);
        // Pick a random headline, avoiding the last one shown for this gen
        let idx = Math.floor(Math.random() * pool.length);
        if (pool.length > 1 && idx === lastPoolIndex[gen.id]) {
          idx = (idx + 1) % pool.length;
        }
        lastPoolIndex[gen.id] = idx;
        queueTicker(pool[idx]);
      }
    }
  }
}

function snapshotCurrentPoolMilestones(): void {
  firedPoolMilestones.clear();
  for (let genIdx = 0; genIdx < GENERATORS.length; genIdx++) {
    const gen = GENERATORS[genIdx];
    const owned = state.generators[genIdx].owned;
    for (const m of MILESTONES) {
      if (owned.gte(m.count)) {
        firedPoolMilestones.add(`${gen.id}:${m.count}`);
      }
    }
  }
}

// ── Lab Note Unlock Detection ────────────────────────────────────────

function isNoteTriggerMet(t: NoteTrigger): boolean {
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
  } else if (t.type === "researchCompleted" && t.nodeId) {
    return state.completedResearch.includes(t.nodeId) || state.runCompletedResearch.includes(t.nodeId);
  } else if (t.type === "relationshipLevel" && t.npcId && t.level != null) {
    return (state.relationships[t.npcId] ?? 0) >= t.level;
  }
  return false;
}

function checkNoteUnlocks(): void {
  let unlocked = false;
  for (const note of LAB_NOTES) {
    if (state.unlockedNotes.includes(note.id)) continue;
    if (isNoteTriggerMet(note.trigger)) {
      state.unlockedNotes.push(note.id);
      showToast(`New lab note: "${note.title}"`, 4000);
      unlocked = true;
    }
  }
  // No notify() here — callers already call notify() after checkNoteUnlocks()
}

// ── Event Detection & Resolution ─────────────────────────────────────

function checkEvents(): void {
  // Don't stack events — only show one at a time
  if (getActiveEvent() !== null) return;

  const event = findTriggeredEvent(state);
  if (event) {
    // Mark as triggered immediately so it won't re-fire on refresh
    // (choice is recorded later in resolveEvent via applyEventChoice)
    state.triggeredEvents.push(event.id);
    showEvent(event.id, event);
  }
}

export function resolveEvent(choiceIndex: number): void {
  const active = getActiveEvent();
  if (!active) return;

  const result = applyEventChoice(state, active.eventId, choiceIndex);

  // Process side effects
  for (const text of result.tickerTexts) {
    queueTicker(text);
  }
  if (result.toastMessage) {
    showToast(result.toastMessage, 3000);
  }

  dismissEvent();
  checkNoteUnlocks();
  notify();
}

// ── Achievement Detection ────────────────────────────────────────────

function checkAchievementUnlocks(): void {
  const newlyUnlocked = checkAchievements(state);
  for (const achievement of newlyUnlocked) {
    const tierEmoji = achievement.tier === "gold" ? "Gold" : achievement.tier === "silver" ? "Silver" : "Bronze";
    showToast(`Achievement: ${achievement.name} (${tierEmoji})`, 4000);
    queueTicker(`ACHIEVEMENT UNLOCKED: ${achievement.name} — ${achievement.rewardDescription}`);
  }
}

// ── Initialize ──────────────────────────────────────────────────────

// ── Seasonal Content ─────────────────────────────────────────────────

const firedSeasonalTickers = new Set<string>();

function checkSeasonalContent(): void {
  const active = getActiveSeasonalContent();
  for (const content of active) {
    // Queue one random seasonal ticker (if not already fired this session)
    if (!firedSeasonalTickers.has(content.id) && content.tickers.length > 0) {
      firedSeasonalTickers.add(content.id);
      const idx = Math.floor(Math.random() * content.tickers.length);
      queueTicker(content.tickers[idx]);
    }

    // Unlock seasonal note if it has one and it hasn't been unlocked yet
    if (content.note) {
      const noteId = `seasonal_${content.id}`;
      if (!state.unlockedNotes.includes(noteId)) {
        state.unlockedNotes.push(noteId);
        showToast(`Seasonal note: "${content.note.title}"`, 4000);
      }
    }
  }
}

export function initGame(): string | null {
  const report = doLoad();
  snapshotCurrentHeadlines();
  snapshotCurrentPoolMilestones();
  checkSeasonalContent();
  return report;
}
