// ── UI-Only State (not saved) ───────────────────────────────────────

export type GameTab =
  | "generators"
  | "upgrades"
  | "research"
  | "prestige"
  | "neighborhood"
  | "achievements"
  | "journal"
  | "leaderboard"
  | "stats"
  | "settings";

let activeTab = $state<GameTab>("generators");
let buyAmount = $state<number>(1);
let offlineMessage = $state<string | null>(null);
let toastMessage = $state<string | null>(null);
let toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

export function getActiveTab(): GameTab {
  return activeTab;
}

export function setActiveTab(tab: GameTab): void {
  activeTab = tab;
}

export function getBuyAmount(): number {
  return buyAmount;
}

export function setBuyAmount(amount: number): void {
  buyAmount = amount;
}

export function getOfflineMessage(): string | null {
  return offlineMessage;
}

export function setOfflineMessage(msg: string | null): void {
  offlineMessage = msg;
}

export function showToast(message: string, durationMs: number = 3000): void {
  if (toastTimeoutId) clearTimeout(toastTimeoutId);
  toastMessage = message;
  toastTimeoutId = setTimeout(() => {
    toastMessage = null;
    toastTimeoutId = null;
  }, durationMs);
}

export function getToastMessage(): string | null {
  return toastMessage;
}

// ── Autosave Flash ──────────────────────────────────────────────────

let saveFlashActive = $state(false);
let saveFlashTimer: ReturnType<typeof setTimeout> | null = null;

export function flashSaveIndicator(): void {
  if (saveFlashTimer) clearTimeout(saveFlashTimer);
  saveFlashActive = true;
  saveFlashTimer = setTimeout(() => {
    saveFlashActive = false;
    saveFlashTimer = null;
  }, 1500);
}

export function getLastSaveFlash(): boolean {
  return saveFlashActive;
}

// ── Event Modal ─────────────────────────────────────────────────────

import type { EventDef } from "../lib/data/events.data";

interface ActiveEvent {
  eventId: string;
  def: EventDef;
}

let activeEvent = $state<ActiveEvent | null>(null);

export function getActiveEvent(): ActiveEvent | null {
  return activeEvent;
}

export function showEvent(eventId: string, def: EventDef): void {
  activeEvent = { eventId, def };
}

export function dismissEvent(): void {
  activeEvent = null;
}

// ── News Ticker ──────────────────────────────────────────────────────

// Use plain arrays (not $state) for the internal queue to avoid
// reactivity issues inside setTimeout callbacks.
let pendingQueue: string[] = [];
let batchShowing = false;
let tickerTimeoutId: ReturnType<typeof setTimeout> | null = null;
let tickerDebounceId: ReturnType<typeof setTimeout> | null = null;

// The only $state — what the component reads.
let activeTickerBatch: string[] = $state([]);
let activeTickerDuration: number = $state(0);

/** Duration per headline in a batch (ms). */
const PER_HEADLINE_MS = 14000;
/** Minimum duration for a single headline (ms). */
const MIN_TICKER_MS = 20000;

export function queueTicker(headline: string): void {
  pendingQueue.push(headline);
  // Debounce: collect all headlines queued in the same frame/tick,
  // then flush them as one batch.
  if (tickerDebounceId) clearTimeout(tickerDebounceId);
  tickerDebounceId = setTimeout(tryFlush, 50);
}

function tryFlush(): void {
  tickerDebounceId = null;
  if (!batchShowing) flushTickerBatch();
}

function flushTickerBatch(): void {
  if (pendingQueue.length === 0) {
    activeTickerBatch = [];
    activeTickerDuration = 0;
    batchShowing = false;
    return;
  }
  // Grab everything in the pending queue as one batch
  const batch = pendingQueue.splice(0);
  const duration = Math.max(MIN_TICKER_MS, batch.length * PER_HEADLINE_MS);

  // Push to reactive state so component picks it up
  activeTickerBatch = batch;
  activeTickerDuration = duration / 1000;
  batchShowing = true;

  if (tickerTimeoutId) clearTimeout(tickerTimeoutId);
  tickerTimeoutId = setTimeout(() => {
    tickerTimeoutId = null;
    batchShowing = false;
    activeTickerBatch = [];
    activeTickerDuration = 0;
    // Check if more headlines arrived while batch was showing
    if (pendingQueue.length > 0) flushTickerBatch();
  }, duration);
}

export function getActiveTickerBatch(): string[] {
  return activeTickerBatch;
}

/** Duration of the current batch in seconds (for CSS animation). */
export function getTickerDuration(): number {
  return activeTickerDuration;
}

// Keep the old API as a convenience (returns first headline or null)
export function getActiveTicker(): string | null {
  return activeTickerBatch.length > 0 ? activeTickerBatch[0] : null;
}
