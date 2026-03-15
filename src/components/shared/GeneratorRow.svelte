<script lang="ts">
  import { Decimal } from "../../lib/utils/decimal";
  import { getState, getRevision, buyGenerator, toggleAutobuyer, isResearchComplete } from "../../stores/game.svelte";
  import { getBuyAmount } from "../../stores/ui.svelte";
  import { formatRP, formatRate, formatCost } from "../../lib/utils/format";
  import {
    generatorCost,
    generatorBulkCost,
    generatorProduction,
    maxAffordable,
  } from "../../lib/engine/formulas";
  import { GENERATORS, MILESTONES } from "../../lib/data/generators.data";

  interface Props {
    index: number;
  }

  let { index }: Props = $props();

  let purchaseFlash = $state(false);

  const def = $derived(GENERATORS[index]);
  const rev = $derived(getRevision());
  const gameState = $derived(getState());
  const notation = $derived(gameState.settings.notation);
  const buyAmt = $derived(getBuyAmount());

  // Force re-read on every revision since nested generator objects are shared refs
  const owned = $derived.by(() => { void rev; return gameState.generators[index].owned; });
  const production = $derived.by(() => { void rev; return generatorProduction(gameState, index); });

  const effectiveAmount = $derived.by(() => {
    if (buyAmt === -1) return maxAffordable(def, owned, gameState.rp);
    return buyAmt;
  });

  const cost = $derived.by(() => {
    if (effectiveAmount <= 0) return new Decimal(Infinity);
    if (effectiveAmount === 1) return generatorCost(def, owned);
    return generatorBulkCost(def, owned, effectiveAmount);
  });

  const canAfford = $derived(gameState.rp.gte(cost) && effectiveAmount > 0);

  // Tier color (generators 0-1 = tier 1, 2-3 = tier 2, etc.)
  const tierColors = [
    "var(--gen-tier-1)",
    "var(--gen-tier-1)",
    "var(--gen-tier-2)",
    "var(--gen-tier-2)",
    "var(--gen-tier-3)",
    "var(--gen-tier-3)",
    "var(--gen-tier-4)",
    "var(--gen-tier-4)",
    "var(--gen-tier-5)",
    "var(--gen-tier-5)",
  ];
  const tierColor = $derived(tierColors[index] ?? "var(--gen-tier-1)");

  // Dynamic description based on milestone count
  const ownedNum = $derived(owned.toNumber());
  const activeDesc = $derived.by(() => {
    if (!def.milestoneDescs) return def.description;
    let desc = def.description;
    for (const md of def.milestoneDescs) {
      if (ownedNum >= md.count) desc = md.text;
    }
    return desc;
  });

  // Milestone progress
  const nextMilestone = $derived(
    MILESTONES.find((m) => m.count > ownedNum)
  );
  const prevMilestoneCount = $derived.by(() => {
    let prev = 0;
    for (const m of MILESTONES) {
      if (m.count <= ownedNum) prev = m.count;
    }
    return prev;
  });
  const milestoneProgress = $derived.by(() => {
    if (!nextMilestone) return 1;
    const range = nextMilestone.count - prevMilestoneCount;
    if (range <= 0) return 0;
    return (ownedNum - prevMilestoneCount) / range;
  });

  // Auto-buyer state
  const autobuyerUnlocked = $derived.by(() => { void rev; return isResearchComplete(gameState, "autobuyer_protocol"); });
  const autobuyerOn = $derived.by(() => { void rev; return !!gameState.autobuyers.enabled[def.id]; });

  function onBuy() {
    buyGenerator(def.id, buyAmt);
    purchaseFlash = true;
    setTimeout(() => { purchaseFlash = false; }, 300);
  }

  function onToggleAutobuyer() {
    toggleAutobuyer(def.id);
  }
</script>

<div
  class="generator-row"
  class:affordable={canAfford}
  class:flash={purchaseFlash}
  style:--tier-color={tierColor}
