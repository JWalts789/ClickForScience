<script lang="ts">
  import { getState, buyPrestigeUpgrade } from "../../stores/game.svelte";
  import { formatCost } from "../../lib/utils/format";
  import { isPrestigeUpgradeAvailable } from "../../lib/engine/actions";
  import type { PrestigeUpgradeDef } from "../../lib/data/upgrades.data";

  interface Props {
    upgrade: PrestigeUpgradeDef;
  }

  let { upgrade }: Props = $props();

  const state = $derived(getState());
  const notation = $derived(state.settings.notation);
  const owned = $derived(state.prestigeUpgrades.includes(upgrade.id));
  const available = $derived(isPrestigeUpgradeAvailable(state, upgrade.id));
  const canAfford = $derived(available && state.bp.gte(upgrade.cost));

  function onBuy() {
    buyPrestigeUpgrade(upgrade.id);
  }
</script>

<div class="prestige-row" class:owned class:available={canAfford}>
  <div class="prestige-info">
    <div class="prestige-name">
      {upgrade.name}
      {#if owned}
        <span class="owned-badge">Owned</span>
      {/if}
    </div>
    <div class="prestige-desc text-muted">{upgrade.description}</div>
  </div>

  {#if !owned}
    <button
      class="prestige-buy"
      class:primary={canAfford}
      disabled={!canAfford}
      onclick={onBuy}
    >
      {formatCost(upgrade.cost, notation)} BP
    </button>
  {/if}
</div>

<style>
  .prestige-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    backdrop-filter: blur(4px);
    transition: border-color var(--transition-fast), opacity var(--transition-fast);
  }

  .prestige-row.owned {
    opacity: 0.5;
    border-color: var(--color-bp);
  }

  .prestige-row.available {
    border-color: var(--color-bp);
    background: rgba(26, 29, 39, 0.85);
  }

  .prestige-info {
    flex: 1;
    min-width: 0;
  }

  .prestige-name {
    font-weight: 600;
    font-size: var(--text-base);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .owned-badge {
    font-size: var(--text-xs);
    color: var(--color-bp);
    font-weight: 500;
  }

  .prestige-desc {
    font-size: var(--text-xs);
  }

  .prestige-buy {
    min-width: 110px;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  .prestige-buy.primary {
    background: rgba(199, 146, 234, 0.15);
    border-color: var(--color-bp);
    color: var(--color-bp);
  }

  .prestige-buy.primary:hover:not(:disabled) {
    background: rgba(199, 146, 234, 0.25);
  }
</style>
