<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { User } from "@supabase/supabase-js";
  import {
    signUp,
    signIn,
    signOut,
    getUser,
    onAuthChange,
    cloudSave,
    cloudLoad,
    isCloudAvailable,
  } from "../../lib/cloud/auth";
  import { getState, doLoadFromString, doSave } from "../../stores/game.svelte";
  import { serializeState } from "../../lib/engine/save";
  import { showToast } from "../../stores/ui.svelte";

  let user = $state<User | null>(null);
  let email = $state("");
  let password = $state("");
  let isSignUp = $state(false);
  let loading = $state(false);
  let error = $state("");
  let unsubscribe: (() => void) | null = null;
  const available = isCloudAvailable();

  onMount(async () => {
    if (!available) return;
    user = await getUser();
    unsubscribe = onAuthChange((u) => {
      user = u;
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  async function onSubmit(e: Event) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    loading = true;
    error = "";

    const result = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);

    if (result.error) {
      error = result.error;
    } else if (result.user) {
      user = result.user;
      if (isSignUp) {
        showToast("Account created! Check your email to confirm.");
      } else {
        showToast("Signed in!");
      }
    }
    loading = false;
  }

  async function onSignOut() {
    loading = true;
    await signOut();
    user = null;
    loading = false;
    showToast("Signed out.");
  }

  async function onCloudSave() {
    loading = true;
    error = "";
    const state = getState();
    const data = serializeState(state);
    const result = await cloudSave(data, state.totalPlaytimeSec, state.prestigeCount);
    if (result.success) {
      showToast("Progress saved to cloud!");
    } else {
      error = result.error ?? "Cloud save failed.";
    }
    loading = false;
  }

  async function onCloudLoad() {
    loading = true;
    error = "";
    const result = await cloudLoad();
    if (result.error) {
      error = result.error;
    } else if (result.saveData) {
      const success = doLoadFromString(result.saveData);
      if (success) {
        showToast("Progress loaded from cloud!");
      } else {
        error = "Failed to parse cloud save data.";
      }
    } else {
      error = "No cloud save found.";
    }
    loading = false;
  }
</script>

<div class="cloud-panel">
  {#if !available}
    <p class="text-muted">Cloud saves are not yet configured.</p>
  {:else if user}
    <!-- Signed in state -->
    <div class="signed-in">
      <div class="user-info">
        <span class="user-label text-muted">Signed in as</span>
        <span class="user-email mono">{user.email}</span>
      </div>

      <div class="cloud-actions">
        <button class="cloud-btn save-btn" onclick={onCloudSave} disabled={loading}>
          {loading ? "..." : "Save to Cloud"}
        </button>
        <button class="cloud-btn load-btn" onclick={onCloudLoad} disabled={loading}>
          {loading ? "..." : "Load from Cloud"}
        </button>
      </div>

      <button class="signout-btn text-muted" onclick={onSignOut} disabled={loading}>
        Sign Out
      </button>
    </div>
  {:else}
    <!-- Auth form -->
    <form onsubmit={onSubmit} class="auth-form">
      <input
        type="email"
        class="auth-input"
        bind:value={email}
        placeholder="Email"
        required
      />
      <input
        type="password"
        class="auth-input"
        bind:value={password}
        placeholder="Password"
        minlength={6}
        required
      />

      {#if error}
        <p class="error-text">{error}</p>
      {/if}

      <button type="submit" class="primary auth-submit" disabled={loading}>
        {loading ? "..." : isSignUp ? "Create Account" : "Sign In"}
      </button>

      <button
        type="button"
        class="toggle-mode text-muted"
        onclick={() => { isSignUp = !isSignUp; error = ""; }}
      >
        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
      </button>
    </form>
  {/if}

  {#if error && user}
    <p class="error-text">{error}</p>
  {/if}
</div>

<style>
  .cloud-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  /* ── Signed In ─────────────────────────────────────────────────── */

  .signed-in {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .user-label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .user-email {
    font-size: var(--text-sm);
    color: var(--color-rp);
  }

  .cloud-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .cloud-btn {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
    font-weight: 600;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .save-btn {
    background: rgba(80, 200, 120, 0.15);
    border: 1px solid rgba(80, 200, 120, 0.5);
    color: #50c878;
  }

  .save-btn:hover:not(:disabled) {
    background: rgba(80, 200, 120, 0.3);
  }

  .load-btn {
    background: rgba(130, 170, 255, 0.15);
    border: 1px solid rgba(130, 170, 255, 0.5);
    color: var(--color-ip);
  }

  .load-btn:hover:not(:disabled) {
    background: rgba(130, 170, 255, 0.3);
  }

  .cloud-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .signout-btn {
    background: none;
    border: none;
    font-size: var(--text-xs);
    cursor: pointer;
    text-decoration: underline;
    align-self: flex-start;
    padding: 0;
  }

  .signout-btn:hover {
    color: var(--text-secondary);
  }

  /* ── Auth Form ─────────────────────────────────────────────────── */

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    max-width: 320px;
  }

  .auth-input {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-primary);
  }

  .auth-input:focus {
    outline: none;
    border-color: var(--color-rp);
    box-shadow: 0 0 0 2px rgba(199, 146, 234, 0.2);
  }

  .auth-submit {
    margin-top: var(--space-xs);
  }

  .toggle-mode {
    background: none;
    border: none;
    font-size: var(--text-xs);
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    text-align: left;
  }

  .toggle-mode:hover {
    color: var(--text-secondary);
  }

  .error-text {
    font-size: var(--text-xs);
    color: var(--color-danger);
  }
</style>
