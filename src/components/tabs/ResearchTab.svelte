<script lang="ts">
  import { onMount } from "svelte";
  import { getState, getIPPerSec, getRevision, doStartResearch, doCancelResearch, doLabExpansion } from "../../stores/game.svelte";
  import { formatNumber, formatRate } from "../../lib/utils/format";
  import { formatTime } from "../../lib/utils/time";
  import { isResearchAvailable, isResearchComplete, isResearchVisible, researchSpeedMultiplier } from "../../lib/engine/research";
  import { RESEARCH_NODES, RESEARCH_TIERS, MAX_TREE_COL, getResearchNodeDef } from "../../lib/data/research.data";
  import { getNextLabExpansion, MAX_LAB_LEVEL, getLabExpansionDef } from "../../lib/data/lab-expansions.data";
  import { canPurchaseLabExpansion } from "../../lib/engine/lab-expansion";
  import type { ResearchNodeDef } from "../../lib/data/research.data";
  import { Decimal } from "../../lib/utils/decimal";

  const state = $derived(getState());
  const rev = $derived(getRevision());
  const notation = $derived(state.settings.notation);
  const ipPerSec = $derived(getIPPerSec());

  // ── Tree Layout Constants ──────────────────────────────────────────
  const CELL_W = 180;
  const CELL_H = 200;
  const NODE_W = 158;
  const NODE_H = 105;
  const PADDING = 50;
  const DETAIL_H = 280;

  let selectedNode = $state<ResearchNodeDef | null>(null);

  const visibleNodes = $derived.by(() => {
    void rev;
    return RESEARCH_NODES.filter((n) => isResearchVisible(state, n.id));
  });

  // Extra height for detail panel when shown
  const detailExtraHeight = $derived(selectedNode ? DETAIL_H + 20 : 0);

  const canvasWidth = $derived(
    Math.max(800, (MAX_TREE_COL + 1) * CELL_W + PADDING * 2)
  );
  const canvasHeight = $derived(
    RESEARCH_TIERS.length * CELL_H + PADDING * 2 + detailExtraHeight
  );

  function nodeX(n: ResearchNodeDef): number {
    return PADDING + n.treeCol * CELL_W + (CELL_W - NODE_W) / 2;
  }
  function nodeY(n: ResearchNodeDef): number {
    // Shift nodes below the selected node's tier down to make room for the detail panel
    let base = PADDING + (n.tier - 1) * CELL_H + (CELL_H - NODE_H) / 2;
    if (selectedNode && n.tier > selectedNode.tier) {
      base += detailExtraHeight;
    }
    return base;
  }
  function nodeCenterX(n: ResearchNodeDef): number {
    return nodeX(n) + NODE_W / 2;
  }

  // Build prerequisite connection lines
  const connections = $derived.by(() => {
    void rev;
    const lines: { x1: number; y1: number; x2: number; y2: number; status: string }[] = [];
    const visibleSet = new Set(visibleNodes.map((n) => n.id));

    for (const node of visibleNodes) {
      const childStatus = nodeStatus(node);
      const allReqs = [...node.requires, ...(node.requiresAny ?? [])];
      for (const reqId of allReqs) {
        if (!visibleSet.has(reqId)) continue;
        const parent = getResearchNodeDef(reqId);
        if (!parent) continue;

        const completed = childStatus === "completed" || childStatus === "active";
        const parentCompleted = isResearchComplete(state, reqId);

        lines.push({
          x1: nodeCenterX(parent),
          y1: nodeY(parent) + NODE_H,
          x2: nodeCenterX(node),
          y2: nodeY(node),
          status: completed ? "completed" : parentCompleted ? "available" : "locked",
        });
      }
    }
    return lines;
  });

  // Active research progress
  const activeResearch = $derived(state.activeResearch);
  const activeNodeDef = $derived(
    activeResearch ? getResearchNodeDef(activeResearch.nodeId) : null
  );
  const researchProgress = $derived.by(() => {
    void rev;
    if (!activeResearch || !activeNodeDef) return 0;
    const total = activeNodeDef.researchTimeSec;
    const remaining = activeResearch.remainingSec;
    return Math.min(1, Math.max(0, (total - remaining) / total));
  });
  const researchWallTimeRemaining = $derived.by(() => {
    void rev;
    if (!activeResearch) return 0;
    const speed = researchSpeedMultiplier(state).toNumber();
    return speed > 0 ? activeResearch.remainingSec / speed : activeResearch.remainingSec;
  });

  // Lab expansion
  const currentLabDef = $derived(getLabExpansionDef(state.labLevel));
  const nextLabDef = $derived(getNextLabExpansion(state.labLevel));
  const canExpandLab = $derived.by(() => { void rev; return canPurchaseLabExpansion(state); });

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

  function effectSummary(node: ResearchNodeDef): string {
    if (node.effects.length === 0) return "Unlock only";
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

  function tierLabel(tier: number): string {
    const labels: Record<number, string> = {
      1: "Foundation", 2: "Applied Science", 3: "Advanced Theory",
      4: "Breakthrough", 5: "Transcendent", 6: "Endgame",
    };
    return labels[tier] ?? `Tier ${tier}`;
  }

  // Node branch color (subtle tint based on position)
  function nodeGlow(node: ResearchNodeDef): string {
    if (node.archetypeRequired) return "199, 146, 234"; // purple
    if (node.treeCol <= 6) return "195, 232, 141";      // green - production/click left
    if (node.treeCol <= 14) return "255, 203, 107";      // gold - trunk/synergy
    return "130, 170, 255";                              // blue - insight/efficiency right
  }

  function connectionPath(c: { x1: number; y1: number; x2: number; y2: number }): string {
    const dy = c.y2 - c.y1;
    const cp = Math.min(dy * 0.45, 80);
    return `M ${c.x1} ${c.y1} C ${c.x1} ${c.y1 + cp}, ${c.x2} ${c.y2 - cp}, ${c.x2} ${c.y2}`;
  }

  // Detail panel position (below the selected node)
  const detailX = $derived(
    selectedNode ? Math.max(8, nodeCenterX(selectedNode) - 170) : 0
  );
  const detailY = $derived(
    selectedNode ? nodeY(selectedNode) + NODE_H + 10 : 0
  );

  // ── Pan / Drag ──────────────────────────────────────────────────
  let containerEl = $state<HTMLDivElement | undefined>();
  let isPanning = $state(false);
  let panStartX = 0;
  let panStartY = 0;
  let scrollStartX = 0;
  let scrollStartY = 0;

  function onPanStart(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".tree-node, .detail-panel, button")) return;
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    scrollStartX = containerEl?.scrollLeft ?? 0;
    scrollStartY = containerEl?.scrollTop ?? 0;
    document.addEventListener("pointermove", onPanMove);
    document.addEventListener("pointerup", onPanEnd);
  }

  function onPanMove(e: PointerEvent) {
    if (!isPanning || !containerEl) return;
    containerEl.scrollLeft = scrollStartX - (e.clientX - panStartX);
    containerEl.scrollTop = scrollStartY - (e.clientY - panStartY);
  }

  function onPanEnd() {
    isPanning = false;
    document.removeEventListener("pointermove", onPanMove);
    document.removeEventListener("pointerup", onPanEnd);
  }

  onMount(() => {
    if (containerEl) {
      const centerCol = 10;
      containerEl.scrollLeft = Math.max(0, centerCol * CELL_W - containerEl.clientWidth / 2);
    }
  });
