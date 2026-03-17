<script lang="ts">
  import { getBuyAmount, setBuyAmount } from "../../stores/ui.svelte";

  const amounts = [1, 5, 10, 25, 100, -1] as const;
  const labels: Record<number, string> = {
    1: "x1",
    5: "x5",
    10: "x10",
    25: "x25",
    100: "x100",
    [-1]: "MAX",
  };

  const current = $derived(getBuyAmount());
</script>

<div class="buy-amount">
  <span class="buy-label text-muted">Buy:</span>
  {#each amounts as amount}
    <button
      class="buy-btn"
      class:active={current === amount}
      onclick={() => setBuyAmount(amount)}
    >
      {labels[amount]}
    </button>
  {/each}
</div>

<style>
  .buy-amount {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .buy-label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-right: var(--space-xs);
  }

  .buy-btn {
    padding: 2px var(--space-sm);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    min-width: 40px;
  }

  .buy-btn.active {
    background: var(--color-rp);
    color: var(--bg-primary);
    border-color: var(--color-rp);
    font-weight: 600;
  }

  @media (max-width: 600px) {
    .buy-amount {
      flex-wrap: wrap;
      justify-content: center;
    }

    .buy-label {
      width: 100%;
      text-align: center;
      margin-right: 0;
      margin-bottom: 2px;
    }

    .buy-btn {
      min-height: 36px;
      min-width: 44px;
      padding: var(--space-xs) var(--space-sm);
      font-size: var(--text-xs);
    }
  }
</style>
