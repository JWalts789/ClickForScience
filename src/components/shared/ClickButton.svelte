<script lang="ts">
  import { doClick, getState, getClickValue } from "../../stores/game.svelte";
  import { formatRP } from "../../lib/utils/format";

  const state = $derived(getState());
  const value = $derived(getClickValue());
  const notation = $derived(state.settings.notation);
  const madLevel = $derived(state.madness.madnessLevel);

  // Click button label evolves with madness
  const buttonLabel = $derived.by(() => {
    if (madLevel <= 1) return "Tinker";
    if (madLevel <= 3) return "Experiment!";
    if (madLevel <= 5) return "PUSH BOUNDARIES";
    if (madLevel <= 7) return "TRANSCEND LIMITS";
    return "RESHAPE REALITY";
  });

  let isClicking = $state(false);

  // Floating numbers
  interface FloatingNumber {
    id: number;
    text: string;
    x: number;
    y: number;
  }

  let floaters: FloatingNumber[] = $state([]);
  let nextId = 0;

  function onClick(e: MouseEvent) {
    doClick();
    isClicking = true;
    setTimeout(() => { isClicking = false; }, 100);

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    // Spawn floating number near the click position relative to the button
    const btn = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - btn.left;
    const y = e.clientY - btn.top;

    // Randomize drift direction slightly
    const offsetX = (Math.random() - 0.5) * 60;

    const id = nextId++;
    floaters = [...floaters, {
      id,
      text: `+${formatRP(value, notation)}`,
      x: x + offsetX,
      y,
    }];

    // Remove after animation completes
    setTimeout(() => {
      floaters = floaters.filter((f) => f.id !== id);
    }, 800);
  }
</script>

<div class="click-area">
  <div class="click-wrapper">
    <button
      class="click-button"
      class:clicking={isClicking}
      onclick={onClick}
    >
      <span class="click-label">{buttonLabel}</span>
      <span class="click-value mono text-rp">+{formatRP(value, notation)} RP</span>
    </button>

    {#each floaters as f (f.id)}
      <span
        class="floater mono text-rp"
        style:left="{f.x}px"
        style:top="{f.y}px"
      >
        {f.text}
      </span>
    {/each}
  </div>
</div>

<style>
  .click-area {
    display: flex;
    justify-content: center;
    padding: var(--space-lg) 0;
  }

  .click-wrapper {
    position: relative;
  }

  .click-button {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, var(--bg-hover), var(--bg-tertiary));
    border: 3px solid var(--color-rp);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    transition: transform 80ms ease, box-shadow 80ms ease, border-color var(--transition-fast);
    box-shadow: 0 0 20px color-mix(in srgb, var(--color-rp) 15%, transparent);
    user-select: none;
  }

  .click-button:hover:not(:disabled) {
    background: radial-gradient(circle at 40% 35%, var(--bg-hover), var(--bg-tertiary));
    box-shadow: 0 0 30px color-mix(in srgb, var(--color-rp) 25%, transparent);
    transform: scale(1.02);
  }

  .click-button:active,
  .click-button.clicking {
    transform: scale(0.95);
    box-shadow: 0 0 40px color-mix(in srgb, var(--color-rp) 35%, transparent);
  }

  .click-label {
    font-size: var(--text-lg);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .click-value {
    font-size: var(--text-sm);
  }

  /* Floating click numbers */
  .floater {
    position: absolute;
    pointer-events: none;
    font-size: var(--text-sm);
    font-weight: 700;
    white-space: nowrap;
    animation: float-up 800ms ease-out forwards;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }

  @keyframes float-up {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    70% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
      transform: translateY(-80px) scale(0.7);
    }
  }

  @media (max-width: 600px) {
    .click-button {
      width: 170px;
      height: 170px;
    }

    .click-area {
      padding: var(--space-md) 0;
    }
  }
</style>
