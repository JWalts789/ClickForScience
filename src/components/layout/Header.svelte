<script lang="ts">
  import { getState, getRPPerSec, getRevision } from "../../stores/game.svelte";
  import { formatRP, formatRate, formatNumber } from "../../lib/utils/format";
  import { formatTime } from "../../lib/utils/time";
  import { ALL_ARCHETYPES, type MadnessArchetype } from "../../lib/engine/state";
  import { labLevelName } from "../../lib/data/lab-expansions.data";

  const ARCHETYPE_LABELS: Record<MadnessArchetype, string> = {
    megalomaniac: "Megalomaniac",
    perfectionist: "Perfectionist",
    unhinged: "Unhinged",
    realityBreaker: "Reality Breaker",
    gadgeteer: "Gadgeteer",
    accidentalGenius: "Accidental Genius",
  };

  const ARCHETYPE_ICONS: Record<MadnessArchetype, string> = {
    megalomaniac: "👁",
    perfectionist: "◎",
    unhinged: "☣",
    realityBreaker: "◇",
    gadgeteer: "⚙",
    accidentalGenius: "✦",
  };

  const ARCHETYPE_COLORS: Record<MadnessArchetype, string> = {
    megalomaniac: "#ff5370",
    perfectionist: "#82aaff",
    unhinged: "#c3e88d",
    realityBreaker: "#c792ea",
    gadgeteer: "#ffcb6b",
    accidentalGenius: "#89ddff",
  };

  const state = $derived(getState());
  const rev = $derived(getRevision());
  const rpPerSec = $derived(getRPPerSec());
  const notation = $derived(state.settings.notation);
  const showIP = $derived(state.ip.gt(0) || state.totalIPAllTime.gt(0));
  const activeBuffs = $derived(state.activeBuffs);
  const dominant = $derived(state.madness.dominantArchetype);
  const labName = $derived(labLevelName(state.labLevel));
  const showLabName = $derived(state.labLevel > 0);

  // Break reference equality on affinities so $derived propagates updates.
  // $state.raw + shallow spread in notify() means nested objects keep the same ref.
  const affinities = $derived.by(() => {
    void rev; // subscribe to revision changes
    return { ...state.madness.affinities };
  });
  const totalAffinity = $derived(
    ALL_ARCHETYPES.reduce((sum, a) => sum + affinities[a], 0)
  );
  const showArchetypes = $derived(totalAffinity > 0);

  // Sorted archetypes by affinity (highest first), filtered to non-zero
  const sortedArchetypes = $derived(
    ALL_ARCHETYPES
      .filter((a) => affinities[a] > 0)
      .sort((a, b) => affinities[b] - affinities[a])
  );
</script>

