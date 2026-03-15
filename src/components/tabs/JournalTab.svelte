<script lang="ts">
  import { getState } from "../../stores/game.svelte";
  import { LAB_NOTES, getNoteDef } from "../../lib/data/notes.data";
  import type { LabNoteDef } from "../../lib/data/notes.data";

  const ENTRIES_PER_PAGE = 6;

  const gameState = $derived(getState());

  const unlockedNotes = $derived(
    gameState.unlockedNotes
      .map((id) => getNoteDef(id))
      .filter((n): n is NonNullable<typeof n> => n != null)
  );

  const totalPages = $derived(Math.max(1, Math.ceil(unlockedNotes.length / ENTRIES_PER_PAGE)));

  let currentPage = $state(0);
  let expandedNote = $state<LabNoteDef | null>(null);

  // Swipe state
  let dragStartX = $state(0);
  let dragCurrentX = $state(0);
  let isDragging = $state(false);
  const dragOffset = $derived(isDragging ? dragCurrentX - dragStartX : 0);

  // Keep page in bounds when notes change
  const safePage = $derived(Math.min(currentPage, totalPages - 1));
  $effect(() => {
    if (currentPage !== safePage) currentPage = safePage;
  });

  const pagedNotes = $derived.by(() => {
    const pages: LabNoteDef[][] = [];
    for (let i = 0; i < unlockedNotes.length; i += ENTRIES_PER_PAGE) {
      pages.push(unlockedNotes.slice(i, i + ENTRIES_PER_PAGE));
    }
    if (pages.length === 0) pages.push([]);
    return pages;
  });

  function noteBody(note: LabNoteDef): string {
    const arch = gameState.madness.dominantArchetype;
    if (arch && note.archetypeVariants?.[arch]) {
      return note.archetypeVariants[arch]!;
    }
    return note.body;
  }

  function goToPage(page: number) {
    currentPage = Math.max(0, Math.min(page, totalPages - 1));
  }

  // ── Swipe / Drag Handling ───────────────────────────────────────────

  const SWIPE_THRESHOLD = 50;
  const TAP_THRESHOLD = 10;
  let wasSwiping = $state(false);

  function onDocMove(e: PointerEvent) {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
    if (Math.abs(dragCurrentX - dragStartX) > TAP_THRESHOLD) {
      wasSwiping = true;
    }
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
    if (expandedNote) return;
    isDragging = true;
    wasSwiping = false;
    dragStartX = e.clientX;
    dragCurrentX = e.clientX;
    document.addEventListener("pointermove", onDocMove);
    document.addEventListener("pointerup", onDocUp);
  }

  function onNoteClick(note: LabNoteDef) {
    if (wasSwiping) return;
    expandedNote = note;
  }

  function closeExpanded() {
    expandedNote = null;
  }

  function onOverlayKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") closeExpanded();
  }

  function stopProp(e: MouseEvent) {
    e.stopPropagation();
  }

  // Entry index label (e.g., "#003")
  function entryLabel(note: LabNoteDef): string {
    const idx = unlockedNotes.indexOf(note);
    return `#${String(idx + 1).padStart(3, "0")}`;
  }
</script>

