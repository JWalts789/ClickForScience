<script lang="ts">
  import { getState, getRevision, toggleAllAutobuyers, setAutobuyerReserve, isResearchComplete } from "../../stores/game.svelte";
  import { GENERATORS } from "../../lib/data/generators.data";
  import ClickButton from "../shared/ClickButton.svelte";
  import BuyAmount from "../shared/BuyAmount.svelte";
  import GeneratorRow from "../shared/GeneratorRow.svelte";

  const GENS_PER_PAGE = 3;

  const state = $derived(getState());
  const rev = $derived(getRevision());
  const autobuyerUnlocked = $derived.by(() => { void rev; return isResearchComplete(state, "autobuyer_protocol"); });
  const reservePercent = $derived.by(() => { void rev; return state.autobuyers.reservePercent; });

  // Only show generators the player can see
  const visibleCount = $derived.by(() => {
    let lastOwned = 0;
    for (let i = 0; i < GENERATORS.length; i++) {
      if (state.generators[i].owned.gt(0)) {
        lastOwned = i;
      }
    }
    return Math.min(lastOwned + 2, GENERATORS.length);
  });

  // Group visible generators into pages
  const pagedGenerators = $derived.by(() => {
    const pages: number[][] = [];
    for (let i = 0; i < visibleCount; i += GENS_PER_PAGE) {
      const page: number[] = [];
      for (let j = i; j < Math.min(i + GENS_PER_PAGE, visibleCount); j++) {
        page.push(j);
      }
      pages.push(page);
    }
    if (pages.length === 0) pages.push([0]);
    return pages;
  });

  const totalPages = $derived(pagedGenerators.length);

  let currentPage = $state(0);

  // Keep page in bounds when generator count changes
  const safePage = $derived(Math.min(currentPage, totalPages - 1));
  $effect(() => {
    if (currentPage !== safePage) currentPage = safePage;
  });

  function goToPage(page: number) {
    currentPage = Math.max(0, Math.min(page, totalPages - 1));
  }

  // ── Swipe / Drag Handling ───────────────────────────────────────────

  const SWIPE_THRESHOLD = 50;

  let dragStartX = $state(0);
  let dragCurrentX = $state(0);
  let isDragging = $state(false);
  const dragOffset = $derived(isDragging ? dragCurrentX - dragStartX : 0);

  function onDocMove(e: PointerEvent) {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
  }

  function onDocUp(_e: PointerEvent) {
    if (!isDragging) return;
    const delta = dragCurrentX - dragStartX;
    if (delta < -SWIPE_THRESHOLD && currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    } else if (delta > SWIPE_THRESHOLD && currentPage > 0) {
      goToPage(currentPage - 1);
    }
    isDragging = false;
    dragStartX = 0;
    dragCurrentX = 0;
    document.removeEventListener("pointermove", onDocMove);
    document.removeEventListener("pointerup", onDocUp);
  }

  // ── Mouse Wheel Paging ─────────────────────────────────────────────
  let wheelCooldown = false;
  function onWheel(e: WheelEvent) {
    if (wheelCooldown) return;
    if (Math.abs(e.deltaY) < 10) return;
    e.preventDefault();
    wheelCooldown = true;
    if (e.deltaY > 0 && currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    } else if (e.deltaY < 0 && currentPage > 0) {
      goToPage(currentPage - 1);
    }
    setTimeout(() => { wheelCooldown = false; }, 300);
  }

  function onPointerDown(e: PointerEvent) {
    // Don't start drag on buttons/inputs
    const target = e.target as HTMLElement;
    if (target.closest("button, input, .autobuyer-toggle")) return;

    isDragging = true;
    dragStartX = e.clientX;
    dragCurrentX = e.clientX;
    document.addEventListener("pointermove", onDocMove);
    document.addEventListener("pointerup", onDocUp);
  }
</script>