</script>

<div class="research-tab">
  <!-- IP Header -->
  <div class="ip-header">
    <div class="ip-col">
      <span class="ip-tiny">Insight Points</span>
      <span class="ip-value mono">{formatNumber(state.ip, notation)}</span>
    </div>
    <div class="ip-divider"></div>
    <div class="ip-col">
      <span class="ip-tiny">IP / sec</span>
      <span class="ip-rate-value mono">{formatRate(ipPerSec, notation)}</span>
    </div>
    <div class="ip-divider"></div>
    <div class="ip-col">
      <span class="ip-tiny">Researched</span>
      <span class="ip-count mono">{state.completedResearch.length + state.runCompletedResearch.length}<span class="ip-total">/{RESEARCH_NODES.length}</span></span>
    </div>
  </div>

  <!-- Active Research Bar -->
  {#if activeResearch && activeNodeDef}
    <div class="active-research">
      <div class="active-top">
        <span class="active-icon">&#9881;</span>
        <span class="active-name">{activeNodeDef.name}</span>
        <span class="active-pct mono">{(researchProgress * 100).toFixed(0)}%</span>
        <button class="cancel-btn" onclick={onCancelResearch}>Cancel</button>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: {researchProgress * 100}%"></div>
      </div>
      <div class="active-bottom text-muted">
        {formatTime(researchWallTimeRemaining)} remaining
      </div>
    </div>
  {/if}

  <!-- Corkboard Title -->
  <div class="corkboard-header">
    <h2 class="corkboard-title">Gary's Corkboard</h2>
    <p class="corkboard-sub text-muted">Drag to pan &middot; Click a node for details</p>
  </div>

  <!-- Tree Viewport -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="tree-viewport"
    bind:this={containerEl}
    onpointerdown={onPanStart}
    class:panning={isPanning}
  >
    <div
      class="tree-canvas"
      style="width: {canvasWidth}px; height: {canvasHeight}px;"
    >
      <!-- SVG Layer -->
      <svg class="tree-svg" width={canvasWidth} height={canvasHeight}>
        <defs>
          <!-- Glow filter for active connections -->
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="grad-completed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#82aaff" />
            <stop offset="100%" stop-color="#6a8fdb" />
          </linearGradient>
          <linearGradient id="grad-available" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffcb6b" />
            <stop offset="100%" stop-color="#f0a030" />
          </linearGradient>
        </defs>

        <!-- Tier divider lines -->
        {#each RESEARCH_TIERS as tier}
          {@const y = PADDING + (tier - 1) * CELL_H + (selectedNode && tier > selectedNode.tier ? detailExtraHeight : 0)}
          <line
            x1="0" y1={y - 2} x2={canvasWidth} y2={y - 2}
            stroke="rgba(255,203,107,0.06)" stroke-width="1"
          />
        {/each}

        <!-- Connection Lines -->
        {#each connections as c (c.x1 + ',' + c.y1 + ',' + c.x2 + ',' + c.y2)}
          {#if c.status === "completed"}
            <path d={connectionPath(c)} class="conn completed" fill="none" stroke="url(#grad-completed)" />
          {:else if c.status === "available"}
            <path d={connectionPath(c)} class="conn available" fill="none" stroke="url(#grad-available)" filter="url(#glow)" />
          {:else}
            <path d={connectionPath(c)} class="conn locked" fill="none" />
          {/if}
        {/each}
      </svg>

      <!-- Tier Labels -->
      {#each RESEARCH_TIERS as tier}
        {@const ty = PADDING + (tier - 1) * CELL_H + (selectedNode && tier > selectedNode.tier ? detailExtraHeight : 0)}
        <div class="tier-tag" style="top: {ty + 2}px;">
          <span class="tier-num">T{tier}</span>
          <span class="tier-text">{tierLabel(tier)}</span>
        </div>
      {/each}

      <!-- Node Cards -->
      {#each visibleNodes as node (node.id)}
        {@const status = nodeStatus(node)}
        {@const isSelected = selectedNode?.id === node.id}
        {@const glow = nodeGlow(node)}
        <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
        <div
          class="tree-node {status}"
          class:selected={isSelected}
          class:archetype-node={!!node.archetypeRequired}
          style="left: {nodeX(node)}px; top: {nodeY(node)}px; width: {NODE_W}px; --node-glow: {glow};"
          onclick={() => onNodeClick(node)}
        >
          <div class="node-top-bar {status}"></div>
          <div class="node-title">
            {node.name}
          </div>
          <div class="node-badges">
            {#if status === "completed"}
              <span class="nbadge done">Completed</span>
            {:else if status === "active"}
              <span class="nbadge researching">Researching</span>
            {:else if node.persistsOnPrestige}
              <span class="nbadge perm">Permanent</span>
            {/if}
            {#if node.exclusive && node.exclusive.length > 0 && status !== "completed"}
              <span class="nbadge choice">Exclusive</span>
            {/if}
            {#if node.archetypeRequired}
              <span class="nbadge arch">{node.archetypeRequired}</span>
            {/if}
          </div>
          <div class="node-effect">{effectSummary(node)}</div>
          {#if status !== "completed" && status !== "active"}
            <div class="node-cost mono" class:affordable={canAfford(node) && status === "available"}>
              {formatNumber(new Decimal(node.ipCost), notation)} IP &middot; {estimatedTime(node)}
            </div>
          {/if}
        </div>
      {/each}

      <!-- Inline Detail Panel (positioned below clicked node) -->
      {#if selectedNode}
        {@const status = nodeStatus(selectedNode)}
        <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
        <div
          class="detail-panel"
          style="left: {detailX}px; top: {detailY}px;"
          onclick={(e) => e.stopPropagation()}
        >
          <div class="dp-arrow" style="left: {nodeCenterX(selectedNode) - detailX - 6}px;"></div>
          <div class="dp-header">
            <h3 class="dp-name">{selectedNode.name}</h3>
            <button class="dp-close" onclick={() => selectedNode = null}>&times;</button>
          </div>
          <p class="dp-flavor">"{selectedNode.flavorText}"</p>

          <div class="dp-grid">
            <span class="dp-label">Effects</span>
            <span class="dp-val">{effectSummary(selectedNode)}</span>
            <span class="dp-label">Cost</span>
            <span class="dp-val mono">{formatNumber(new Decimal(selectedNode.ipCost), notation)} IP</span>
            <span class="dp-label">Time</span>
            <span class="dp-val">{estimatedTime(selectedNode)}</span>
            <span class="dp-label">Prestige</span>
            <span class="dp-val">{selectedNode.persistsOnPrestige ? "Permanent" : "Resets each run"}</span>
            {#if selectedNode.requires.length > 0}
              <span class="dp-label">Requires</span>
              <span class="dp-val">{selectedNode.requires.map((r) => getResearchNodeDef(r)?.name ?? r).join(", ")}</span>
            {/if}
            {#if selectedNode.requiresAny && selectedNode.requiresAny.length > 0}
              <span class="dp-label">Requires (any)</span>
              <span class="dp-val">{selectedNode.requiresAny.map((r) => getResearchNodeDef(r)?.name ?? r).join(" or ")}</span>
            {/if}
            {#if selectedNode.exclusive && selectedNode.exclusive.length > 0}
              <span class="dp-label">Exclusive with</span>
              <span class="dp-val dp-warning">{selectedNode.exclusive.map((r) => getResearchNodeDef(r)?.name ?? r).join(", ")}</span>
            {/if}
          </div>

          {#if status === "available" && !activeResearch}
            <button class="dp-start" disabled={!canAfford(selectedNode)} onclick={onStartResearch}>
              {canAfford(selectedNode) ? "Start Research" : "Not enough IP"}
            </button>
          {:else if status === "available" && activeResearch}
            <p class="dp-hint text-muted">Finish current research first.</p>
          {:else if status === "completed"}
            <p class="dp-hint dp-done">Research complete</p>
          {:else if status === "active"}
            <div class="dp-active-bar">
              <div class="dp-active-fill" style="width: {researchProgress * 100}%"></div>
            </div>
            <p class="dp-hint">Researching... {(researchProgress * 100).toFixed(1)}%</p>
          {:else}
            <p class="dp-hint text-muted">Prerequisites not met.</p>
          {/if}
        </div>
      {/if}
    </div>
  </div>

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
            onclick={() => doLabExpansion()}
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
      <p class="lab-maxed text-muted">Maximum lab expansion reached.</p>
    {/if}
  </div>
</div>

<style>
  .research-tab {
    max-width: 100%;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
  }

  /* ── IP Header ─────────────────────────────────────────────────── */

  .ip-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-md);
    padding: var(--space-sm) var(--space-xl);
    border: 1px solid rgba(255, 203, 107, 0.15);
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, rgba(26, 29, 39, 0.85), rgba(40, 35, 50, 0.85));
    backdrop-filter: blur(6px);
  }

  .ip-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .ip-tiny {
    font-size: 9px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .ip-value {
    font-size: var(--text-xl);
    font-weight: 700;
    color: #ffcb6b;
    text-shadow: 0 0 12px rgba(255, 203, 107, 0.3);
  }

  .ip-rate-value {
    font-size: var(--text-base);
    color: #ffcb6b;
    opacity: 0.75;
  }

  .ip-count {
    font-size: var(--text-base);
    color: #82aaff;
  }

  .ip-total {
    color: var(--text-muted);
    font-size: var(--text-xs);
  }

  .ip-divider {
    width: 1px;
    height: 28px;
    background: rgba(255, 255, 255, 0.08);
  }

  /* ── Active Research ────────────────────────────────────────────── */

  .active-research {
    margin-bottom: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid rgba(255, 203, 107, 0.25);
    border-radius: var(--radius-md);
    background: rgba(255, 203, 107, 0.04);
  }

  .active-top {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: 6px;
  }

  .active-icon {
    font-size: 14px;
    animation: spin 3s linear infinite;
    color: #ffcb6b;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .active-name {
    font-weight: 600;
    font-size: var(--text-sm);
    color: #ffcb6b;
    flex: 1;
  }

  .active-pct {
    font-size: var(--text-sm);
    color: #ffcb6b;
    font-weight: 700;
  }

  .cancel-btn {
    font-size: 10px;
    padding: 2px 8px;
    border: 1px solid rgba(255, 83, 112, 0.4);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-danger);
    cursor: pointer;
  }

  .cancel-btn:hover {
    background: rgba(255, 83, 112, 0.1);
  }

  .progress-track {
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffcb6b, #f0a030);
    border-radius: 2px;
    transition: width 0.3s linear;
    box-shadow: 0 0 8px rgba(255, 203, 107, 0.4);
  }

  .active-bottom {
    font-size: 10px;
    text-align: right;
  }

  /* ── Corkboard Header ──────────────────────────────────────────── */

  .corkboard-header {
    text-align: center;
    margin-bottom: var(--space-sm);
  }

  .corkboard-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: #ffcb6b;
    text-shadow: 0 0 20px rgba(255, 203, 107, 0.15);
  }

  .corkboard-sub {
    font-size: 11px;
  }

  /* ── Tree Viewport ─────────────────────────────────────────────── */

  .tree-viewport {
    position: relative;
    overflow: auto;
    border: 1px solid rgba(255, 203, 107, 0.1);
    border-radius: var(--radius-md);
    background:
      radial-gradient(circle at 30% 20%, rgba(199, 146, 234, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(130, 170, 255, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 203, 107, 0.02) 0%, transparent 60%),
      rgba(8, 10, 18, 0.92);
    background-image:
      radial-gradient(circle at 30% 20%, rgba(199, 146, 234, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(130, 170, 255, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 203, 107, 0.02) 0%, transparent 60%),
      radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 100% 100%, 24px 24px, 24px 24px;
    background-position: 0 0, 0 0, 0 0, 0 0, 12px 12px;
    height: 560px;
    cursor: grab;
    user-select: none;
  }

  .tree-viewport.panning {
    cursor: grabbing;
  }

  .tree-canvas {
    position: relative;
    min-width: 100%;
  }

  .tree-svg {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  /* ── Connection Lines ──────────────────────────────────────────── */

  .conn {
    stroke-width: 2;
  }

  .conn.completed {
    stroke-width: 2.5;
    opacity: 0.65;
  }

  .conn.available {
    stroke-width: 2;
    opacity: 0.6;
    stroke-dasharray: 6 3;
    animation: dash-flow 1.5s linear infinite;
  }

  @keyframes dash-flow {
    to { stroke-dashoffset: -18; }
  }

  .conn.locked {
    stroke: rgba(255, 255, 255, 0.06);
    stroke-width: 1;
    stroke-dasharray: 4 6;
  }

  /* ── Tier Labels ───────────────────────────────────────────────── */

  .tier-tag {
    position: absolute;
    left: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    pointer-events: none;
    z-index: 2;
  }

  .tier-num {
    font-size: 10px;
    font-weight: 800;
    color: rgba(255, 203, 107, 0.5);
    background: rgba(255, 203, 107, 0.06);
    padding: 1px 5px;
    border-radius: 4px;
  }

  .tier-text {
    font-size: 9px;
    color: rgba(255, 203, 107, 0.25);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── Tree Node Cards ───────────────────────────────────────────── */

  .tree-node {
    position: absolute;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    background: rgba(20, 22, 32, 0.92);
    cursor: pointer;
    transition: all 180ms ease;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .tree-node:hover {
    border-color: rgba(var(--node-glow), 0.5);
    box-shadow: 0 2px 16px rgba(var(--node-glow), 0.15);
    z-index: 5;
    transform: translateY(-2px);
  }

  .tree-node.selected {
    border-color: rgba(var(--node-glow), 0.7);
    box-shadow: 0 0 20px rgba(var(--node-glow), 0.25);
    z-index: 10;
    transform: translateY(-2px);
  }

  .tree-node.locked {
    opacity: 0.35;
  }

  .tree-node.locked:hover {
    opacity: 0.5;
  }

  .tree-node.completed {
    border-color: rgba(130, 170, 255, 0.3);
  }

  .tree-node.active {
    border-color: rgba(255, 203, 107, 0.5);
    animation: node-pulse 2.5s ease-in-out infinite;
  }

  .tree-node.available {
    border-color: rgba(255, 203, 107, 0.2);
  }

  .tree-node.archetype-node {
    border-left: 3px solid rgba(199, 146, 234, 0.5);
  }

  @keyframes node-pulse {
    0%, 100% { box-shadow: 0 2px 8px rgba(255, 203, 107, 0.1); }
    50% { box-shadow: 0 2px 20px rgba(255, 203, 107, 0.3); }
  }

  /* Top color bar on each card */
  .node-top-bar {
    height: 3px;
    width: 100%;
    flex-shrink: 0;
  }

  .node-top-bar.completed {
    background: linear-gradient(90deg, #82aaff, #6a8fdb);
  }

  .node-top-bar.active {
    background: linear-gradient(90deg, #ffcb6b, #f0a030);
    animation: bar-shimmer 2s ease-in-out infinite;
  }

  @keyframes bar-shimmer {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  .node-top-bar.available {
    background: linear-gradient(90deg, rgba(255, 203, 107, 0.4), rgba(255, 203, 107, 0.15));
  }

  .node-top-bar.locked {
    background: rgba(255, 255, 255, 0.04);
  }

  .node-title {
    font-weight: 600;
    font-size: 11px;
    line-height: 1.25;
    padding: 6px 8px 2px;
    color: var(--text-primary);
  }

  .node-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    padding: 0 8px;
  }

  .nbadge {
    font-size: 8px;
    padding: 1px 5px;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .nbadge.done {
    background: rgba(130, 170, 255, 0.15);
    color: #82aaff;
  }

  .nbadge.researching {
    background: rgba(255, 203, 107, 0.15);
    color: #ffcb6b;
  }

  .nbadge.perm {
    background: rgba(195, 232, 141, 0.1);
    color: #c3e88d;
  }

  .nbadge.choice {
    background: rgba(255, 180, 80, 0.12);
    color: #ffb450;
  }

  .nbadge.arch {
    background: rgba(199, 146, 234, 0.12);
    color: #c792ea;
  }

  .node-effect {
    font-size: 9px;
    line-height: 1.25;
    color: var(--text-muted);
    padding: 3px 8px 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .node-cost {
    font-size: 9px;
    color: var(--text-muted);
    padding: 3px 8px 6px;
    margin-top: auto;
  }

  .node-cost.affordable {
    color: #ffcb6b;
    font-weight: 600;
  }

  /* ── Detail Panel (inline below node) ──────────────────────────── */

  .detail-panel {
    position: absolute;
    width: 340px;
    z-index: 100;
    padding: var(--space-md);
    border: 1px solid rgba(255, 203, 107, 0.3);
    border-radius: 10px;
    background: rgba(16, 18, 28, 0.97);
    backdrop-filter: blur(16px);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(255, 203, 107, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
    animation: dp-pop 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes dp-pop {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Arrow pointing up to the node */
  .dp-arrow {
    position: absolute;
    top: -6px;
    width: 12px;
    height: 12px;
    background: rgba(16, 18, 28, 0.97);
    border-top: 1px solid rgba(255, 203, 107, 0.3);
    border-left: 1px solid rgba(255, 203, 107, 0.3);
    transform: rotate(45deg);
  }

  .dp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-sm);
    margin-bottom: var(--space-xs);
  }

  .dp-name {
    font-size: var(--text-sm);
    font-weight: 700;
    color: #ffcb6b;
    line-height: 1.3;
  }

  .dp-close {
    font-size: 18px;
    line-height: 1;
    padding: 0 4px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    flex-shrink: 0;
  }

  .dp-close:hover {
    color: var(--text-primary);
  }

  .dp-flavor {
    font-style: italic;
    color: var(--text-secondary);
    font-size: 11px;
    line-height: 1.4;
    margin-bottom: var(--space-sm);
    opacity: 0.7;
  }

  .dp-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 3px var(--space-sm);
    font-size: 11px;
    margin-bottom: var(--space-md);
  }

  .dp-label {
    color: var(--text-muted);
    font-weight: 500;
  }

  .dp-val {
    color: var(--text-secondary);
  }

  .dp-warning {
    color: var(--color-warning);
  }

  .dp-start {
    width: 100%;
    padding: 8px var(--space-md);
    font-weight: 700;
    font-size: var(--text-sm);
    border: 1px solid rgba(255, 203, 107, 0.4);
    border-radius: 6px;
    background: rgba(255, 203, 107, 0.08);
    color: #ffcb6b;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .dp-start:hover:not(:disabled) {
    background: rgba(255, 203, 107, 0.18);
    box-shadow: 0 0 16px rgba(255, 203, 107, 0.2);
    transform: translateY(-1px);
  }

  .dp-start:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .dp-hint {
    font-size: 11px;
    text-align: center;
  }

  .dp-done {
    color: #82aaff;
    font-weight: 600;
  }

  .dp-active-bar {
    height: 3px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .dp-active-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffcb6b, #f0a030);
    border-radius: 2px;
    transition: width 0.3s linear;
  }

  /* ── Lab Expansion Section ─────────────────────────────────────── */

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

  /* ── Mobile ────────────────────────────────────────────────────── */

  @media (max-width: 600px) {
    .research-tab {
      padding: var(--space-sm);
    }

    .ip-header {
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
    }

    .tree-viewport {
      height: 420px;
    }

    .detail-panel {
      width: 280px;
    }

    .lab-next-header {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