<div class="journal-tab">
  <div class="journal-header">
    <h2>Lab Journal</h2>
    <span class="text-muted">
      {gameState.unlockedNotes.length}/{LAB_NOTES.length} entries
    </span>
  </div>

  {#if unlockedNotes.length === 0}
    <div class="empty text-muted">
      The journal is empty. Keep experimenting — observations will appear here.
    </div>
  {:else}
    <!-- Swipe container -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="swipe-viewport"
      role="region"
      aria-label="Journal pages"
      onpointerdown={onPointerDown}
    >
      <div
        class="swipe-track"
        class:dragging={isDragging}
        style:transform="translateX(calc({-safePage * 100}% + {dragOffset}px))"
      >
        {#each pagedNotes as page, pageIdx (pageIdx)}
          <div class="swipe-page">
            <div class="notes-list">
              {#each page as note (note.id)}
                <button
                  class="note-card"
                  onclick={() => onNoteClick(note)}
                  type="button"
                >
                  <div class="note-header">
                    <span class="note-number mono">{entryLabel(note)}</span>
                    <h3 class="note-title">{note.title}</h3>
                  </div>
                  <p class="note-body">{noteBody(note)}</p>
                  <span class="note-expand-hint text-muted">tap to read</span>
                </button>
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

<!-- Expanded note overlay -->
{#if expandedNote}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="expanded-overlay"
    onclick={closeExpanded}
    onkeydown={onOverlayKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
    <div class="expanded-card" role="document" onclick={stopProp}>
      <div class="expanded-top">
        <span class="expanded-number mono">{entryLabel(expandedNote)}</span>
        <button class="expanded-close" onclick={closeExpanded} aria-label="Close">&times;</button>
      </div>
      <h2 class="expanded-title">{expandedNote.title}</h2>
      <div class="expanded-divider"></div>
      <p class="expanded-body">{noteBody(expandedNote)}</p>
      <div class="expanded-footer text-muted mono">
        Lab Journal — Entry {entryLabel(expandedNote)}
      </div>
    </div>
  </div>
{/if}

<style>
  .journal-tab {
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
    user-select: none;
  }

  .journal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
  }

  .journal-header h2 {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .empty {
    text-align: center;
    padding: var(--space-xl);
    font-size: var(--text-base);
    font-style: italic;
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

  .notes-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: 0 var(--space-xs);
  }

  /* ── Note Card (button reset) ────────────────────────────────────── */

  .note-card {
    all: unset;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-left: 3px solid var(--color-rp);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    backdrop-filter: blur(4px);
    cursor: pointer;
    transition: border-color var(--transition-fast), background var(--transition-fast);
    text-align: left;
    box-sizing: border-box;
    width: 100%;
  }

  .note-card:hover {
    border-color: var(--border-light);
    background: rgba(26, 29, 39, 0.9);
  }

  .note-card:focus-visible {
    outline: 2px solid var(--color-rp);
    outline-offset: 2px;
  }

  .note-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .note-number {
    font-size: var(--text-xs);
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .note-title {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-rp);
  }

  .note-body {
    font-size: var(--text-xs);
    line-height: 1.5;
    color: var(--text-secondary);
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .note-expand-hint {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .note-card:hover .note-expand-hint {
    opacity: 1;
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

  /* ── Expanded Note Overlay ───────────────────────────────────────── */

  .expanded-overlay {
    position: fixed;
    inset: 0;
    z-index: 500;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    animation: fade-in 200ms ease;
  }

  .expanded-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-left: 4px solid var(--color-rp);
    border-radius: var(--radius-lg);
    max-width: 560px;
    width: 100%;
    padding: var(--space-lg);
    animation: slide-up 250ms ease;
    max-height: 80vh;
    overflow-y: auto;
  }

  .expanded-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
  }

  .expanded-number {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .expanded-close {
    all: unset;
    font-size: var(--text-xl);
    color: var(--text-muted);
    cursor: pointer;
    line-height: 1;
    padding: 0 var(--space-xs);
    transition: color var(--transition-fast);
  }

  .expanded-close:hover {
    color: var(--text-primary);
  }

  .expanded-title {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-rp);
    margin-bottom: var(--space-sm);
  }

  .expanded-divider {
    height: 1px;
    background: linear-gradient(90deg, var(--color-rp), transparent);
    margin-bottom: var(--space-md);
  }

  .expanded-body {
    font-size: var(--text-base);
    line-height: 1.8;
    color: var(--text-secondary);
    font-style: italic;
    white-space: pre-wrap;
  }

  .expanded-footer {
    margin-top: var(--space-lg);
    font-size: var(--text-xs);
    text-align: right;
    opacity: 0.5;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* ── Mobile ──────────────────────────────────────────────────────── */

  @media (max-width: 600px) {
    .journal-tab {
      padding: var(--space-sm) var(--space-sm);
    }

    .expanded-card {
      padding: var(--space-md);
    }

    .expanded-body {
      font-size: var(--text-sm);
    }
  }
</style>
