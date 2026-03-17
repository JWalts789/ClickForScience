<script lang="ts">
  import { getActiveEvent } from "../../stores/ui.svelte";
  import { resolveEvent } from "../../stores/game.svelte";

  const activeEvent = $derived(getActiveEvent());
</script>

{#if activeEvent}
  <div class="event-overlay">
    <div class="event-modal card">
      <div class="event-header">
        <span class="event-label">EVENT</span>
        <h2 class="event-title">{activeEvent.def.title}</h2>
      </div>

      <p class="event-body">{activeEvent.def.body}</p>

      <div class="event-choices">
        {#each activeEvent.def.choices as choice, i}
          <button
            class="event-choice"
            onclick={() => resolveEvent(i)}
          >
            <span class="choice-label">{choice.label}</span>
            <span class="choice-desc">{choice.description}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .event-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 400;
    animation: fadeIn 0.3s ease-out;
  }

  .event-modal {
    max-width: 520px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    animation: slideUp 0.4s ease-out;
  }

  .event-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .event-label {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-bp);
    opacity: 0.8;
  }

  .event-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-rp);
  }

  .event-body {
    font-size: var(--text-sm);
    line-height: 1.7;
    color: var(--text-secondary);
    font-style: italic;
  }

  .event-choices {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-xs);
  }

  .event-choice {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.85);
    text-align: left;
    cursor: pointer;
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  .event-choice:hover {
    border-color: var(--color-rp);
    background: rgba(26, 29, 39, 1);
  }

  .choice-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .choice-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    opacity: 0.7;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 600px) {
    .event-modal {
      max-width: calc(100vw - 32px);
      padding: var(--space-md);
    }

    .event-title {
      font-size: var(--text-base);
    }

    .event-choice {
      padding: 12px var(--space-md);
      min-height: 44px;
    }
  }
</style>