<header class="header">
  <div class="title-row">
    <div class="title-left">
      <h1 class="title">Click, For Science!</h1>
      {#if showLabName}
        <span class="lab-badge">{labName}</span>
      {/if}
      <span class="subtitle text-muted">
        {#if state.madness.dominantArchetype === "megalomaniac"}
          "They'll ALL see..."
        {:else if state.madness.dominantArchetype === "perfectionist"}
          "It must be flawless."
        {:else if state.madness.dominantArchetype === "unhinged"}
          "Safety is a suggestion."
        {:else if state.madness.dominantArchetype === "realityBreaker"}
          "The rules don't apply here."
        {:else if state.madness.dominantArchetype === "gadgeteer"}
          "I can fix that. I can fix everything."
        {:else if state.madness.dominantArchetype === "accidentalGenius"}
          "I have no idea what I just did."
        {:else if state.madness.madnessLevel === 0}
          Just a guy in his garage.
        {:else if state.madness.madnessLevel <= 2}
          "Dedicated hobbyist"
        {:else if state.madness.madnessLevel <= 4}
          Something is... different.
        {:else}
          What have you become?
        {/if}
      </span>
    </div>

    {#if showArchetypes}
      <div class="archetype-tracker">
        {#each sortedArchetypes as arch (arch)}
          <div
            class="arch-pip tooltip-container"
            class:dominant={arch === dominant}
            style:--arch-color={ARCHETYPE_COLORS[arch]}
          >
            <span class="arch-icon">{ARCHETYPE_ICONS[arch]}</span>
            <div class="arch-bar-bg">
              <div
                class="arch-bar-fill"
                style:width="{Math.min((affinities[arch] / totalAffinity) * 100, 100)}%"
              ></div>
            </div>
            <span class="tooltip" style="top: 100%; right: 0; margin-top: 4px;">
              {ARCHETYPE_LABELS[arch]}: {affinities[arch].toFixed(0)} ({totalAffinity > 0 ? Math.round((affinities[arch] / totalAffinity) * 100) : 0}%)
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="resource-bar">
    <div class="resource">
      <span class="resource-label">Research Points</span>
      <span class="resource-value text-rp mono">
        {formatRP(state.rp, notation)}
      </span>
    </div>
    <div class="resource">
      <span class="resource-label">RP/sec</span>
      <span class="resource-value text-rp mono">
        {formatRate(rpPerSec, notation)}
      </span>
    </div>
    {#if showIP}
      <div class="resource">
        <span class="resource-label">Insight</span>
        <span class="resource-value text-ip mono">
          {formatNumber(state.ip, notation)}
        </span>
      </div>
    {/if}
    {#if state.bp.gt(0)}
      <div class="resource">
        <span class="resource-label">Breakthrough</span>
        <span class="resource-value text-bp mono">
          {formatRP(state.bp, notation)}
        </span>
      </div>
    {/if}
  </div>

  {#if activeBuffs.length > 0}
    <div class="buff-bar">
      {#each activeBuffs as buff (buff.id)}
        <span class="buff-pill">
          {buff.multiplier.toNumber()}x {buff.target === "all" ? "All" : buff.target === "click" ? "Click" : buff.target}
          <span class="buff-time">{formatTime(buff.remainingSeconds)}</span>
        </span>
      {/each}
    </div>
  {/if}
</header>

<style>
  .header {
    background: rgba(26, 29, 39, 0.8);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border-color);
    padding: var(--space-md) var(--space-lg);
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    margin-bottom: var(--space-sm);
  }

  .title-left {
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
    flex-wrap: wrap;
    min-width: 0;
  }

  .title {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-rp);
  }

  .subtitle {
    font-size: var(--text-sm);
    font-style: italic;
  }

  .lab-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-ip);
    background: rgba(255, 203, 107, 0.1);
    border: 1px solid rgba(255, 203, 107, 0.3);
    border-radius: var(--radius-sm);
    padding: 1px var(--space-xs);
    white-space: nowrap;
  }

  /* ── Archetype Tracker ─────────────────────────────────────────── */

  .archetype-tracker {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex-shrink: 0;
    min-width: 120px;
    overflow: visible;
    z-index: 10;
  }

  .arch-pip {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    opacity: 0.6;
    transition: opacity var(--transition-fast);
  }

  .arch-pip.dominant {
    opacity: 1;
  }

  .arch-pip:hover {
    opacity: 1;
  }

  .arch-icon {
    font-size: 0.7rem;
    width: 14px;
    text-align: center;
    color: var(--arch-color);
    line-height: 1;
  }

  .arch-bar-bg {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
  }

  .arch-bar-fill {
    height: 100%;
    background: var(--arch-color);
    border-radius: 2px;
    transition: width 300ms ease;
  }

  .arch-pip.dominant .arch-bar-fill {
    box-shadow: 0 0 6px var(--arch-color);
  }

  .resource-bar {
    display: flex;
    gap: var(--space-xl);
  }

  .resource {
    display: flex;
    flex-direction: column;
  }

  .resource-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .resource-value {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .buff-bar {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
    margin-top: var(--space-xs);
  }

  .buff-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: 2px var(--space-sm);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--color-warning);
    background: rgba(255, 203, 107, 0.1);
    border: 1px solid rgba(255, 203, 107, 0.25);
    border-radius: var(--radius-sm);
  }

  .buff-time {
    color: var(--text-muted);
    font-size: var(--text-xs);
  }

  @media (max-width: 600px) {
    .title-row {
      flex-direction: column;
      gap: var(--space-xs);
    }

    .title-left {
      flex-direction: column;
      gap: var(--space-xs);
    }

    .archetype-tracker {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--space-xs);
      min-width: auto;
    }

    .arch-pip {
      flex: 0 0 auto;
    }

    .arch-bar-bg {
      width: 32px;
    }

    .resource-bar {
      gap: var(--space-md);
      flex-wrap: wrap;
    }
  }
</style>
