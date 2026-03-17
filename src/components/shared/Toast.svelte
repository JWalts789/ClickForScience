<script lang="ts">
  import { getToastMessage } from "../../stores/ui.svelte";

  const message = $derived(getToastMessage());

  // Track the displayed message and leaving state for exit animation
  let displayMessage: string | null = $state(null);
  let leaving = $state(false);
  let leaveTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (message) {
      // New message arrived — show it immediately
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
      leaving = false;
      displayMessage = message;
    } else if (displayMessage && !leaving) {
      // Message cleared — start exit animation
      leaving = true;
      leaveTimer = setTimeout(() => {
        displayMessage = null;
        leaving = false;
        leaveTimer = null;
      }, 200);
    }
  });
</script>

{#if displayMessage}
  <div class="toast" class:leaving>
    {displayMessage}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--text-sm);
    color: var(--text-primary);
    z-index: 200;
    animation: toast-in 200ms ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .toast.leaving {
    animation: toast-out 200ms ease forwards;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes toast-out {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
  }

  @media (max-width: 600px) {
    .toast {
      bottom: 80px;
      max-width: calc(100vw - 32px);
      font-size: var(--text-xs);
      padding: var(--space-xs) var(--space-md);
    }
  }
</style>
