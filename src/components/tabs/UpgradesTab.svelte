<script lang="ts">
  import { onMount, onDestroy } from "svelte";
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

  // Pages: one per category that has visible upgrades
  const pages = $derived(
    categories
      .map((cat) => ({ ...cat, items: upgradesInCategory(cat.id) }))
      .filter((p) => p.items.length > 0)
  );

  const totalPages = $derived(Math.max(1, pages.length));

  let currentPage = $state(0);

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

  function onPointerDown(e: PointerEvent) {
    // Don't start drag on buttons/inputs
    const target = e.target as HTMLElement;
    if (target.closest("button, input")) return;

    isDragging = true;
    dragStartX = e.clientX;
    dragCurrentX = e.clientX;
    document.addEventListener("pointermove", onDocMove);
    document.addEventListener("pointerup", onDocUp);
  }

  // ── Mouse Wheel Paging ─────────────────────────────────────────────
  let viewportEl = $state<HTMLDivElement | undefined>();
  let wheelCooldown = false;

  function handleWheel(e: WheelEvent) {
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

  onMount(() => {
    viewportEl?.addEventListener("wheel", handleWheel, { passive: false });
  });

  onDestroy(() => {
    viewportEl?.removeEventListener("wheel", handleWheel);
  });
</script>

<div class="upgrades-tab">
  <div class="upgrades-header">
    <h2>Upgrades</h2>
    <span class="text-muted">
      {state.purchasedUpgrades.length}/{UPGRADES.length} purchased
    </span>
  </div>

  {#if pages.length === 0}
    <div class="empty text-muted">
      No upgrades available yet. Keep producing RP!
    </div>
  {:else}
    <!-- Category tabs -->
    <div class="category-bar">
      {#each pages as page, i (page.id)}
        <button
          class="cat-btn"
          class:active={i === safePage}
          onclick={() => goToPage(i)}
        >
          {page.label}
          <span class="cat-count">{page.items.length}</span>
        </button>
      {/each}
    </div>

    <!-- Swipe container -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="swipe-viewport"
      role="region"
      aria-label="Upgrade pages"
      onpointerdown={onPointerDown}
      bind:this={viewportEl}
    >
      <div
        class="swipe-track"
        class:dragging={isDragging}
        style:transform="translateX(calc({-safePage * 100}% + {dragOffset}px))"
      >
        {#each pages as page (page.id)}
          <div class="swipe-page">
            <div class="upgrade-list">
              {#each page.items as upgrade (upgrade.id)}
                <UpgradeRow {upgrade} />
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
  {/if}
</div>

<style>
  .upgrades-tab {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
    user-select: none;
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

  .empty {
    text-align: center;
    padding: var(--space-xl);
    font-size: var(--text-base);
  }

  /* ── Category Tabs ──────────────────────────────────────────────── */

  .category-bar {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
    margin-bottom: var(--space-md);
  }

  .cat-btn {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    font-weight: 500;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .cat-btn.active {
    background: rgba(199, 146, 234, 0.15);
    border-color: var(--color-rp);
    color: var(--color-rp);
  }

  .cat-btn:hover:not(.active) {
    border-color: var(--text-muted);
  }

  .cat-count {
    font-size: 10px;
    background: rgba(255, 255, 255, 0.08);
    padding: 0 4px;
    border-radius: 6px;
    min-width: 16px;
    text-align: center;
  }

  .cat-btn.active .cat-count {
    background: rgba(199, 146, 234, 0.25);
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

  .upgrade-list {
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

  /* ── Mobile ──────────────────────────────────────────────────────── */

  @media (max-width: 600px) {
    .upgrades-tab {
      padding: var(--space-sm) var(--space-sm);
    }
  }
</style>
