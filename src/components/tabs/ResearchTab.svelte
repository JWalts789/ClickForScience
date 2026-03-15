<script lang="ts">
  import { getState, getIPPerSec, getRevision, doStartResearch, doCancelResearch, doLabExpansion } from "../../stores/game.svelte";
  import { formatNumber, formatRate } from "../../lib/utils/format";
  import { formatTime } from "../../lib/utils/time";
  import { isResearchAvailable, isResearchComplete, isResearchVisible, researchSpeedMultiplier } from "../../lib/engine/research";
  import { RESEARCH_NODES, RESEARCH_TIERS, getResearchNodeDef } from "../../lib/data/research.data";
  import { LAB_EXPANSIONS, getNextLabExpansion, MAX_LAB_LEVEL, getLabExpansionDef } from "../../lib/data/lab-expansions.data";
  import { canPurchaseLabExpansion } from "../../lib/engine/lab-expansion";
  import type { ResearchNodeDef } from "../../lib/data/research.data";
  import { Decimal } from "../../lib/utils/decimal";

  const state = $derived(getState());
  const rev = $derived(getRevision());
  const notation = $derived(state.settings.notation);
  const ipPerSec = $derived(getIPPerSec());

  // Group nodes by tier for rendering
  const tiers = $derived.by(() => {
    void rev;
    return RESEARCH_TIERS.map((tier) => ({
      tier,
      nodes: RESEARCH_NODES.filter(
        (n) => n.tier === tier && isResearchVisible(state, n.id)
      ),
    })).filter((t) => t.nodes.length > 0);
  });

  // Active research progress
  const activeResearch = $derived(state.activeResearch);
  const activeNodeDef = $derived(
    activeResearch ? getResearchNodeDef(activeResearch.nodeId) : null
  );
  const researchProgress = $derived.by(() => {
    void rev; // re-derive every tick
    if (!activeResearch || !activeNodeDef) return 0;
    const total = activeNodeDef.researchTimeSec;
    const remaining = activeResearch.remainingSec;
    return Math.min(1, Math.max(0, (total - remaining) / total));
  });
  // Wall-clock seconds remaining (remainingSec ticks down at speedMult rate)
  const researchWallTimeRemaining = $derived.by(() => {
    void rev; // re-derive every tick
    if (!activeResearch) return 0;
    const speed = researchSpeedMultiplier(state).toNumber();
    return speed > 0 ? activeResearch.remainingSec / speed : activeResearch.remainingSec;
  });

  // Selected node for detail panel
  let selectedNode = $state<ResearchNodeDef | null>(null);

  // Lab expansion
  const currentLabDef = $derived(getLabExpansionDef(state.labLevel));
  const nextLabDef = $derived(getNextLabExpansion(state.labLevel));
  const canExpandLab = $derived.by(() => { void rev; return canPurchaseLabExpansion(state); });

  function onExpandLab() {
    doLabExpansion();
  }

  function nodeStatus(node: ResearchNodeDef): "completed" | "active" | "available" | "locked" {
    void rev;
    if (isResearchComplete(state, node.id)) return "completed";
    if (activeResearch?.nodeId === node.id) return "active";
    if (isResearchAvailable(state, node.id)) return "available";
    return "locked";
  }

  function canAfford(node: ResearchNodeDef): boolean {
    return state.ip.gte(node.ipCost);
  }

  function onNodeClick(node: ResearchNodeDef) {
    selectedNode = selectedNode?.id === node.id ? null : node;
  }

  function onStartResearch() {
    if (!selectedNode) return;
    doStartResearch(selectedNode.id);
  }

  function onCancelResearch() {
    doCancelResearch();
  }

  function tierLabel(tier: number): string {
    const labels: Record<number, string> = {
      1: "Foundation",
      2: "Applied Science",
      3: "Advanced Theory",
      4: "Breakthrough Research",
      5: "Transcendent Knowledge",
      6: "Endgame",
    };
    return labels[tier] ?? `Tier ${tier}`;
  }

  function effectSummary(node: ResearchNodeDef): string {
    return node.effects.map((e) => {
      if (e.type === "globalMultiplier") return `${e.multiplier}x all production`;
      if (e.type === "generatorMultiplier") return `${e.multiplier}x ${e.target}`;
      if (e.type === "clickMultiplier") return `${e.multiplier}x click`;
      if (e.type === "clickPercentOfProduction") return `+${e.percent}% prod/click`;
      if (e.type === "ipGainMultiplier") return `${e.multiplier}x IP gain`;
      if (e.type === "researchSpeedMultiplier") return `${e.multiplier}x research speed`;
      if (e.type === "bpGainMultiplier") return `${e.multiplier}x BP gain`;
      if (e.type === "offlineEfficiencyBonus") return `+${(e.bonus * 100).toFixed(0)}% offline`;
      return "";
    }).filter(Boolean).join(", ");
  }

  function estimatedTime(node: ResearchNodeDef): string {
    const speed = researchSpeedMultiplier(state).toNumber();
    const secs = node.researchTimeSec / speed;
    return formatTime(secs);
  }