<div class="generators-tab">
  <ClickButton />

  <div class="generators-header">
    <h2>Laboratory Equipment</h2>
    <BuyAmount />
  </div>

  {#if autobuyerUnlocked}
    <div class="autobuyer-panel card">
      <div class="autobuyer-header">
        <span class="autobuyer-title">Auto-Buyers</span>
        <div class="autobuyer-controls">
          <button class="autobuyer-btn" onclick={() => toggleAllAutobuyers(true)}>All ON</button>
          <button class="autobuyer-btn" onclick={() => toggleAllAutobuyers(false)}>All OFF</button>
        </div>
      </div>
      <div class="reserve-row">
        <label class="reserve-label" for="reserve-slider">
          RP Reserve: <span class="mono">{reservePercent}%</span>
        </label>
        <input
          id="reserve-slider"
          type="range"
          min="0"
          max="90"
          step="5"
          value={reservePercent}
          oninput={(e) => setAutobuyerReserve(Number((e.target as HTMLInputElement).value))}
        />
      </div>
    </div>
  {/if}

  <!-- Swipe container -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="swipe-viewport"
    role="region"
    aria-label="Generator pages"
    onpointerdown={onPointerDown}
    onwheel={onWheel}
  >
    <div
      class="swipe-track"
      class:dragging={isDragging}
      style:transform="translateX(calc({-safePage * 100}% + {dragOffset}px))"
    >
      {#each pagedGenerators as page, pageIdx (pageIdx)}
        <div class="swipe-page">
          <div class="generator-list">
            {#each page as genIndex (genIndex)}
              <GeneratorRow index={genIndex} />
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Page indicator dots -->
  {#if totalPages > 1}
    <div class="page-indicators">
      {#each Array(totalPages) as _, i (i)}
        <button
          class="page-dot"
          class:active={i === safePage}
          onclick={() => goToPage(i)}
          aria-label="Go to page {i + 1}"
        ></button>
      {/each}
    </div>
    <div class="page-number text-muted mono">
      {safePage + 1} / {totalPages}
    </div>
  {/if}
</div>

<style>
  .generators-tab {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
    user-select: none;
  }

  .generators-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
  }

  .generators-header h2 {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  /* ── Swipe Carousel ──────────────────────────────────────────────── */

  .swipe-viewport {
    overflow: hidden;
    touch-action: pan-y;
    cursor: grab;
  }

  .swipe-viewport:active {
    cursor: grabbing;
  }

  .swipe-track {
    display: flex;
    transition: transform 300ms ease;
    will-change: transform;
  }

  .swipe-track.dragging {
    transition: none;
  }

  .swipe-page {
    flex: 0 0 100%;
    min-width: 0;
  }

  .generator-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: 0 var(--space-xs);
  }

  /* ── Page Indicators ─────────────────────────────────────────────── */

  .page-indicators {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-md) 0 var(--space-xs);
  }

  .page-dot {
    all: unset;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border-light);
    cursor: pointer;
    transition: background var(--transition-fast), transform var(--transition-fast);
  }

  .page-dot.active {
    background: var(--color-rp);
    transform: scale(1.3);
  }

  .page-dot:hover:not(.active) {
    background: var(--text-muted);
  }

  .page-number {
    text-align: center;
    font-size: var(--text-xs);
    padding-bottom: var(--space-xs);
  }

  /* Auto-buyer panel */
  .autobuyer-panel {
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
  }

  .autobuyer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xs);
  }

  .autobuyer-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #50c878;
  }

  .autobuyer-controls {
    display: flex;
    gap: 4px;
  }

  .autobuyer-btn {
    padding: 2px 8px;
    font-size: var(--text-xs);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .autobuyer-btn:hover {
    border-color: #50c878;
    color: #50c878;
  }

  .reserve-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .reserve-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    white-space: nowrap;
    min-width: 110px;
  }

  #reserve-slider {
    flex: 1;
    accent-color: #50c878;
    cursor: pointer;
  }

  /* ── Mobile ──────────────────────────────────────────────────────── */

  @media (max-width: 600px) {
    .generators-tab {
      padding: var(--space-sm) var(--space-sm);
    }
  }
</style>
