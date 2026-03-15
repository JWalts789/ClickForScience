<script lang="ts">
  import { getState, getRevision } from "../../stores/game.svelte";
  import { ACHIEVEMENTS, TIER_COLORS, TIER_LABELS, ACHIEVEMENT_COUNT } from "../../lib/data/achievements.data";
  import type { AchievementDef, AchievementTier } from "../../lib/data/achievements.data";

  const state = $derived(getState());
  const rev = $derived(getRevision());

  const unlocked = $derived.by(() => {
    void rev;
    return new Set(state.unlockedAchievements);
  });

  const unlockedCount = $derived(unlocked.size);
  const totalCount = ACHIEVEMENT_COUNT;
  const progressPct = $derived((unlockedCount / totalCount) * 100);

  // Filter state
  let filterTier = $state<AchievementTier | "all">("all");
  let filterStatus = $state<"all" | "unlocked" | "locked">("all");

  const filteredAchievements = $derived(
    ACHIEVEMENTS.filter((a) => {
      if (filterTier !== "all" && a.tier !== filterTier) return false;
      const isUnlocked = unlocked.has(a.id);
      if (filterStatus === "unlocked" && !isUnlocked) return false;
      if (filterStatus === "locked" && isUnlocked) return false;
      return true;
    })
  );

  // Group by tier for display
  const tierOrder: AchievementTier[] = ["bronze", "silver", "gold"];

  function tierAchievements(tier: AchievementTier) {
    return filteredAchievements.filter((a) => a.tier === tier);
  }

  function tierUnlockedCount(tier: AchievementTier): number {
    return ACHIEVEMENTS.filter((a) => a.tier === tier && unlocked.has(a.id)).length;
  }

  function tierTotalCount(tier: AchievementTier): number {
    return ACHIEVEMENTS.filter((a) => a.tier === tier).length;
  }

  function isSecret(a: AchievementDef): boolean {
    return !!a.secret && !unlocked.has(a.id);
  }
</script>

<div class="achievements-tab">
  <!-- Progress Header -->
  <div class="progress-header card">
    <h2 class="header-title">Achievements</h2>
    <div class="progress-stats">
      <span class="progress-count mono">{unlockedCount} / {totalCount}</span>
      <span class="progress-pct text-muted">({progressPct.toFixed(1)}%)</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" style="width: {progressPct}%"></div>
    </div>
    <div class="tier-summary">
      {#each tierOrder as tier}
        <span class="tier-stat" style:color={TIER_COLORS[tier]}>
          {TIER_LABELS[tier]}: {tierUnlockedCount(tier)}/{tierTotalCount(tier)}
        </span>
      {/each}
    </div>
  </div>

  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
      <button class:active={filterTier === "all"} onclick={() => filterTier = "all"}>All</button>
      {#each tierOrder as tier}
        <button
          class:active={filterTier === tier}
          style:--filter-color={TIER_COLORS[tier]}
          onclick={() => filterTier = tier}
        >
          {TIER_LABELS[tier]}
        </button>
      {/each}
    </div>
    <div class="filter-group">
      <button class:active={filterStatus === "all"} onclick={() => filterStatus = "all"}>All</button>
      <button class:active={filterStatus === "unlocked"} onclick={() => filterStatus = "unlocked"}>Unlocked</button>
      <button class:active={filterStatus === "locked"} onclick={() => filterStatus = "locked"}>Locked</button>
    </div>
  </div>

  <!-- Achievement List by Tier -->
  {#each tierOrder as tier}
    {@const items = tierAchievements(tier)}
    {#if items.length > 0}
      <div class="tier-section">
        <h3 class="tier-label" style:color={TIER_COLORS[tier]}>
          {TIER_LABELS[tier]}
        </h3>
        <div class="achievement-grid">
          {#each items as achievement (achievement.id)}
            {@const done = unlocked.has(achievement.id)}
            {@const secret = isSecret(achievement)}
            <div class="achievement-card" class:done class:secret>
              <div class="ach-header">
                <span class="ach-tier-dot" style:background={TIER_COLORS[achievement.tier]}></span>
                <span class="ach-name">
                  {secret ? "???" : achievement.name}
                </span>
                {#if done}
                  <span class="ach-check">&#10003;</span>
                {/if}
              </div>
              <div class="ach-desc text-muted">
                {secret ? "Secret achievement — keep playing!" : achievement.description}
              </div>
              <div class="ach-reward" class:active-reward={done}>
                {secret ? "???" : achievement.rewardDescription}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/each}

  {#if filteredAchievements.length === 0}
    <div class="empty text-muted">No achievements match the current filter.</div>
  {/if}
</div>

<style>
  .achievements-tab {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
  }

  /* Progress Header */
  .progress-header {
    text-align: center;
    padding: var(--space-lg);
    margin-bottom: var(--space-lg);
  }

  .header-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: #ffd700;
    margin-bottom: var(--space-sm);
  }

  .progress-stats {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .progress-count {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--text-primary);
  }

  .progress-pct {
    font-size: var(--text-base);
    align-self: center;
  }

  .progress-bar-container {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--space-sm);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #cd7f32, #c0c0c0, #ffd700);
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .tier-summary {
    display: flex;
    justify-content: center;
    gap: var(--space-lg);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  /* Filters */
  .filters {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    gap: 2px;
  }

  .filter-group button {
    padding: 4px var(--space-sm);
    font-size: var(--text-xs);
    border: 1px solid var(--border-color);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .filter-group button:first-child {
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
  }

  .filter-group button:last-child {
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  }

  .filter-group button.active {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    border-color: var(--filter-color, var(--text-secondary));
  }

  /* Tier Sections */
  .tier-section {
    margin-bottom: var(--space-lg);
  }

  .tier-label {
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-sm);
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--space-sm);
  }

  /* Achievement Cards */
  .achievement-card {
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: all var(--transition-fast);
  }

  .achievement-card.done {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(255, 215, 0, 0.03);
  }

  .achievement-card.secret {
    opacity: 0.5;
    border-style: dashed;
  }

  .ach-header {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .ach-tier-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ach-name {
    font-size: var(--text-sm);
    font-weight: 600;
    flex: 1;
  }

  .ach-check {
    color: #ffd700;
    font-weight: 700;
    font-size: var(--text-sm);
  }

  .ach-desc {
    font-size: var(--text-xs);
    line-height: 1.3;
  }

  .ach-reward {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: auto;
    padding-top: 2px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .ach-reward.active-reward {
    color: #ffd700;
  }

  .empty {
    text-align: center;
    padding: var(--space-xl);
    font-size: var(--text-base);
  }

  @media (max-width: 600px) {
    .achievement-grid {
      grid-template-columns: 1fr;
    }

    .filters {
      flex-direction: column;
    }

    .tier-summary {
      flex-direction: column;
      gap: var(--space-xs);
    }
  }
</style>
