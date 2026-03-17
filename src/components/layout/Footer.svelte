<script lang="ts">
  import { doSave, doExport, doHardReset } from "../../stores/game.svelte";
  import { showToast, getLastSaveFlash, flashSaveIndicator } from "../../stores/ui.svelte";
  import {
    toggleMusic,
    skipTrack,
    getMusicVolume,
    setMusicVolume,
    toggleMute,
    isMuted,
  } from "../../lib/audio/music";

  const savedFlash = $derived(getLastSaveFlash());

  // Music state — reactive via manual tracking since audio is external
  let musicPlaying = $state(false);
  let musicMuted = $state(isMuted());
  let musicVolume = $state(getMusicVolume());

  function onToggleMusic() {
    musicPlaying = toggleMusic();
  }

  function onSkip() {
    skipTrack();
  }

  function onToggleMute() {
    musicMuted = toggleMute();
  }

  function onVolumeChange(e: Event) {
    const val = Number((e.target as HTMLInputElement).value) / 100;
    setMusicVolume(val);
    musicVolume = val;
  }

  function onSave() {
    doSave();
    flashSaveIndicator();
    showToast("Game saved!");
  }

  function onExport() {
    const code = doExport();
    navigator.clipboard.writeText(code).then(() => {
      showToast("Save exported to clipboard!");
    }).catch(() => {
      // Fallback: show in a prompt
      window.prompt("Copy this save code:", code);
    });
  }

  function onHardReset() {
    if (confirm("Are you sure? This will DELETE all progress permanently.")) {
      if (confirm("Really? There's no going back.")) {
        doHardReset();
        showToast("Game reset. Fresh start!");
      }
    }
  }
</script>

<footer class="footer">
  <div class="footer-actions">
    <button onclick={onSave}>Save</button>
    <button onclick={onExport}>Export</button>
    <button class="danger" onclick={onHardReset}>Hard Reset</button>
  </div>

  <div class="music-controls">
    <button class="music-btn" onclick={onToggleMusic} title={musicPlaying ? "Pause" : "Play"}>
      {musicPlaying ? "⏸" : "▶"}
    </button>
    <button class="music-btn" onclick={onSkip} title="Skip track">⏭</button>
    <button class="music-btn" onclick={onToggleMute} title={musicMuted ? "Unmute" : "Mute"}>
      {musicMuted ? "🔇" : musicVolume < 0.3 ? "🔈" : musicVolume < 0.7 ? "🔉" : "🔊"}
    </button>
    <input
      type="range"
      class="volume-slider"
      min="0"
      max="100"
      value={musicVolume * 100}
      oninput={onVolumeChange}
      title="Volume"
    />
  </div>

  <span class="footer-info text-muted">
    {#if savedFlash}<span class="saved-indicator">Saved</span>{/if}
    Click, For Science! v0.1.0
    <span class="footer-sep">·</span>
    <a href="https://buymeacoffee.com/candlesmokedev" target="_blank" rel="noopener noreferrer" class="coffee-link">☕ Support</a>
  </span>
</footer>

<style>
  .footer {
    background: rgba(26, 29, 39, 0.8);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--border-color);
    padding: var(--space-sm) var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .footer-info {
    font-size: var(--text-xs);
  }

  /* ── Music Controls ──────────────────────────────────────────────── */

  .music-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .music-btn {
    padding: 2px 6px;
    font-size: var(--text-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    line-height: 1;
    transition: border-color var(--transition-fast), color var(--transition-fast);
  }

  .music-btn:hover {
    border-color: var(--color-rp);
    color: var(--text-primary);
  }

  .volume-slider {
    width: 64px;
    accent-color: var(--color-rp);
    cursor: pointer;
  }

  .danger {
    color: var(--color-danger);
    border-color: var(--color-danger);
  }

  .danger:hover:not(:disabled) {
    background: rgba(240, 113, 120, 0.1);
  }

  .saved-indicator {
    color: var(--color-rp);
    font-size: var(--text-xs);
    margin-right: var(--space-sm);
    animation: fade-in-out 1.5s ease forwards;
  }

  @keyframes fade-in-out {
    0% { opacity: 0; }
    15% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }

  .footer-sep {
    margin: 0 var(--space-xs);
    opacity: 0.4;
  }

  .coffee-link {
    color: #ffdd00;
    text-decoration: none;
    font-size: var(--text-xs);
    transition: color var(--transition-fast);
  }

  .coffee-link:hover {
    color: #ffca00;
    text-decoration: underline;
  }

  @media (max-width: 600px) {
    .footer {
      flex-wrap: wrap;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      justify-content: center;
    }

    .footer-actions {
      order: 1;
    }

    .footer-actions button {
      min-height: 36px;
      min-width: 44px;
      padding: var(--space-xs) var(--space-sm);
      font-size: var(--text-xs);
    }

    .music-controls {
      order: 2;
    }

    .music-btn {
      min-height: 36px;
      min-width: 36px;
      padding: 4px 8px;
    }

    .volume-slider {
      width: 48px;
    }

    .footer-info {
      order: 3;
      width: 100%;
      text-align: center;
      font-size: 0.65rem;
    }
  }
</style>
