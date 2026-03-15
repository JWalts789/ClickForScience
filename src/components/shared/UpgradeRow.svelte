<script lang="ts">
  import { getState, buyUpgrade } from "../../stores/game.svelte";
  import { formatCost } from "../../lib/utils/format";
  import { isUpgradeAvailable } from "../../lib/engine/actions";
  import type { UpgradeDef } from "../../lib/data/upgrades.data";

  interface Props {
    upgrade: UpgradeDef;
  }

  let { upgrade }: Props = $props();

  const state = $derived(getState());
  const notation = $derived(state.settings.notation);
  const owned = $derived(state.purchasedUpgrades.includes(upgrade.id));
  const available = $derived(isUpgradeAvailable(state, upgrade.id));
  const canAfford = $derived(available && state.rp.gte(upgrade.cost));

  function onBuy() {
    buyUpgrade(upgrade.id);
  }
</script>

<div class="upgrade-row" class:owned class:available={canAfford}>
  <div class="upgrade-info">
    <div class="upgrade-name">
      {upgrade.name}
      {#if owned}
        <span class="owned-badge">Owned</span>
      {/if}
    </div>
    <div class="upgrade-desc text-muted">{upgrade.description}</div>
  </div>

  {#if !owned}
    <button
      class="upgrade-buy"
      class:primary={canAfford}
      disabled={!canAfford}
      onclick={onBuy}
    >
      {formatCost(upgrade.cost, notation)} RP
    </button>
  {/if}
</div>

<style>
  .upgrade-row {
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

  .upgrade-row.owned {
    opacity: 0.5;
    border-color: var(--color-rp);
  }

  .upgrade-row.available {
    border-color: var(--border-light);
    background: rgba(26, 29, 39, 0.85);
  }

  .upgrade-info {
    flex: 1;
    min-width: 0;
  }

  .upgrade-name {
    font-weight: 600;
    font-size: var(--text-base);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .owned-badge {
    font-size: var(--text-xs);
    color: var(--color-rp);
    font-weight: 500;
  }

  .upgrade-desc {
    font-size: var(--text-xs);
  }

  .upgrade-buy {
    min-width: 110px;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
    white-space: nowrap;
  }
</style>
