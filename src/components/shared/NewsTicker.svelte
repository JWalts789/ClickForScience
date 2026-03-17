<script lang="ts">
  import { getActiveTickerBatch, getTickerDuration } from "../../stores/ui.svelte";

  const batch = $derived(getActiveTickerBatch());
  const duration = $derived(getTickerDuration());
  const showing = $derived(batch.length > 0);

  // Join headlines with a separator for one continuous scroll
  const combinedText = $derived(
    batch.join("  ◆  ")
  );

  // Fade duration matches scroll + 2s buffer for fade out
  const fadeDuration = $derived(duration + 2);
</script>

{#if showing}
  {#key combinedText}
    <div
      class="ticker-bar"
      style:animation-duration="{fadeDuration}s"
    >
      <span class="ticker-label">BREAKING</span>
      <div class="ticker-track">
        <span
          class="ticker-text"
          style:animation-duration="{duration}s"
        >{combinedText}</span>
      </div>
    </div>
  {/key}
{/if}

<style>
  .ticker-bar {
    position: fixed;
    bottom: 48px;
    left: 0;
    right: 0;
    height: 28px;
    background: rgba(15, 17, 23, 0.92);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--color-warning);
    border-bottom: 1px solid rgba(255, 203, 107, 0.3);
    display: flex;
    align-items: center;
    z-index: 150;
    overflow: hidden;
    animation: ticker-fade ease forwards;
  }

  .ticker-label {
    flex-shrink: 0;
    padding: 0 var(--space-sm);
    background: var(--color-warning);
    color: var(--bg-primary);
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.1em;
    height: 100%;
    display: flex;
    align-items: center;
    text-transform: uppercase;
  }

  .ticker-track {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
  }

  .ticker-text {
    display: inline-block;
    padding-left: 100%;
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--color-warning);
    letter-spacing: 0.02em;
    animation: scroll-left linear forwards;
  }

  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-200%);
    }
  }

  @keyframes ticker-fade {
    0% { opacity: 0; }
    3% { opacity: 1; }
    85% { opacity: 1; }
    100% { opacity: 0; }
  }

  @media (max-width: 600px) {
    .ticker-bar {
      bottom: 56px;
      height: 24px;
    }

    .ticker-label {
      font-size: 0.6rem;
      padding: 0 var(--space-xs);
    }

    .ticker-text {
      font-size: 0.65rem;
    }
  }
</style>
