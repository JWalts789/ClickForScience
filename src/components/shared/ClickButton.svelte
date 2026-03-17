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

  // Ring burst particles
  interface Particle {
    id: number;
    angle: number;
    distance: number;
    size: number;
  }

  let floaters: FloatingNumber[] = $state([]);
  let particles: Particle[] = $state([]);
  let nextId = 0;
  let clickCount = 0;

  // Pulse ring intensity grows with rapid clicks
  let pulseIntensity = $state(0);
  let pulseDecay: ReturnType<typeof setTimeout> | null = null;

  function onClick(e: MouseEvent) {
    doClick();
    clickCount++;
    isClicking = true;
    setTimeout(() => { isClicking = false; }, 100);

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    // Build pulse intensity with rapid clicks (max 5)
    pulseIntensity = Math.min(5, pulseIntensity + 1);
    if (pulseDecay) clearTimeout(pulseDecay);
    pulseDecay = setTimeout(() => { pulseIntensity = 0; }, 600);

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

    // Spawn ring burst particles (4-6 per click)
    const numParticles = 4 + Math.floor(Math.random() * 3);
    const newParticles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: nextId++,
        angle: (360 / numParticles) * i + (Math.random() - 0.5) * 30,
        distance: 90 + Math.random() * 50,
        size: 3 + Math.random() * 4,
      });
    }
    particles = [...particles, ...newParticles];

    // Remove after animations complete
    setTimeout(() => {
      floaters = floaters.filter((f) => f.id !== id);
    }, 900);
    setTimeout(() => {
      const ids = new Set(newParticles.map((p) => p.id));
      particles = particles.filter((p) => !ids.has(p.id));
    }, 600);
  }
</script>

<div class="click-area">
  <div class="click-wrapper">
    <!-- Outer glow ring -->
    <div
      class="glow-ring"
      class:active={pulseIntensity > 0}
      style:--pulse={pulseIntensity}
    ></div>

    <button
      class="click-button"
      class:clicking={isClicking}
      style:--pulse={pulseIntensity}
      onclick={onClick}
    >
      <span class="click-label">{buttonLabel}</span>
      <span class="click-value mono text-rp">+{formatRP(value, notation)} RP</span>
    </button>

    <!-- Burst particles -->
    {#each particles as p (p.id)}
      <span
        class="particle"
        style:--angle="{p.angle}deg"
        style:--dist="{p.distance}px"
        style:--size="{p.size}px"
      ></span>
    {/each}

    <!-- Floating click numbers -->
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
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Outer Glow Ring ───────────────────────────────────────────── */

  .glow-ring {
    position: absolute;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    border: 2px solid transparent;
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease, transform 200ms ease;
  }

  .glow-ring.active {
    opacity: 1;
    border-color: color-mix(in srgb, var(--color-rp) calc(var(--pulse) * 15%), transparent);
    box-shadow:
      0 0 calc(var(--pulse) * 12px) color-mix(in srgb, var(--color-rp) calc(var(--pulse) * 10%), transparent),
      inset 0 0 calc(var(--pulse) * 8px) color-mix(in srgb, var(--color-rp) calc(var(--pulse) * 5%), transparent);
    animation: ring-pulse 600ms ease-out forwards;
  }

  @keyframes ring-pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.15);
      opacity: 0;
    }
  }

  /* ── Click Button ──────────────────────────────────────────────── */

  .click-button {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 35% 30%, rgba(100, 217, 123, 0.08), transparent 60%),
      radial-gradient(circle at 65% 70%, rgba(199, 146, 234, 0.06), transparent 60%),
      radial-gradient(circle at 50% 50%, var(--bg-hover), var(--bg-tertiary));
    border: 3px solid var(--color-rp);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    transition: transform 80ms ease, box-shadow 150ms ease, border-color var(--transition-fast);
    box-shadow:
      0 0 20px color-mix(in srgb, var(--color-rp) 15%, transparent),
      0 4px 16px rgba(0, 0, 0, 0.3);
    user-select: none;
    position: relative;
    overflow: hidden;
  }

  /* Inner shimmer */
  .click-button::before {
    content: "";
    position: absolute;
    inset: -50%;
    background: conic-gradient(
      from 0deg,
      transparent 0%,
      rgba(100, 217, 123, 0.06) 10%,
      transparent 20%,
      rgba(199, 146, 234, 0.06) 50%,
      transparent 60%,
      rgba(100, 217, 123, 0.04) 80%,
      transparent 100%
    );
    animation: shimmer-rotate 8s linear infinite;
    pointer-events: none;
  }

  @keyframes shimmer-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .click-button:hover:not(:disabled) {
    box-shadow:
      0 0 35px color-mix(in srgb, var(--color-rp) 25%, transparent),
      0 0 60px color-mix(in srgb, var(--color-rp) 10%, transparent),
      0 4px 16px rgba(0, 0, 0, 0.3);
    transform: scale(1.03);
    border-color: #7ce892;
  }

  .click-button:active,
  .click-button.clicking {
    transform: scale(0.93);
    box-shadow:
      0 0 50px color-mix(in srgb, var(--color-rp) 40%, transparent),
      0 0 80px color-mix(in srgb, var(--color-rp) 15%, transparent),
      inset 0 0 30px color-mix(in srgb, var(--color-rp) 10%, transparent);
    border-color: #a0f0b0;
  }

  .click-label {
    font-size: var(--text-lg);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-shadow: 0 0 12px color-mix(in srgb, var(--color-rp) 30%, transparent);
    position: relative;
  }

  .click-value {
    font-size: var(--text-sm);
    position: relative;
  }

  /* ── Burst Particles ───────────────────────────────────────────── */

  .particle {
    position: absolute;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: var(--color-rp);
    pointer-events: none;
    left: 50%;
    top: 50%;
    animation: particle-burst 500ms ease-out forwards;
    box-shadow: 0 0 6px var(--color-rp);
  }

  @keyframes particle-burst {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(20px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--dist)) scale(0.3);
    }
  }

  /* ── Floating Click Numbers ────────────────────────────────────── */

  .floater {
    position: absolute;
    pointer-events: none;
    font-size: var(--text-sm);
    font-weight: 700;
    white-space: nowrap;
    animation: float-up 900ms ease-out forwards;
    text-shadow: 0 0 8px color-mix(in srgb, var(--color-rp) 40%, transparent), 0 1px 4px rgba(0, 0, 0, 0.6);
  }

  @keyframes float-up {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1.1);
    }
    20% {
      transform: translateY(-10px) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: translateY(-90px) scale(0.6);
    }
  }

  /* ── Mobile ────────────────────────────────────────────────────── */

  @media (max-width: 600px) {
    .click-button {
      width: 170px;
      height: 170px;
    }

    .glow-ring {
      width: 190px;
      height: 190px;
    }

    .click-area {
      padding: var(--space-md) 0;
    }
  }
</style>
