<script lang="ts">
  import { getState, getRPPerSec, getIPPerSec, getClickValue } from "../../stores/game.svelte";
  import { formatRP, formatRate } from "../../lib/utils/format";
  import { formatTime } from "../../lib/utils/time";
  import { GENERATORS } from "../../lib/data/generators.data";
  import { generatorProduction } from "../../lib/engine/formulas";
  import { showToast } from "../../stores/ui.svelte";

  const ARCHETYPE_LABELS: Record<string, string> = {
    megalomaniac: "Megalomaniac",
    perfectionist: "Perfectionist",
    unhinged: "Ethically Unhinged",
    realityBreaker: "Reality Breaker",
    gadgeteer: "Gadgeteer",
    accidentalGenius: "Accidental Genius",
  };

  const state = $derived(getState());
  const rpPerSec = $derived(getRPPerSec());
  const ipPerSec = $derived(getIPPerSec());
  const clickVal = $derived(getClickValue());
  const notation = $derived(state.settings.notation);

  // Generator stats
  const genStats = $derived(
    GENERATORS.map((gen, i) => ({
      name: gen.name,
      owned: state.generators[i].owned,
      totalProduced: state.generators[i].totalProduced,
      production: generatorProduction(state, i),
    }))
  );

  // Summary stats
  const totalGenerators = $derived(
    state.generators.reduce((sum, g) => sum + g.owned.toNumber(), 0)
  );
  const distinctGenerators = $derived(
    state.generators.filter((g) => g.owned.gt(0)).length
  );

  let showGenerators = $state(false);

  function copyStatsToClipboard() {
    const lines: string[] = [
      "=== Click, For Science! — Statistics ===",
      "",
      `Current RP: ${formatRP(state.rp, notation)}`,
      `RP/sec: ${formatRate(rpPerSec, notation)}`,
      `Click Value: ${formatRP(clickVal, notation)}`,
      `Total RP (this run): ${formatRP(state.totalRPThisRun, notation)}`,
      `Total RP (all time): ${formatRP(state.totalRPAllTime, notation)}`,
      "",
      `IP: ${formatRP(state.ip, notation)}`,
      `IP/sec: ${formatRate(ipPerSec, notation)}`,
      `Total IP (all time): ${formatRP(state.totalIPAllTime, notation)}`,
      "",
      `BP: ${formatRP(state.bp, notation)}`,
      `TP: ${formatRP(state.tp, notation)}`,
      "",
      `Total Clicks: ${formatRP(state.clickCount, notation)}`,
      `Prestige Count: ${state.prestigeCount}`,
      `Ascension Count: ${state.ascensionCount}`,
      `Madness Level: ${state.madness.madnessLevel}`,
      state.madness.dominantArchetype
        ? `Dominant Archetype: ${ARCHETYPE_LABELS[state.madness.dominantArchetype] ?? state.madness.dominantArchetype}`
        : "",
      "",
      `Current Run: ${formatTime(state.currentRunTimeSec)}`,
      `Total Playtime: ${formatTime(state.totalPlaytimeSec)}`,
      state.fastestPrestigeSec !== null ? `Fastest Prestige: ${formatTime(state.fastestPrestigeSec)}` : "",
      "",
      `Total Generators: ${totalGenerators}`,
      `Distinct Types: ${distinctGenerators}/10`,
      `Challenges Completed: ${state.completedChallenges.length}`,
      `Achievements: ${state.unlockedAchievements.length}`,
      `Lab Notes: ${state.unlockedNotes.length}`,
      `Lab Level: ${state.labLevel}`,
      "",
      "--- Generators ---",
      ...GENERATORS.map((gen, i) => {
        const g = state.generators[i];
        return g.owned.gt(0)
          ? `${gen.name}: ${formatRP(g.owned, notation)} (${formatRate(generatorProduction(state, i), notation)} RP)`
          : "";
      }).filter(Boolean),
    ];

    navigator.clipboard.writeText(lines.filter((l) => l !== undefined).join("\n")).then(() => {
      showToast("Stats copied to clipboard!", 2000);
    });
  }
</script>

