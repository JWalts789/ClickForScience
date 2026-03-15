<script lang="ts">
  import { getState, getRevision } from "../../stores/game.svelte";
  import { hasPlayerName, getPlayerName, getPlayerId } from "../../lib/leaderboard/identity";
  import { fetchLeaderboard, submitScore, isLeaderboardAvailable } from "../../lib/leaderboard/client";
  import {
    LEADERBOARD_CATEGORIES,
    type LeaderboardCategory,
    type LeaderboardTimeframe,
    type LeaderboardEntry,
  } from "../../lib/leaderboard/types";
  import { formatRP, formatNumber } from "../../lib/utils/format";
  import { formatTime } from "../../lib/utils/time";
  import { Decimal } from "../../lib/utils/decimal";
  import NamePrompt from "../shared/NamePrompt.svelte";

  const state = $derived(getState());
  const rev = $derived(getRevision());
  const available = isLeaderboardAvailable();

  let showNamePrompt = $state(!hasPlayerName());
  let activeCategory = $state<LeaderboardCategory>("totalRPAllTime");
  let activeTimeframe = $state<LeaderboardTimeframe>("allTime");
  let entries = $state<LeaderboardEntry[]>([]);
  let playerRank = $state<number | null>(null);
  let totalEntries = $state(0);
  let loading = $state(false);
  let submitting = $state(false);
  let lastError = $state("");
  let lastSuccess = $state("");
  let lastFetchKey = $state("");

  const playerId = getPlayerId();
  const notation = $derived(state.settings.notation);

  // Auto-fetch when category or timeframe changes
  $effect(() => {
    const key = `${activeCategory}:${activeTimeframe}`;
    if (key !== lastFetchKey && available) {
      lastFetchKey = key;
      doFetch();
    }
  });

  async function doFetch() {
    loading = true;
    lastError = "";
    try {
      const result = await fetchLeaderboard(activeCategory, activeTimeframe);
      entries = result.entries;
      playerRank = result.playerRank;
      totalEntries = result.totalEntries;
    } catch (e) {
      lastError = "Failed to load leaderboard.";
    }
    loading = false;
  }

  function getPlayerValue(cat: LeaderboardCategory): { value: number; mantissa: number; exponent: number } {
    void rev;
    switch (cat) {
      case "totalRPAllTime": {
        const d = state.totalRPAllTime;
        return { value: d.toNumber(), mantissa: d.mantissa, exponent: d.exponent };
      }
      case "fastestPrestige":
        return { value: state.fastestPrestigeSec ?? Infinity, mantissa: state.fastestPrestigeSec ?? Infinity, exponent: 0 };
      case "ascensionCount":
        return { value: state.ascensionCount, mantissa: state.ascensionCount, exponent: 0 };
      case "madnessLevel":
        return { value: state.madness.madnessLevel, mantissa: state.madness.madnessLevel, exponent: 0 };
      case "challengesCompleted":
        return { value: state.completedChallenges.length, mantissa: state.completedChallenges.length, exponent: 0 };
      case "clickCount": {
        const d = state.clickCount;
        return { value: d.toNumber(), mantissa: d.mantissa, exponent: d.exponent };
      }
    }
  }

  async function onSubmit() {
    if (!hasPlayerName()) {
      showNamePrompt = true;
      return;
    }
    submitting = true;
    lastError = "";
    lastSuccess = "";

    const pv = getPlayerValue(activeCategory);
    const result = await submitScore(
      activeCategory,
      pv.value,
      pv.mantissa,
      pv.exponent,
      state.madness.dominantArchetype,
      state.totalPlaytimeSec,
      state.prestigeCount
    );

    if (result.success) {
      lastSuccess = "Score submitted!";
      await doFetch();
    } else {
      lastError = result.error ?? "Submission failed.";
    }
    submitting = false;
  }

  async function onSubmitAll() {
    if (!hasPlayerName()) {
      showNamePrompt = true;
      return;
    }
    submitting = true;
    lastError = "";
    lastSuccess = "";

    let successes = 0;
    for (const cat of LEADERBOARD_CATEGORIES) {
      const pv = getPlayerValue(cat.id);
      // Skip categories where player has no meaningful value
      if (cat.id === "fastestPrestige" && (state.fastestPrestigeSec == null || state.fastestPrestigeSec <= 0)) continue;
      if (pv.value <= 0 || !isFinite(pv.value)) continue;

      const result = await submitScore(
        cat.id,
        pv.value,
        pv.mantissa,
        pv.exponent,
        state.madness.dominantArchetype,
        state.totalPlaytimeSec,
        state.prestigeCount
      );
      if (result.success) successes++;
    }

    lastSuccess = `Submitted ${successes} score${successes !== 1 ? "s" : ""}!`;
    await doFetch();
    submitting = false;
  }

  function formatEntryValue(entry: LeaderboardEntry, cat: LeaderboardCategory): string {
    const catDef = LEADERBOARD_CATEGORIES.find((c) => c.id === cat)!;
    if (catDef.format === "seconds") {
      return formatTime(entry.value);
    }
    if (catDef.format === "decimal" && entry.valueExponent > 0) {
      const d = Decimal.fromMantissaExponent(entry.valueMantissa, entry.valueExponent);
      return formatRP(d, "scientific");
    }
    if (catDef.format === "decimal") {
      return formatRP(new Decimal(entry.value), "standard");
    }
    return entry.value.toLocaleString();
  }

  function formatMyValue(cat: LeaderboardCategory): string {
    const catDef = LEADERBOARD_CATEGORIES.find((c) => c.id === cat)!;
    const pv = getPlayerValue(cat);
    if (catDef.format === "seconds") {
      return pv.value === Infinity ? "—" : formatTime(pv.value);
    }
    if (catDef.format === "decimal") {
      return formatRP(new Decimal(pv.value), notation);
    }
    return pv.value.toLocaleString();
  }

  function onNameSet() {
    showNamePrompt = false;
  }

  const ARCHETYPE_ICONS: Record<string, string> = {
    megalomaniac: "👁",
    perfectionist: "◎",
    unhinged: "☣",
    realityBreaker: "◇",
    gadgeteer: "⚙",
    accidentalGenius: "✦",
  };
