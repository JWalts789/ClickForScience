<script lang="ts">
  import { hasPlayerName, getPlayerName, setPlayerName } from "../../lib/leaderboard/identity";

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  let name = $state(getPlayerName());
  let error = $state("");

  function onSubmit(e: Event) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      error = "Name must be at least 2 characters.";
      return;
    }
    if (trimmed.length > 24) {
      error = "Name must be 24 characters or less.";
      return;
    }
    // Basic profanity/injection guard
    if (/[<>"';&]/.test(trimmed)) {
      error = "Name contains invalid characters.";
      return;
    }
    setPlayerName(trimmed);
    error = "";
    onComplete();
  }
</script>

<div class="name-prompt">
  <h3 class="prompt-title">Choose a Display Name</h3>
  <p class="prompt-desc text-muted">This is how you'll appear on the leaderboards.</p>
  <form onsubmit={onSubmit}>
    <input
      type="text"
      class="name-input"
      bind:value={name}
      placeholder="Dr. Gary Flemming"
      maxlength={24}
      autofocus
    />
    {#if error}
      <p class="error-text">{error}</p>
    {/if}
    <button type="submit" class="primary submit-btn">
      {hasPlayerName() ? "Update Name" : "Set Name"}
    </button>
  </form>
</div>

<style>
  .name-prompt {
    text-align: center;
    padding: var(--space-lg);
  }

  .prompt-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-rp);
    margin-bottom: var(--space-xs);
  }

  .prompt-desc {
    font-size: var(--text-sm);
    margin-bottom: var(--space-md);
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .name-input {
    width: 100%;
    max-width: 280px;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-base);
    font-family: var(--font-mono);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    text-align: center;
  }

  .name-input:focus {
    outline: none;
    border-color: var(--color-rp);
    box-shadow: 0 0 0 2px rgba(199, 146, 234, 0.2);
  }

  .error-text {
    font-size: var(--text-xs);
    color: var(--color-danger);
  }

  .submit-btn {
    min-width: 160px;
  }
</style>
