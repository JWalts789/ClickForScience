<script lang="ts">
  import { getState, getRevision, doNeighborhoodFavor } from "../../stores/game.svelte";
  import { formatRP, formatNumber } from "../../lib/utils/format";
  import { formatTime } from "../../lib/utils/time";
  import { NPCS, MAX_RELATIONSHIP, getNPCFlavorText } from "../../lib/data/neighborhood.data";
  import { getRelationship, canDoFavor, getFavorCooldownRemaining } from "../../lib/engine/neighborhood";

  const state = $derived(getState());
  const rev = $derived(getRevision());
  const notation = $derived(state.settings.notation);

  function onDoFavor(npcId: string, favorId: string) {
    doNeighborhoodFavor(npcId, favorId);
  }
</script>

<div class="neighborhood-tab">
  <h2 class="section-title">The Neighborhood</h2>
  <p class="section-desc text-muted">
    Build relationships with your neighbors for permanent bonuses.
    Do favors to increase your standing. Everyone has something to offer.
  </p>

  <div class="npc-grid">
    {#each NPCS as npc (npc.id)}
      {@const level = getRelationship(state, npc.id)}
      {@const flavor = getNPCFlavorText(npc, level)}
      {@const isMaxed = level >= MAX_RELATIONSHIP}
      <div class="npc-card" class:maxed={isMaxed}>
        <div class="npc-header">
          <span class="npc-portrait">{npc.portrait}</span>
          <div class="npc-identity">
            <span class="npc-name">{npc.name}</span>
            <span class="npc-title text-muted">{npc.title}</span>
          </div>
          <div class="npc-level">
            <span class="level-number" class:maxed={isMaxed}>{level}</span>
            <span class="level-label text-muted">/ {MAX_RELATIONSHIP}</span>
          </div>
        </div>

        <!-- Relationship bar -->
        <div class="rel-bar-bg">
          <div
            class="rel-bar-fill"
            class:maxed={isMaxed}
            style:width="{(level / MAX_RELATIONSHIP) * 100}%"
          ></div>
        </div>

        <!-- Flavor text -->
        <p class="npc-flavor text-muted">{flavor}</p>

        <!-- Bonuses -->
        <div class="npc-bonuses">
          {#each npc.bonuses as bonus}
            <div class="bonus-row">
              <span class="bonus-desc">{bonus.description}</span>
              <span class="bonus-progress mono">
                {#if level > 0}
                  {Math.round((level / MAX_RELATIONSHIP) * 100)}%
                {:else}
                  —
                {/if}
              </span>
            </div>
          {/each}
        </div>

        <!-- Favors -->
        {#if !isMaxed}
          <div class="npc-favors">
            {#each npc.favors as favor (favor.id)}
              {@const available = canDoFavor(state, npc.id, favor.id)}
              {@const cooldown = getFavorCooldownRemaining(state, favor.id)}
              {@const onCooldown = cooldown > 0}
              {@const canAfford = favor.costType === "rp" ? state.rp.gte(favor.cost) : state.ip.gte(favor.cost)}
              <div class="favor-row">
                <div class="favor-info">
                  <span class="favor-name">{favor.name}</span>
                  <span class="favor-desc text-muted">{favor.description}</span>
                </div>
                <div class="favor-action">
                  {#if onCooldown}
                    <span class="favor-cooldown text-muted mono">{formatTime(cooldown)}</span>
                  {:else}
                    <button
                      class="favor-btn"
                      class:affordable={canAfford}
                      disabled={!available}
                      onclick={() => onDoFavor(npc.id, favor.id)}
                    >
                      <span class="favor-cost mono">
                        {favor.costType === "rp"
                          ? formatRP(favor.cost, notation) + " RP"
                          : formatNumber(favor.cost, notation) + " IP"}
                      </span>
                      <span class="favor-gain">+{favor.relationshipGain}</span>
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="npc-maxed-badge">Max Relationship</div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .neighborhood-tab {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
  }

  .section-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: #c3e88d;
    margin-bottom: var(--space-xs);
  }

  .section-desc {
    font-size: var(--text-sm);
    margin-bottom: var(--space-lg);
  }

  .npc-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .npc-card {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    padding: var(--space-md);
    transition: all var(--transition-fast);
  }

  .npc-card:hover {
    border-color: rgba(195, 232, 141, 0.3);
  }

  .npc-card.maxed {
    border-color: rgba(195, 232, 141, 0.4);
    background: rgba(195, 232, 141, 0.03);
  }

  .npc-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-xs);
  }

  .npc-portrait {
    font-size: 1.5rem;
    width: 36px;
    text-align: center;
  }

  .npc-identity {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .npc-name {
    font-weight: 700;
    font-size: var(--text-base);
  }

  .npc-title {
    font-size: var(--text-xs);
  }

  .npc-level {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .level-number {
    font-size: var(--text-lg);
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .level-number.maxed {
    color: #c3e88d;
  }

  .level-label {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
  }

  .rel-bar-bg {
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: var(--space-sm);
  }

  .rel-bar-fill {
    height: 100%;
    background: #c3e88d;
    border-radius: 2px;
    transition: width 300ms ease;
    opacity: 0.7;
  }

  .rel-bar-fill.maxed {
    opacity: 1;
    box-shadow: 0 0 6px rgba(195, 232, 141, 0.5);
  }

  .npc-flavor {
    font-size: var(--text-xs);
    font-style: italic;
    margin-bottom: var(--space-sm);
    line-height: 1.4;
  }

  .npc-bonuses {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-sm);
  }

  .bonus-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-xs);
  }

  .bonus-desc {
    color: var(--text-secondary);
  }

  .bonus-progress {
    color: #c3e88d;
    font-size: 0.65rem;
  }

  .npc-favors {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .favor-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .favor-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .favor-name {
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .favor-desc {
    font-size: 0.65rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .favor-action {
    flex-shrink: 0;
  }

  .favor-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3px var(--space-sm);
    font-size: var(--text-xs);
    border-color: var(--border-color);
    min-width: 80px;
  }

  .favor-btn.affordable {
    border-color: #c3e88d;
    color: #c3e88d;
  }

  .favor-btn.affordable:hover:not(:disabled) {
    background: rgba(195, 232, 141, 0.1);
    box-shadow: 0 0 8px rgba(195, 232, 141, 0.15);
  }

  .favor-cost {
    font-size: 0.65rem;
  }

  .favor-gain {
    font-size: 0.6rem;
    color: #c3e88d;
    font-weight: 600;
  }

  .favor-cooldown {
    font-size: var(--text-xs);
  }

  .npc-maxed-badge {
    text-align: center;
    font-size: var(--text-xs);
    font-weight: 600;
    color: #c3e88d;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--space-xs);
    border: 1px solid rgba(195, 232, 141, 0.3);
    border-radius: var(--radius-sm);
    background: rgba(195, 232, 141, 0.05);
  }

  @media (max-width: 600px) {
    .favor-row {
      flex-direction: column;
      align-items: stretch;
    }

    .favor-btn {
      width: 100%;
      flex-direction: row;
      justify-content: center;
      gap: var(--space-sm);
    }
  }
</style>