</script>

<div class="research-tab">
  <!-- IP Header -->
  <div class="ip-header">
    <div class="ip-display">
      <span class="ip-label">Insight Points</span>
      <span class="ip-value mono">{formatNumber(state.ip, notation)} IP</span>
    </div>
    <div class="ip-rate">
      <span class="ip-label">IP Rate</span>
      <span class="ip-rate-value mono">{formatRate(ipPerSec, notation)} IP</span>
    </div>
  </div>

  <!-- Active Research Bar -->
  {#if activeResearch && activeNodeDef}
    <div class="active-research card">
      <div class="active-header">
        <span class="active-label">Researching:</span>
        <span class="active-name">{activeNodeDef.name}</span>
        <button class="cancel-btn" onclick={onCancelResearch}>Cancel (50% refund)</button>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: {researchProgress * 100}%"></div>
      </div>
      <div class="active-footer text-muted">
        {(researchProgress * 100).toFixed(1)}% — {formatTime(researchWallTimeRemaining)} remaining
      </div>
    </div>
  {/if}

  <!-- Corkboard Title -->
  <div class="corkboard-header">
    <h2 class="corkboard-title">Gary's Corkboard</h2>
    <p class="corkboard-desc text-muted">
      Red string connects the ideas. Some of them are even good.
    </p>
  </div>

  <!-- Research Tree by Tier -->
  {#each tiers as { tier, nodes }}
    <div class="tier-section">
      <h3 class="tier-label">Tier {tier}: {tierLabel(tier)}</h3>
      <div class="node-grid">
        {#each nodes as node (node.id)}
          {@const status = nodeStatus(node)}
          {@const isSelected = selectedNode?.id === node.id}
          <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
          <div
            class="node-card {status}"
            class:selected={isSelected}
            class:archetype-node={!!node.archetypeRequired}
            onclick={() => onNodeClick(node)}
          >
            <div class="node-header">
              <span class="node-name">{node.name}</span>
              {#if status === "completed"}
                <span class="node-badge completed-badge">Done</span>
              {:else if status === "active"}
                <span class="node-badge active-badge">Active</span>
              {:else if node.persistsOnPrestige}
                <span class="node-badge persist-badge">Permanent</span>
              {/if}
            </div>
            <div class="node-desc text-muted">{node.description}</div>
            {#if status !== "completed" && status !== "active"}
              <div class="node-cost mono" class:affordable={canAfford(node) && status === "available"}>
                {formatNumber(new Decimal(node.ipCost), notation)} IP
              </div>
            {/if}
            {#if node.archetypeRequired && status === "locked"}
              <div class="node-archetype-req text-muted">
                Requires: {node.archetypeRequired}
              </div>
            {/if}
            {#if node.exclusive && node.exclusive.length > 0 && status !== "completed"}
              <div class="node-exclusive text-muted">Exclusive choice</div>
            {/if}
          </div>

          <!-- Inline detail panel (appears directly under the clicked node) -->
          {#if isSelected}
            <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
            <div class="detail-panel card" onclick={(e) => e.stopPropagation()}>
              <div class="detail-header">
                <h3 class="detail-name">{node.name}</h3>
                <button class="detail-close" onclick={() => selectedNode = null}>x</button>
              </div>
              <p class="detail-flavor">"{node.flavorText}"</p>
              <p class="detail-desc">{node.description}</p>

              <div class="detail-meta">
                <div class="meta-row">
                  <span class="meta-label">Effects:</span>
                  <span class="meta-value">{effectSummary(node)}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Cost:</span>
                  <span class="meta-value mono">{formatNumber(new Decimal(node.ipCost), notation)} IP</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Research Time:</span>
                  <span class="meta-value">{estimatedTime(node)}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Persists on Prestige:</span>
                  <span class="meta-value">{node.persistsOnPrestige ? "Yes" : "No (resets each run)"}</span>
                </div>
                {#if node.requires.length > 0}
                  <div class="meta-row">
                    <span class="meta-label">Requires:</span>
                    <span class="meta-value">
                      {node.requires.map((r) => getResearchNodeDef(r)?.name ?? r).join(", ")}
                    </span>
                  </div>
                {/if}
                {#if node.requiresAny && node.requiresAny.length > 0}
                  <div class="meta-row">
                    <span class="meta-label">Requires (any):</span>
                    <span class="meta-value">
                      {node.requiresAny.map((r) => getResearchNodeDef(r)?.name ?? r).join(" or ")}
                    </span>
                  </div>
                {/if}
                {#if node.exclusive && node.exclusive.length > 0}
                  <div class="meta-row">
                    <span class="meta-label">Exclusive with:</span>
                    <span class="meta-value text-warning">
                      {node.exclusive.map((r) => getResearchNodeDef(r)?.name ?? r).join(", ")}
                    </span>
                  </div>
                {/if}
                {#if node.archetypeRequired}
                  <div class="meta-row">
                    <span class="meta-label">Archetype:</span>
                    <span class="meta-value">{node.archetypeRequired}</span>
                  </div>
                {/if}
              </div>

              {#if status === "available" && !activeResearch}
                <button
                  class="start-btn"
                  disabled={!canAfford(node)}
                  onclick={onStartResearch}
                >
                  {canAfford(node) ? "Start Research" : "Not enough IP"}
                </button>
              {:else if status === "available" && activeResearch}
                <p class="detail-hint text-muted">Finish current research first.</p>
              {:else if status === "completed"}
                <p class="detail-hint text-rp">Research complete!</p>
              {:else if status === "active"}
                <p class="detail-hint">Currently researching... {(researchProgress * 100).toFixed(1)}%</p>
              {:else}
                <p class="detail-hint text-muted">Prerequisites not met.</p>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/each}

  <!-- Lab Expansion Section -->
  <div class="lab-section">
    <h3 class="lab-section-title">Lab Expansion</h3>
    {#if currentLabDef}
      <div class="lab-current card">
        <div class="lab-current-header">
          <span class="lab-current-name">{currentLabDef.name}</span>
          <span class="lab-level-badge">Level {currentLabDef.level}</span>
        </div>
        <p class="lab-current-desc text-muted">{currentLabDef.flavorText}</p>
        {#if currentLabDef.effects.length > 0}
          <div class="lab-effects">
            {#each currentLabDef.unlocks as unlock}
              <span class="lab-effect-pill">{unlock}</span>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if nextLabDef}
      <div class="lab-next card" class:affordable={canExpandLab}>
        <div class="lab-next-header">
          <div class="lab-next-info">
            <span class="lab-next-name">Next: {nextLabDef.name}</span>
            <span class="lab-next-desc text-muted">{nextLabDef.description}</span>
          </div>
          <button
            class="lab-expand-btn"
            class:primary={canExpandLab}
            disabled={!canExpandLab}
            onclick={onExpandLab}
          >
            <span class="lab-expand-cost mono">{formatNumber(nextLabDef.ipCost, notation)} IP</span>
            <span class="lab-expand-label">Expand</span>
          </button>
        </div>
        <div class="lab-effects">
          {#each nextLabDef.unlocks as unlock}
            <span class="lab-effect-pill preview">{unlock}</span>
          {/each}
        </div>
      </div>
    {:else if state.labLevel >= MAX_LAB_LEVEL}
      <p class="lab-maxed text-muted">Maximum lab expansion reached. The sky is no longer the limit.</p>
    {/if}
  </div>
</div>

<style>
  .research-tab {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
  }

  /* IP Header */
  .ip-header {
    display: flex;
    justify-content: center;
    gap: var(--space-xl);
    margin-bottom: var(--space-lg);
    padding: var(--space-md) var(--space-lg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    backdrop-filter: blur(4px);
  }

  .ip-display, .ip-rate {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ip-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ip-value {
    font-size: var(--text-xl);
    font-weight: 700;
    color: #ffcb6b;
  }

  .ip-rate-value {
    font-size: var(--text-lg);
    color: #ffcb6b;
    opacity: 0.8;
  }

  /* Active Research */
  .active-research {
    margin-bottom: var(--space-lg);
    padding: var(--space-md);
    border-color: #ffcb6b;
  }

  .active-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
    flex-wrap: wrap;
  }

  .active-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .active-name {
    font-weight: 600;
    color: #ffcb6b;
    flex: 1;
  }

  .cancel-btn {
    font-size: var(--text-xs);
    padding: 2px var(--space-sm);
    border-color: var(--color-danger);
    color: var(--color-danger);
  }

  .cancel-btn:hover:not(:disabled) {
    background: rgba(255, 83, 112, 0.15);
  }

  .progress-bar-container {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: var(--space-xs);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ffcb6b, #f0a030);
    border-radius: 3px;
    transition: width 0.3s linear;
  }

  .active-footer {
    font-size: var(--text-xs);
    text-align: center;
  }

  /* Corkboard Header */
  .corkboard-header {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .corkboard-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: #ffcb6b;
  }

  .corkboard-desc {
    font-size: var(--text-sm);
  }

  /* Tier Sections */
  .tier-section {
    margin-bottom: var(--space-lg);
  }

  .tier-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #ffcb6b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-sm);
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid rgba(255, 203, 107, 0.2);
  }

  .node-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-sm);
  }

  /* Node Cards */
  .node-card {
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 80px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .node-card:hover {
    border-color: rgba(255, 203, 107, 0.4);
  }

  .node-card.selected {
    border-color: #ffcb6b;
    box-shadow: 0 0 12px rgba(255, 203, 107, 0.2);
  }

  .node-card.locked {
    opacity: 0.45;
  }

  .node-card.completed {
    border-color: rgba(130, 170, 255, 0.4);
    background: rgba(130, 170, 255, 0.05);
  }

  .node-card.active {
    border-color: #ffcb6b;
    background: rgba(255, 203, 107, 0.08);
    animation: research-pulse 2s ease-in-out infinite;
  }

  .node-card.available {
    border-color: rgba(255, 203, 107, 0.3);
  }

  .node-card.archetype-node {
    border-left: 3px solid rgba(199, 146, 234, 0.5);
  }

  @keyframes research-pulse {
    0%, 100% { box-shadow: 0 0 8px rgba(255, 203, 107, 0.1); }
    50% { box-shadow: 0 0 16px rgba(255, 203, 107, 0.3); }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .node-name {
    font-size: var(--text-sm);
    font-weight: 600;
    flex: 1;
    min-width: 0;
  }

  .node-badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .completed-badge {
    background: rgba(130, 170, 255, 0.2);
    color: #82aaff;
  }

  .active-badge {
    background: rgba(255, 203, 107, 0.2);
    color: #ffcb6b;
  }

  .persist-badge {
    background: rgba(195, 232, 141, 0.15);
    color: #c3e88d;
  }

  .node-desc {
    font-size: var(--text-xs);
    line-height: 1.3;
  }

  .node-cost {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: auto;
  }

  .node-cost.affordable {
    color: #ffcb6b;
  }

  .node-archetype-req {
    font-size: 10px;
    font-style: italic;
  }

  .node-exclusive {
    font-size: 10px;
    color: var(--color-warning);
  }

  /* Detail Panel (inline under selected node) */
  .detail-panel {
    grid-column: 1 / -1;
    padding: var(--space-md) var(--space-lg);
    border-color: #ffcb6b;
    background: rgba(26, 29, 39, 0.95);
    backdrop-filter: blur(8px);
    animation: detail-slide-in 200ms ease;
  }

  @keyframes detail-slide-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
  }

  .detail-name {
    font-size: var(--text-base);
    font-weight: 700;
    color: #ffcb6b;
  }

  .detail-close {
    font-size: var(--text-sm);
    padding: 2px 8px;
    border: 1px solid var(--border-color);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .detail-close:hover {
    color: var(--text-primary);
  }

  .detail-flavor {
    font-style: italic;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin-bottom: var(--space-sm);
  }

  .detail-desc {
    font-size: var(--text-sm);
    margin-bottom: var(--space-md);
  }

  .detail-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: var(--space-md);
  }

  .meta-row {
    display: flex;
    gap: var(--space-sm);
    font-size: var(--text-xs);
  }

  .meta-label {
    color: var(--text-muted);
    min-width: 120px;
    flex-shrink: 0;
  }

  .meta-value {
    color: var(--text-secondary);
  }

  .text-warning {
    color: var(--color-warning);
  }

  .text-rp {
    color: var(--color-rp);
  }

  .start-btn {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    font-weight: 700;
    border-color: #ffcb6b;
    color: #ffcb6b;
    transition: all var(--transition-fast);
  }

  .start-btn:hover:not(:disabled) {
    background: rgba(255, 203, 107, 0.15);
    box-shadow: 0 0 20px rgba(255, 203, 107, 0.2);
  }

  .start-btn:disabled {
    opacity: 0.4;
  }

  .detail-hint {
    font-size: var(--text-sm);
    text-align: center;
  }

  /* Lab Expansion Section */
  .lab-section {
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border-color);
  }

  .lab-section-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-ip);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-sm);
  }

  .lab-current {
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-sm);
  }

  .lab-current-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xs);
  }

  .lab-current-name {
    font-weight: 600;
    color: var(--color-ip);
  }

  .lab-level-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.05);
    padding: 1px var(--space-xs);
    border-radius: var(--radius-sm);
  }

  .lab-current-desc {
    font-size: var(--text-xs);
    font-style: italic;
    line-height: 1.4;
    margin-bottom: var(--space-xs);
  }

  .lab-effects {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .lab-effect-pill {
    font-size: var(--text-xs);
    padding: 1px var(--space-xs);
    border-radius: var(--radius-sm);
    background: rgba(255, 203, 107, 0.1);
    color: var(--color-ip);
    border: 1px solid rgba(255, 203, 107, 0.2);
  }

  .lab-effect-pill.preview {
    opacity: 0.6;
    border-style: dashed;
  }

  .lab-next {
    padding: var(--space-sm) var(--space-md);
    border-style: dashed;
    transition: border-color var(--transition-fast);
  }

  .lab-next.affordable {
    border-color: var(--color-ip);
    border-style: solid;
  }

  .lab-next-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-xs);
  }

  .lab-next-info {
    flex: 1;
    min-width: 0;
  }

  .lab-next-name {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .lab-next-desc {
    font-size: var(--text-xs);
    display: block;
  }

  .lab-expand-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-xs) var(--space-md);
    min-width: 90px;
  }

  .lab-expand-cost {
    font-size: var(--text-xs);
  }

  .lab-expand-label {
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .lab-maxed {
    text-align: center;
    font-size: var(--text-xs);
    padding: var(--space-md);
    font-style: italic;
  }

  @media (max-width: 600px) {
    .ip-header {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .node-grid {
      grid-template-columns: 1fr;
    }

    .meta-row {
      flex-direction: column;
      gap: 2px;
    }

    .meta-label {
      min-width: unset;
    }

    .lab-next-header {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
