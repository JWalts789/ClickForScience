<script lang="ts">
  import { onDestroy } from "svelte";
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

  // Build a flat list of all "slides": { catId, catLabel, pageNum, totalCatPages, items }
  interface Slide {
    catId: UpgradeCategory;
    catLabel: string;
    pageNum: number;
    totalCatPages: number;
    items: typeof UPGRADES;
  }

  const slides = $derived.by(() => {
    const result: Slide[] = [];
    for (const cat of categories) {
      const items = visibleUpgrades.filter((u) => u.category === cat.id);
      if (items.length === 0) continue;
      const totalCatPages = Math.ceil(items.length / PAGE_SIZE);
      for (let p = 0; p < totalCatPages; p++) {
        result.push({
          catId: cat.id,
          catLabel: cat.label,
          pageNum: p,
          totalCatPages,
          items: items.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE),
        });
      }
    }
    return result;
  });

  // Active categories (for tab bar)
  const activeCats = $derived.by(() => {
    const seen = new Set<UpgradeCategory>();
    return categories.filter((cat) => {
      if (visibleUpgrades.some((u) => u.category === cat.id)) {
        seen.add(cat.id);
        return true;
      }
      return false;
    });
  });

  // Single flat index into slides
  let slideIndex = $state(0);

  // Clamp if slides shrink
  const safeSlide = $derived(Math.max(0, Math.min(slideIndex, slides.length - 1)));
  $effect(() => { if (slideIndex !== safeSlide) slideIndex = safeSlide; });

  const currentSlide = $derived(slides[safeSlide]);

  // Jump to first slide of a category
  function selectCat(catId: UpgradeCategory) {
    const idx = slides.findIndex((s) => s.catId === catId);
    if (idx >= 0) slideIndex = idx;
  }

  function prev() {
    if (safeSlide > 0) slideIndex = safeSlide - 1;
  }

  function next() {
    if (safeSlide < slides.length - 1) slideIndex = safeSlide + 1;
  }

  // ── Swipe / Drag Handling ───────────────────────────────────────────

  let dragStartX = 0;
  let dragCurrentX = 0;
  let isDragging = false;

  function onDocMove(e: PointerEvent) {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
  }

  function onDocUp() {
    if (!isDragging) return;
    const delta = dragCurrentX - dragStartX;
    if (delta < -SWIPE_THRESHOLD) next();
    else if (delta > SWIPE_THRESHOLD) prev();
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
    if (slides.length <= 1) return;
    if (wheelCooldown) return;
    if (Math.abs(e.deltaY) < 10) return;
    e.preventDefault();
    wheelCooldown = true;
    if (e.deltaY > 0) next();
    else prev();
    setTimeout(() => { wheelCooldown = false; }, 300);
  }

  // Bind wheel with passive:false via $effect so it rebinds if element changes
  $effect(() => {
    const el = listEl;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  });

  onDestroy(() => {
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

  {#if slides.length === 0}
    <div class="empty text-muted">
      No upgrades available yet. Keep producing RP!
    </div>
  {:else if currentSlide}
    <!-- Category tabs -->
    <div class="category-bar">
      {#each activeCats as cat (cat.id)}
        <button
          class="cat-btn"
          class:active={currentSlide.catId === cat.id}
          onclick={() => selectCat(cat.id)}
        >
          {cat.label}
          <span class="cat-count">{visibleUpgrades.filter((u) => u.category === cat.id).length}</span>
        </button>
      {/each}
    </div>

    <!-- Upgrade list -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="upgrade-list"
      bind:this={listEl}
      onpointerdown={onPointerDown}
    >
      {#each currentSlide.items as upgrade (upgrade.id)}
        <UpgradeRow {upgrade} />
      {/each}
    </div>

    <!-- Pagination controls -->
    {#if slides.length > 1}
      <div class="pagination">
        <button class="page-btn" disabled={safeSlide === 0} onclick={prev}>
          &lsaquo; Prev
        </button>
        <span class="page-label text-muted">
          {currentSlide.catLabel}
          {#if currentSlide.totalCatPages > 1}
            ({currentSlide.pageNum + 1}/{currentSlide.totalCatPages})
          {/if}
        </span>
        <button class="page-btn" disabled={safeSlide >= slides.length - 1} onclick={next}>
          Next &rsaquo;
        </button>
      </div>
      <div class="page-dots-row">
        {#each slides as slide, i (i)}
          {#if i > 0 && slide.catId !== slides[i - 1].catId}
            <span class="dot-divider"></span>
          {/if}
          <button
            class="page-dot"
            class:active={i === safeSlide}
            onclick={() => (slideIndex = i)}
            aria-label="{slide.catLabel} page {slide.pageNum + 1}"
          ></button>
        {/each}
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
    touch-action: pan-y;
    cursor: grab;
  }

  .upgrade-list:active {
    cursor: grabbing;
  }

  /* ── Pagination ────────────────────────────────────────────────── */

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0 var(--space-xs);
  }

  .page-label {
    font-size: var(--text-xs);
    min-width: 100px;
    text-align: center;
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

  .page-dots-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: var(--space-xs) 0 var(--space-sm);
  }

  .dot-divider {
    width: 1px;
    height: 12px;
    background: var(--border-color);
    margin: 0 2px;
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
