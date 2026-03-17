<script lang="ts">
  import { getState, doSave, doExport, doImport, doHardReset } from "../../stores/game.svelte";
  import { showToast } from "../../stores/ui.svelte";
  import type { Notation } from "../../lib/utils/format";
  import CloudSavePanel from "../shared/CloudSavePanel.svelte";

  const state = $derived(getState());

  function setNotation(n: Notation) {
    state.settings.notation = n;
    doSave();
  }

  function toggleConfirmPrestige() {
    state.settings.showConfirmOnPrestige = !state.settings.showConfirmOnPrestige;
    doSave();
  }

  function toggleOfflineProgress() {
    state.settings.offlineProgressEnabled = !state.settings.offlineProgressEnabled;
    doSave();
  }

  function setAutosaveInterval(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    state.settings.autosaveIntervalSec = val;
    doSave();
  }

  function onImport() {
    const code = window.prompt("Paste your save code:");
    if (code) {
      const success = doImport(code.trim());
      if (success) {
        showToast("Save imported successfully!");
      } else {
        showToast("Failed to import save. Invalid code?");
      }
    }
  }
</script>

<div class="settings-tab">
  <h2>Settings</h2>

  <div class="setting-group">
    <h3>Number Notation</h3>
    <div class="notation-options">
      {#each ["standard", "scientific", "engineering", "letters"] as n}
        <button
          class:active={state.settings.notation === n}
          onclick={() => setNotation(n as Notation)}
        >
          {n}
        </button>
      {/each}
    </div>
  </div>

  <div class="setting-group">
    <h3>Gameplay</h3>

    <label class="toggle-row">
      <input
        type="checkbox"
        checked={state.settings.showConfirmOnPrestige}
        onchange={toggleConfirmPrestige}
      />
      <span>Confirm before prestige</span>
    </label>

    <label class="toggle-row">
      <input
        type="checkbox"
        checked={state.settings.offlineProgressEnabled}
        onchange={toggleOfflineProgress}
      />
      <span>Offline progress</span>
    </label>

    <div class="slider-row">
      <span class="slider-label">Autosave interval</span>
      <input
        type="range"
        min="10"
        max="120"
        step="10"
        value={state.settings.autosaveIntervalSec}
        oninput={setAutosaveInterval}
      />
      <span class="slider-value mono">{state.settings.autosaveIntervalSec}s</span>
    </div>
  </div>

  <div class="setting-group">
    <h3>Save Management</h3>
    <div class="save-actions">
      <button onclick={() => { doSave(); showToast("Game saved!"); }}>
        Save Game
      </button>
      <button onclick={() => {
        const code = doExport();
        navigator.clipboard.writeText(code).then(() => showToast("Exported to clipboard!"));
      }}>
        Export Save
      </button>
      <button onclick={onImport}>
        Import Save
      </button>
    </div>
  </div>

  <div class="setting-group cloud-section">
    <h3>Cloud Save</h3>
    <p class="cloud-desc text-muted">
      Sign in to save your progress to the cloud and play on any device.
    </p>
    <CloudSavePanel />
  </div>

  <div class="setting-group support-section">
    <h3>Support CandleSmoke Games</h3>
    <p class="support-text text-muted">
      Click, For Science! is free to play. If you're enjoying it, consider buying us a coffee!
    </p>
    <a
      href="https://buymeacoffee.com/candlesmokedev"
      target="_blank"
      rel="noopener noreferrer"
      class="coffee-btn"
    >
      <span class="coffee-icon">☕</span> Buy Me a Coffee
    </a>
  </div>

  <div class="setting-group danger-zone">
    <h3>Danger Zone</h3>
    <button class="danger" onclick={() => {
      if (confirm("Delete ALL progress? This cannot be undone.")) {
        if (confirm("Seriously. Everything. Gone. Are you sure?")) {
          doHardReset();
          showToast("Game reset.");
        }
      }
    }}>
      Hard Reset
    </button>
  </div>
</div>

<style>
  .settings-tab {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-lg);
  }

  h2 {
    font-size: var(--text-lg);
    font-weight: 600;
    margin-bottom: var(--space-lg);
  }

  h3 {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-sm);
  }

  .setting-group {
    margin-bottom: var(--space-xl);
  }

  .notation-options,
  .save-actions {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .notation-options button.active {
    background: var(--color-rp);
    color: var(--bg-primary);
    border-color: var(--color-rp);
  }

  /* Toggle rows */
  .toggle-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xs) 0;
    cursor: pointer;
    font-size: var(--text-sm);
  }

  .toggle-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--color-rp);
    cursor: pointer;
  }

  /* Slider row */
  .slider-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
  }

  .slider-label {
    font-size: var(--text-sm);
    min-width: 130px;
  }

  .slider-row input[type="range"] {
    flex: 1;
    accent-color: var(--color-rp);
    cursor: pointer;
  }

  .slider-value {
    font-size: var(--text-sm);
    min-width: 35px;
    text-align: right;
  }

  /* ── Cloud Save Section ─────────────────────────────────────── */

  .cloud-section {
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-lg);
  }

  .cloud-desc {
    font-size: var(--text-sm);
    margin-bottom: var(--space-sm);
    line-height: 1.5;
  }

  /* ── Support Section ──────────────────────────────────────────── */

  .support-section {
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-lg);
  }

  .support-text {
    font-size: var(--text-sm);
    margin-bottom: var(--space-sm);
    line-height: 1.5;
  }

  .coffee-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1a1a1a;
    background: #ffdd00;
    border: none;
    border-radius: var(--radius-md);
    text-decoration: none;
    cursor: pointer;
    transition: background var(--transition-fast), transform var(--transition-fast);
  }

  .coffee-btn:hover {
    background: #ffca00;
    transform: translateY(-1px);
  }

  .coffee-icon {
    font-size: var(--text-base);
  }

  .danger-zone {
    border-top: 1px solid var(--color-danger);
    padding-top: var(--space-lg);
  }

  .danger {
    color: var(--color-danger);
    border-color: var(--color-danger);
  }

  .danger:hover:not(:disabled) {
    background: rgba(240, 113, 120, 0.1);
  }

  @media (max-width: 600px) {
    .settings-tab {
      padding: var(--space-sm);
    }

    .notation-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-xs);
    }

    .notation-options button {
      min-height: 44px;
      font-size: var(--text-sm);
    }

    .save-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-xs);
    }

    .save-actions button {
      min-height: 44px;
    }

    .toggle-row {
      min-height: 44px;
      padding: var(--space-sm) 0;
    }

    .toggle-row input[type="checkbox"] {
      width: 20px;
      height: 20px;
    }

    .slider-row {
      flex-wrap: wrap;
    }

    .slider-label {
      min-width: auto;
      width: 100%;
    }

    .slider-row input[type="range"] {
      min-height: 44px;
    }

    .coffee-btn {
      width: 100%;
      justify-content: center;
      min-height: 48px;
    }
  }
</style>
