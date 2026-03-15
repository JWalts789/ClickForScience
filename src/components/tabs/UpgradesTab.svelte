<script lang="ts">
  import { getState } from "../../stores/game.svelte";
  import { isUpgradeAvailable } from "../../lib/engine/actions";
  import { UPGRADES, type UpgradeCategory } from "../../lib/data/upgrades.data";
  import UpgradeRow from "../shared/UpgradeRow.svelte";

  const state = $derived(getState());

  const categories: { id: UpgradeCategory; label: string }[] = [
    { id: "production", label: "Production" },
    { id: "clicking", label: "Clicking" },
    { id: "synergy", label: "Synergy" },
    { id: "efficiency", label: "Efficiency" },
  ];

  // Only show upgrades that are either owned or have their prerequisites met
  const visibleUpgrades = $derived(
    UPGRADES.filter(
      (u) =>
        state.purchasedUpgrades.includes(u.id) ||
        isUpgradeAvailable(state, u.id)
    )
  );

  function upgradesInCategory(cat: UpgradeCategory) {
    return visibleUpgrades.filter((u) => u.category === cat);
  }
</script>

<div class="upgrades-tab">
  <div class="upgrades-header">
    <h2>Upgrades</h2>
    <span class="text-muted">
      {state.purchasedUpgrades.length}/{UPGRADES.length} purchased
    </span>
  </div>

  {#each categories as cat}
    {@const items = upgradesInCategory(cat.id)}
    {#if items.length > 0}
      <div class="category">
        <h3 class="category-label">{cat.label}</h3>
        <div class="upgrade-list">
          {#each items as upgrade (upgrade.id)}
            <UpgradeRow {upgrade} />
          {/each}
        </div>
      </div>
    {/if}
  {/each}

  {#if visibleUpgrades.length === 0}
    <div class="empty text-muted">
      No upgrades available yet. Keep producing RP!
    </div>
  {/if}
</div>

<style>
  .upgrades-tab {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
  }

  .upgrades-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
  }

  .upgrades-header h2 {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .category {
    margin-bottom: var(--space-lg);
  }

  .category-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-sm);
  }

  .upgrade-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .empty {
    text-align: center;
    padding: var(--space-xl);
    font-size: var(--text-base);
  }
</style>
