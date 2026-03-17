<script lang="ts">
  import { getActiveTab, setActiveTab, type GameTab } from "../../stores/ui.svelte";
  import { getState, getPendingBP } from "../../stores/game.svelte";
  import { PRESTIGE_MIN_BP } from "../../lib/engine/formulas";
  import { UPGRADES } from "../../lib/data/upgrades.data";
  import { isUpgradeAvailable } from "../../lib/engine/actions";

  interface TabDef {
    id: GameTab;
    label: string;
    hidden?: boolean;
  }

  // Track seen note count to show badge on Journal
  let seenNoteCount = $state(0);

  const gameState = $derived(getState());
  const pendingBP = $derived(getPendingBP());

  // Show prestige tab once player has BP or could prestige
  const showPrestige = $derived(
    gameState.bp.gt(0) || gameState.prestigeCount > 0 || pendingBP.gte(PRESTIGE_MIN_BP)
  );

  // Show research tab once player has any IP or has researched anything
  const showResearch = $derived(
    gameState.ip.gt(0) ||
    gameState.completedResearch.length > 0 ||
    gameState.runCompletedResearch.length > 0 ||
    gameState.activeResearch !== null
  );

  // Show achievements tab once first achievement is unlocked
  const showAchievements = $derived(gameState.unlockedAchievements.length > 0);

  // Show journal tab once first note is unlocked
  const showJournal = $derived(gameState.unlockedNotes.length > 0);

  // Notification badges
  const hasAffordableUpgrade = $derived(
    UPGRADES.some(
      (u) =>
        !gameState.purchasedUpgrades.includes(u.id) &&
        isUpgradeAvailable(gameState, u.id) &&
        gameState.rp.gte(u.cost)
    )
  );

  const hasNewNotes = $derived(gameState.unlockedNotes.length > seenNoteCount);

  // Show neighborhood tab once player reaches Warehouse lab level (2+)
  const showNeighborhood = $derived(gameState.labLevel >= 2);

  const tabs: TabDef[] = [
    { id: "generators", label: "Lab" },
    { id: "upgrades", label: "Upgrades" },
    { id: "research", label: "Research" },
    { id: "prestige", label: "Breakthrough" },
    { id: "neighborhood", label: "Neighborhood" },
    { id: "achievements", label: "Achievements" },
    { id: "journal", label: "Journal" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "stats", label: "Stats" },
    { id: "settings", label: "Settings" },
  ];

  const visibleTabs = $derived(
    tabs.filter((t) => {
      if (t.id === "research") return showResearch;
      if (t.id === "prestige") return showPrestige;
      if (t.id === "achievements") return showAchievements;
      if (t.id === "neighborhood") return showNeighborhood;
      if (t.id === "journal") return showJournal;
      // Leaderboard is always visible
      return true;
    })
  );

  const activeTab = $derived(getActiveTab());

  function hasBadge(tabId: GameTab): boolean {
    if (tabId === "upgrades") return hasAffordableUpgrade;
    if (tabId === "journal") return hasNewNotes;
    return false;
  }

  function onTabClick(tabId: GameTab) {
    setActiveTab(tabId);
    // Mark journal notes as seen when switching to journal
    if (tabId === "journal") {
      seenNoteCount = gameState.unlockedNotes.length;
    }
  }
</script>

<nav class="tab-bar">
  <div class="tab-scroll">
    {#each visibleTabs as tab}
      <button
        class="tab"
        class:active={activeTab === tab.id}
        onclick={() => onTabClick(tab.id)}
      >
        {tab.label}
        {#if hasBadge(tab.id) && activeTab !== tab.id}
          <span class="badge"></span>
        {/if}
      </button>
    {/each}
  </div>
</nav>

<style>
  .tab-bar {
    background: rgba(26, 29, 39, 0.75);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border-color);
    position: relative;
  }

  .tab-scroll {
    display: flex;
    gap: 2px;
    padding: 0 var(--space-lg);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .tab-scroll::-webkit-scrollbar {
    display: none;
  }

  .tab {
    position: relative;
    padding: var(--space-sm) var(--space-md);
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: transparent;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
    transition: color var(--transition-fast), border-color var(--transition-fast);
  }

  .tab:hover:not(:disabled) {
    color: var(--text-primary);
    background: transparent;
  }

  .tab.active {
    color: var(--color-rp);
    border-bottom-color: var(--color-rp);
  }

  .badge {
    position: absolute;
    top: 6px;
    right: 4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-warning);
    animation: badge-pulse 2s ease-in-out infinite;
  }

  @keyframes badge-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Mobile: scroll hints with fade edges */
  @media (max-width: 600px) {
    .tab-bar::before,
    .tab-bar::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      width: 24px;
      pointer-events: none;
      z-index: 2;
    }

    .tab-bar::before {
      left: 0;
      background: linear-gradient(to right, rgba(26, 29, 39, 0.9), transparent);
    }

    .tab-bar::after {
      right: 0;
      background: linear-gradient(to left, rgba(26, 29, 39, 0.9), transparent);
    }

    .tab-scroll {
      padding: 0 var(--space-sm);
    }

    .tab {
      min-height: 44px;
      padding: var(--space-sm) 12px;
      font-size: var(--text-xs);
    }
  }
</style>