<div class="stats-tab">
  <div class="stats-header">
    <h2>Statistics</h2>
    <button class="copy-btn" onclick={copyStatsToClipboard} title="Copy stats to clipboard">
      Copy Stats
    </button>
  </div>

  <!-- Production -->
  <div class="stats-section">
    <h3 class="section-title">Production</h3>
    <div class="stats-grid">
      <div class="stat-row">
        <span class="stat-label">Current RP</span>
        <span class="stat-value mono text-rp">{formatRP(state.rp, notation)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">RP/sec</span>
        <span class="stat-value mono text-rp">{formatRate(rpPerSec, notation)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Click Value</span>
        <span class="stat-value mono">{formatRP(clickVal, notation)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total RP (this run)</span>
        <span class="stat-value mono">{formatRP(state.totalRPThisRun, notation)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total RP (all time)</span>
        <span class="stat-value mono">{formatRP(state.totalRPAllTime, notation)}</span>
      </div>
    </div>
  </div>

  <!-- Currencies -->
  <div class="stats-section">
    <h3 class="section-title">Currencies</h3>
    <div class="stats-grid">
      <div class="stat-row">
        <span class="stat-label">Insight Points (IP)</span>
        <span class="stat-value mono" style="color: #c3e88d">{formatRP(state.ip, notation)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">IP/sec</span>
        <span class="stat-value mono" style="color: #c3e88d">{formatRate(ipPerSec, notation)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Breakthrough Points (BP)</span>
        <span class="stat-value mono" style="color: #f78c6c">{formatRP(state.bp, notation)}</span>
      </div>
      {#if state.tp.gt(0)}
        <div class="stat-row">
          <span class="stat-label">Thesis Points (TP)</span>
          <span class="stat-value mono" style="color: #89ddff">{formatRP(state.tp, notation)}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Progression -->
  <div class="stats-section">
    <h3 class="section-title">Progression</h3>
    <div class="stats-grid">
      <div class="stat-row">
        <span class="stat-label">Total Clicks</span>
        <span class="stat-value mono">{formatRP(state.clickCount, notation)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Prestige Count</span>
        <span class="stat-value mono">{state.prestigeCount}</span>
      </div>
      {#if state.ascensionCount > 0}
        <div class="stat-row">
          <span class="stat-label">Ascension Count</span>
          <span class="stat-value mono">{state.ascensionCount}</span>
        </div>
      {/if}
      <div class="stat-row">
        <span class="stat-label">Madness Level</span>
        <span class="stat-value mono">{state.madness.madnessLevel}</span>
      </div>
      {#if state.madness.dominantArchetype}
        <div class="stat-row">
          <span class="stat-label">Dominant Archetype</span>
          <span class="stat-value">{ARCHETYPE_LABELS[state.madness.dominantArchetype] ?? state.madness.dominantArchetype}</span>
        </div>
      {/if}
      <div class="stat-row">
        <span class="stat-label">Lab Level</span>
        <span class="stat-value mono">{state.labLevel}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Challenges Completed</span>
        <span class="stat-value mono">{state.completedChallenges.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Achievements</span>
        <span class="stat-value mono">{state.unlockedAchievements.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Lab Notes</span>
        <span class="stat-value mono">{state.unlockedNotes.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Upgrades Purchased</span>
        <span class="stat-value mono">{state.purchasedUpgrades.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Research Completed</span>
        <span class="stat-value mono">{state.completedResearch.length + state.runCompletedResearch.length}</span>
      </div>
    </div>
  </div>

  <!-- Timing -->
  <div class="stats-section">
    <h3 class="section-title">Timing</h3>
    <div class="stats-grid">
      <div class="stat-row">
        <span class="stat-label">Current Run</span>
        <span class="stat-value mono">{formatTime(state.currentRunTimeSec)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Playtime</span>
        <span class="stat-value mono">{formatTime(state.totalPlaytimeSec)}</span>
      </div>
      {#if state.fastestPrestigeSec !== null}
        <div class="stat-row">
          <span class="stat-label">Fastest Prestige</span>
          <span class="stat-value mono">{formatTime(state.fastestPrestigeSec)}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Generators -->
  <div class="stats-section">
    <button class="section-toggle" onclick={() => showGenerators = !showGenerators}>
      <h3 class="section-title">Generators ({totalGenerators} total, {distinctGenerators}/10 types)</h3>
      <span class="toggle-arrow" class:open={showGenerators}></span>
    </button>
    {#if showGenerators}
      <div class="stats-grid gen-grid">
        {#each genStats as gen, i (i)}
          {#if gen.owned.gt(0)}
            <div class="gen-row">
              <div class="gen-name">{gen.name}</div>
              <div class="gen-details">
                <span class="mono">{formatRP(gen.owned, notation)} owned</span>
                <span class="mono text-muted">{formatRate(gen.production, notation)} RP</span>
                <span class="mono text-muted">Total: {formatRP(gen.totalProduced, notation)}</span>
              </div>
            </div>
          {/if}
        {/each}
        {#if totalGenerators === 0}
          <div class="text-muted" style="padding: var(--space-sm); text-align: center;">
            No generators owned yet.
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .stats-tab {
    max-width: 650px;
    margin: 0 auto;
    padding: var(--space-lg);
  }

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
  }

  .stats-header h2 {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .copy-btn {
    all: unset;
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--text-secondary);
    transition: all var(--transition-fast);
  }

  .copy-btn:hover {
    border-color: var(--color-rp);
    color: var(--color-rp);
  }

  .stats-section {
    margin-bottom: var(--space-lg);
  }

  .section-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-sm);
  }

  .section-toggle {
    all: unset;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    cursor: pointer;
    margin-bottom: var(--space-sm);
  }

  .section-toggle:hover .section-title {
    color: var(--text-secondary);
  }

  .toggle-arrow {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid var(--text-muted);
    transition: transform var(--transition-fast);
  }

  .toggle-arrow.open {
    transform: rotate(180deg);
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: var(--space-sm) var(--space-md);
    background: rgba(26, 29, 39, 0.75);
    backdrop-filter: blur(4px);
    border-radius: var(--radius-sm);
  }

  .stat-label {
    color: var(--text-secondary);
  }

  .stat-value {
    font-weight: 600;
  }

  .gen-grid {
    gap: var(--space-xs);
  }

  .gen-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    background: rgba(26, 29, 39, 0.75);
    backdrop-filter: blur(4px);
    border-radius: var(--radius-sm);
    gap: var(--space-sm);
  }

  .gen-name {
    font-weight: 600;
    font-size: var(--text-sm);
    white-space: nowrap;
    min-width: 130px;
  }

  .gen-details {
    display: flex;
    gap: var(--space-md);
    font-size: var(--text-xs);
    flex-wrap: wrap;
    justify-content: flex-end;
  }
</style>