>
  <div class="tier-accent"></div>

  <div class="gen-body">
    <div class="gen-main">
      <div class="gen-info">
        <div class="gen-name">{def.name}</div>
        <div class="gen-desc text-muted">{activeDesc}</div>
      </div>

      <div class="gen-stats mono">
        <span class="gen-owned">{owned.toFixed(0)}</span>
        <span class="gen-production text-rp">{formatRate(production, notation)}</span>
      </div>

      <div class="gen-actions">
        {#if autobuyerUnlocked && ownedNum > 0}
          <button
            class="autobuyer-toggle"
            class:active={autobuyerOn}
            onclick={onToggleAutobuyer}
            title={autobuyerOn ? "Auto-buy ON" : "Auto-buy OFF"}
          >
            {autobuyerOn ? "AUTO" : "OFF"}
          </button>
        {/if}
        <button
          class="gen-buy"
          class:primary={canAfford}
          disabled={!canAfford}
          onclick={onBuy}
        >
          <span class="buy-count">
            {buyAmt === -1 ? (effectiveAmount > 0 ? `x${effectiveAmount}` : "MAX") : `x${buyAmt}`}
          </span>
          <span class="buy-cost">{formatCost(cost, notation)} RP</span>
        </button>
      </div>
    </div>

    {#if ownedNum > 0 && nextMilestone}
      <div class="milestone-bar tooltip-container">
        <div class="milestone-fill" style:width="{milestoneProgress * 100}%"></div>
        <span class="milestone-label">
          {ownedNum}/{nextMilestone.count} &mdash; {nextMilestone.multiplier}x
        </span>
        <span class="tooltip" style="bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 4px;">
          {nextMilestone.multiplier}x production bonus at {nextMilestone.count} owned
        </span>
      </div>
    {/if}
  </div>
</div>

<style>
  .generator-row {
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    backdrop-filter: blur(4px);
    transition: border-color var(--transition-fast);
    overflow: hidden;
  }

  .generator-row.affordable {
    border-color: var(--border-light);
    background: rgba(26, 29, 39, 0.85);
  }

  .generator-row.flash {
    animation: purchase-flash 300ms ease;
  }

  @keyframes purchase-flash {
    0% { border-color: var(--color-rp); box-shadow: 0 0 12px color-mix(in srgb, var(--color-rp) 30%, transparent); }
    100% { border-color: var(--border-light); box-shadow: none; }
  }

  .tier-accent {
    width: 4px;
    flex-shrink: 0;
    background: var(--tier-color);
    opacity: 0.6;
    transition: opacity var(--transition-fast);
  }

  .generator-row.affordable .tier-accent {
    opacity: 1;
  }

  .gen-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .gen-main {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
  }

  .gen-info {
    flex: 1;
    min-width: 0;
  }

  .gen-name {
    font-weight: 600;
    font-size: var(--text-base);
  }

  .gen-desc {
    font-size: var(--text-xs);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gen-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 100px;
  }

  .gen-owned {
    font-size: var(--text-lg);
    font-weight: 700;
  }

  .gen-production {
    font-size: var(--text-xs);
  }

  .gen-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .autobuyer-toggle {
    padding: 4px 8px;
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: 44px;
  }

  .autobuyer-toggle.active {
    background: rgba(80, 200, 120, 0.15);
    border-color: rgba(80, 200, 120, 0.5);
    color: #50c878;
  }

  .autobuyer-toggle:hover {
    border-color: var(--text-secondary);
  }

  .gen-buy {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 110px;
    padding: var(--space-sm) var(--space-md);
  }

  .buy-count {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .buy-cost {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
  }

  /* Milestone progress bar */
  .milestone-bar {
    position: relative;
    height: 14px;
    background: rgba(0, 0, 0, 0.3);
    margin: 0 var(--space-sm) var(--space-xs);
    border-radius: 2px;
    overflow: hidden;
  }

  .milestone-fill {
    position: absolute;
    inset: 0;
    right: auto;
    background: var(--tier-color);
    opacity: 0.25;
    transition: width 200ms ease;
  }

  .milestone-label {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  @media (max-width: 600px) {
    .gen-main {
      flex-wrap: wrap;
      gap: var(--space-sm);
    }

    .gen-stats {
      min-width: auto;
      flex-direction: row;
      gap: var(--space-sm);
      align-items: baseline;
    }

    .gen-actions {
      width: 100%;
      justify-content: center;
    }

    .gen-buy {
      flex: 1;
      flex-direction: row;
      justify-content: center;
      gap: var(--space-sm);
      min-width: auto;
    }
  }
</style>
