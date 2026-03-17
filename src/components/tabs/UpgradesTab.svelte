<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { getState } from "../../stores/game.svelte";
  import { isUpgradeAvailable } from "../../lib/engine/actions";
  import { UPGRADES, type UpgradeCategory } from "../../lib/data/upgrades.data";
  import UpgradeRow from "../shared/UpgradeRow.svelte";

  const PAGE_SIZE = 7;
  const SWIPE_THRESHOLD = 50;

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

  // Categories that have visible upgrades
  const activeCats = $derived(
    categories.filter((cat) => visibleUpgrades.some((u) => u.category === cat.id))
  );

  let selectedCat = $state<UpgradeCategory>("production");
  let pageIndex = $state(0);

  // If selected category has no visible upgrades, fallback to first available
  const effectiveCat = $derived(
    activeCats.some((c) => c.id === selectedCat)
      ? selectedCat
      : activeCats[0]?.id ?? "production"
  );

  const catUpgrades = $derived(
    visibleUpgrades.filter((u) => u.category === effectiveCat)
  );

  const totalPages = $derived(Math.max(1, Math.ceil(catUpgrades.length / PAGE_SIZE)));
  const safePage = $derived(Math.min(pageIndex, totalPages - 1));

  $effect(() => {
    if (pageIndex !== safePage) pageIndex = safePage;
  });

  const pageItems = $derived(
    catUpgrades.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  );

  function selectCat(cat: UpgradeCategory) {
    selectedCat = cat;
    pageIndex = 0;
  }

  // Current category index within activeCats
  const catIndex = $derived(
    Math.max(0, activeCats.findIndex((c) => c.id === effectiveCat))
  );

  function prevPage() {
    if (safePage > 0) {
      pageIndex = safePage - 1;
    } else if (catIndex > 0) {
      // First page of category — go to previous category's last page
      selectedCat = activeCats[catIndex - 1].id;
      pageIndex = 9999; // will be clamped to last page by safePage
    }
  }

  function nextPage() {
    if (safePage < totalPages - 1) {
      pageIndex = safePage + 1;
    } else if (catIndex < activeCats.length - 1) {
      // Last page of category — go to next category's first page
      selectedCat = activeCats[catIndex + 1].id;
      pageIndex = 0;
    }
  }

  // ── Swipe / Drag Handling ───────────────────────────────────────────

  let dragStartX = $state(0);
  let dragCurrentX = $state(0);
  let isDragging = $state(false);

  function onDocMove(e: PointerEvent) {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
  }

  function onDocUp() {
    if (!isDragging) return;
    const delta = dragCurrentX - dragStartX;
    if (delta < -SWIPE_THRESHOLD) nextPage();
    else if (delta > SWIPE_THRESHOLD) prevPage();
    isDragging = false;
    document.removeEventListener("pointermove", onDocMove);
    document.removeEventListener("pointerup", onDocUp);
  }

  function onPointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("button, input")) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragCurrentX = e.clientX;
    document.addEventListener("pointermove", onDocMove);
    document.addEventListener("pointerup", onDocUp);
  }

  // ── Mouse Wheel Paging ─────────────────────────────────────────────

  let listEl = $state<HTMLDivElement | undefined>();
  let wheelCooldown = false;

  function handleWheel(e: WheelEvent) {
    if (totalPages <= 1) return;
    if (wheelCooldown) return;
    if (Math.abs(e.deltaY) < 10) return;
    e.preventDefault();
    wheelCooldown = true;
    if (e.deltaY > 0) nextPage();
    else prevPage();
    setTimeout(() => { wheelCooldown = false; }, 300);
  }

  onMount(() => {
    listEl?.addEventListener("wheel", handleWheel, { passive: false });
  });

  onDestroy(() => {
    listEl?.removeEventListener("wheel", handleWheel);
    document.removeEventListener("pointermove", onDocMove);
    document.removeEventListener("pointerup", onDocUp);
  });
</script>

<div class="upgrades-tab">
  <div class="upgrades-header">
    <h2>Upgrades</h2>
    <span class="text-muted">
      {state.purchasedUpgrades.length}/{UPGRADES.length} purchased
    </span>
  </div>

  {#if activeCats.length === 0}
    <div class="empty text-muted">
      No upgrades available yet. Keep producing RP!
    </div>
  {:else}
    <!-- Category tabs -->
    <div class="category-bar">
      {#each activeCats as cat (cat.id)}
        <button
          class="cat-btn"
          class:active={effectiveCat === cat.id}
          onclick={() => selectCat(cat.id)}
        >
          {cat.label}
          <span class="cat-count">{visibleUpgrades.filter((u) => u.category === cat.id).length}</span>
        </button>
      {/each}
    </div>

    <!-- Upgrade list (paginated, swipeable + scrollwheel) -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="upgrade-list"
      bind:this={listEl}
      onpointerdown={onPointerDown}
    >
      {#each pageItems as upgrade (upgrade.id)}
        <UpgradeRow {upgrade} />
      {/each}
    </div>

    <!-- Pagination controls -->
    {#if totalPages > 1}
      <div class="pagination">
        <button class="page-btn" disabled={safePage === 0} onclick={prevPage}>
          &lsaquo; Prev
        </button>
        <div class="page-dots">
          {#each Array(totalPages) as _, i (i)}
            <button
              class="page-dot"
              class:active={i === safePage}
              onclick={() => (pageIndex = i)}
              aria-label="Go to page {i + 1}"
            ></button>
          {/each}
        </div>
        <button class="page-btn" disabled={safePage >= totalPages - 1} onclick={nextPage}>
          Next &rsaquo;
        </button>
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

  /* ── Upgrade List ──────────────────────────────────────────────── */

  .upgrade-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  /* ── Pagination ────────────────────────────────────────────────── */

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0 var(--space-xs);
  }

  .page-btn {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
    font-weight: 500;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: 60px;
  }

  .page-btn:hover:not(:disabled) {
    border-color: var(--color-rp);
    color: var(--color-rp);
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .page-dots {
    display: flex;
    gap: var(--space-sm);
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

    .page-btn {
      min-width: 50px;
      padding: var(--space-xs) var(--space-xs);
    }
  }
</style>