</script>

<div class="leaderboard-tab">
  <div class="lb-header">
    <h2>Leaderboards</h2>
    {#if hasPlayerName()}
      <span class="player-name mono">{getPlayerName()}</span>
    {/if}
  </div>

  {#if showNamePrompt}
    <NamePrompt onComplete={onNameSet} />
  {:else if !available}
    <div class="unavailable card">
      <p class="text-muted">Leaderboards are not yet configured.</p>
      <p class="text-muted" style="font-size: var(--text-xs);">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables to enable.</p>
    </div>
  {:else}
    <!-- Category selector -->
    <div class="category-bar">
      {#each LEADERBOARD_CATEGORIES as cat (cat.id)}
        <button
          class="cat-btn"
          class:active={activeCategory === cat.id}
          onclick={() => { activeCategory = cat.id; }}
        >
          {cat.label}
        </button>
      {/each}
    </div>

    <!-- Timeframe toggle -->
    <div class="timeframe-bar">
      <button
        class="tf-btn"
        class:active={activeTimeframe === "allTime"}
        onclick={() => { activeTimeframe = "allTime"; }}
      >All Time</button>
      <button
        class="tf-btn"
        class:active={activeTimeframe === "weekly"}
        onclick={() => { activeTimeframe = "weekly"; }}
      >This Week</button>

      <div class="spacer"></div>

      <button
        class="submit-btn"
        disabled={submitting}
        onclick={onSubmit}
      >
        {submitting ? "..." : "Submit Score"}
      </button>
      <button
        class="submit-all-btn"
        disabled={submitting}
        onclick={onSubmitAll}
      >
        {submitting ? "..." : "Submit All"}
      </button>
    </div>

    <!-- My score -->
    <div class="my-score card">
      <span class="my-label text-muted">Your Score</span>
      <span class="my-value mono text-rp">{formatMyValue(activeCategory)}</span>
      {#if playerRank}
        <span class="my-rank mono">Rank #{playerRank}</span>
      {/if}
    </div>

    {#if lastError}
      <p class="msg error-msg">{lastError}</p>
    {/if}
    {#if lastSuccess}
      <p class="msg success-msg">{lastSuccess}</p>
    {/if}

    <!-- Leaderboard table -->
    {#if loading}
      <div class="loading text-muted">Loading...</div>
    {:else if entries.length === 0}
      <div class="empty text-muted">No entries yet. Be the first to submit!</div>
    {:else}
      <div class="lb-table">
        <div class="lb-row lb-header-row">
          <span class="lb-rank">#</span>
          <span class="lb-name">Player</span>
          <span class="lb-value">Score</span>
        </div>
        {#each entries as entry (entry.playerId + entry.rank)}
          <div
            class="lb-row"
            class:is-me={entry.playerId === playerId}
            class:top-3={entry.rank <= 3}
          >
            <span class="lb-rank mono">
              {#if entry.rank === 1}🥇
              {:else if entry.rank === 2}🥈
              {:else if entry.rank === 3}🥉
              {:else}{entry.rank}
              {/if}
            </span>
            <span class="lb-name">
              {#if entry.archetype && ARCHETYPE_ICONS[entry.archetype]}
                <span class="arch-icon">{ARCHETYPE_ICONS[entry.archetype]}</span>
              {/if}
              {entry.playerName}
              {#if entry.playerId === playerId}
                <span class="you-badge">YOU</span>
              {/if}
            </span>
            <span class="lb-value mono">{formatEntryValue(entry, activeCategory)}</span>
          </div>
        {/each}
      </div>
      <div class="lb-footer text-muted mono">
        {totalEntries} total entries
      </div>
    {/if}

    <!-- Change name link -->
    <button class="change-name-btn text-muted" onclick={() => { showNamePrompt = true; }}>
      Change display name
    </button>
  {/if}
</div>

<style>
  .leaderboard-tab {
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
  }

  .lb-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
  }

  .lb-header h2 {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .player-name {
    font-size: var(--text-sm);
    color: var(--color-rp);
  }

  .unavailable {
    text-align: center;
    padding: var(--space-xl);
  }

  /* ── Category Bar ──────────────────────────────────────────────── */

  .category-bar {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
    margin-bottom: var(--space-sm);
  }

  .cat-btn {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    font-weight: 500;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .cat-btn.active {
    background: rgba(199, 146, 234, 0.15);
    border-color: var(--color-rp);
    color: var(--color-rp);
  }

  .cat-btn:hover:not(.active) {
    border-color: var(--text-muted);
  }

  /* ── Timeframe + Submit ────────────────────────────────────────── */

  .timeframe-bar {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin-bottom: var(--space-md);
  }

  .tf-btn {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .tf-btn.active {
    background: rgba(130, 170, 255, 0.15);
    border-color: var(--color-ip);
    color: var(--color-ip);
  }

  .spacer {
    flex: 1;
  }

  .submit-btn, .submit-all-btn {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    font-weight: 600;
    border: 1px solid var(--color-rp);
    border-radius: var(--radius-sm);
    background: rgba(199, 146, 234, 0.15);
    color: var(--color-rp);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .submit-btn:hover, .submit-all-btn:hover {
    background: rgba(199, 146, 234, 0.3);
  }

  .submit-btn:disabled, .submit-all-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .submit-all-btn {
    border-color: var(--color-ip);
    background: rgba(130, 170, 255, 0.1);
    color: var(--color-ip);
  }

  .submit-all-btn:hover {
    background: rgba(130, 170, 255, 0.25);
  }

  /* ── My Score ──────────────────────────────────────────────────── */

  .my-score {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-sm);
  }

  .my-label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .my-value {
    font-size: var(--text-lg);
    font-weight: 700;
  }

  .my-rank {
    margin-left: auto;
    font-size: var(--text-sm);
    color: var(--color-warning);
  }

  /* ── Messages ──────────────────────────────────────────────────── */

  .msg {
    font-size: var(--text-xs);
    text-align: center;
    padding: var(--space-xs);
    margin-bottom: var(--space-sm);
    border-radius: var(--radius-sm);
  }

  .error-msg {
    color: var(--color-danger);
    background: rgba(255, 83, 112, 0.1);
  }

  .success-msg {
    color: #50c878;
    background: rgba(80, 200, 120, 0.1);
  }

  /* ── Leaderboard Table ─────────────────────────────────────────── */

  .lb-table {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .lb-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: rgba(26, 29, 39, 0.6);
    transition: background var(--transition-fast);
  }

  .lb-row:hover:not(.lb-header-row) {
    background: rgba(26, 29, 39, 0.9);
  }

  .lb-header-row {
    background: rgba(26, 29, 39, 0.85);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    font-weight: 600;
  }

  .lb-row.is-me {
    background: rgba(199, 146, 234, 0.1);
    border-left: 3px solid var(--color-rp);
  }

  .lb-row.top-3:not(.lb-header-row) {
    background: rgba(255, 203, 107, 0.05);
  }

  .lb-rank {
    width: 40px;
    text-align: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .lb-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--text-sm);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .arch-icon {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .you-badge {
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--color-rp);
    background: rgba(199, 146, 234, 0.2);
    padding: 1px 4px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .lb-value {
    min-width: 100px;
    text-align: right;
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  .lb-footer {
    text-align: center;
    font-size: var(--text-xs);
    padding: var(--space-sm);
  }

  .loading, .empty {
    text-align: center;
    padding: var(--space-xl);
    font-style: italic;
  }

  /* ── Change Name ───────────────────────────────────────────────── */

  .change-name-btn {
    display: block;
    margin: var(--space-md) auto 0;
    background: none;
    border: none;
    font-size: var(--text-xs);
    cursor: pointer;
    text-decoration: underline;
    color: var(--text-muted);
  }

  .change-name-btn:hover {
    color: var(--text-secondary);
  }

  /* ── Mobile ──────────────────────────────────────────────────────── */

  @media (max-width: 600px) {
    .leaderboard-tab {
      padding: var(--space-sm);
    }

    .timeframe-bar {
      flex-wrap: wrap;
    }

    .lb-value {
      min-width: 70px;
    }
  }
</style>
