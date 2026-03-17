<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { initGame, doTick, doSave, doClick, getState } from "./stores/game.svelte";
  import { initMusic } from "./lib/audio/music";
  import { initAnalytics, shutdownAnalytics } from "./lib/analytics/tracker";
  import { getActiveTab, setActiveTab, setOfflineMessage, getOfflineMessage, flashSaveIndicator, getActiveEvent, type GameTab } from "./stores/ui.svelte";

  import Header from "./components/layout/Header.svelte";
  import TabBar from "./components/layout/TabBar.svelte";
  import Footer from "./components/layout/Footer.svelte";
  import Toast from "./components/shared/Toast.svelte";
  import NewsTicker from "./components/shared/NewsTicker.svelte";
  import EventModal from "./components/shared/EventModal.svelte";

  import GeneratorsTab from "./components/tabs/GeneratorsTab.svelte";
  import UpgradesTab from "./components/tabs/UpgradesTab.svelte";
  import ResearchTab from "./components/tabs/ResearchTab.svelte";
  import PrestigeTab from "./components/tabs/PrestigeTab.svelte";
  import AchievementsTab from "./components/tabs/AchievementsTab.svelte";
  import JournalTab from "./components/tabs/JournalTab.svelte";
  import StatsTab from "./components/tabs/StatsTab.svelte";
  import NeighborhoodTab from "./components/tabs/NeighborhoodTab.svelte";
  import LeaderboardTab from "./components/tabs/LeaderboardTab.svelte";
  import SettingsTab from "./components/tabs/SettingsTab.svelte";

  const activeTab = $derived(getActiveTab());
  const offlineMsg = $derived(getOfflineMessage());
  const archetype = $derived(getState().madness.dominantArchetype);

  // Background video changes with prestige level (1-6, capping at 6)
  const bgIndex = $derived(Math.min(getState().prestigeCount + 1, 6));
  const bgSrc = $derived(`/bg${bgIndex}.mp4`);

  let rafId: number | null = null;
  let lastTickTime = 0;
  let saveAccum = 0;
  let running = true;

  function tick() {
    if (!running) return;

    const now = performance.now();
    const deltaSec = (now - lastTickTime) / 1000;
    lastTickTime = now;

    // Clamp delta to avoid huge jumps (e.g., tab was backgrounded)
    const clampedDelta = Math.min(deltaSec, 1);
    doTick(clampedDelta);

    // Autosave — reads interval from settings each frame (reactive to changes)
    saveAccum += clampedDelta;
    const interval = getState().settings.autosaveIntervalSec;
    if (saveAccum >= interval) {
      saveAccum = 0;
      doSave();
      flashSaveIndicator();
    }

    rafId = requestAnimationFrame(tick);
  }

  onMount(() => {
    // Load save and check for offline progress
    const offlineReport = initGame();
    if (offlineReport) {
      setOfflineMessage(offlineReport);
    }

    // Initialize music (auto-starts on first user interaction)
    initMusic();

    // Initialize analytics tracking
    initAnalytics(getState);

    // Start game loop — synced to display refresh (typically 60fps)
    lastTickTime = performance.now();
    rafId = requestAnimationFrame(tick);
  });

  onDestroy(() => {
    running = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    shutdownAnalytics();
    doSave(); // Save on close
  });

  function dismissOffline() {
    setOfflineMessage(null);
  }

  // ── Keyboard Shortcuts ──────────────────────────────────────────────

  const TAB_KEYS: Record<string, GameTab> = {
    "1": "generators",
    "2": "upgrades",
    "3": "research",
    "4": "prestige",
    "5": "neighborhood",
    "6": "achievements",
    "7": "journal",
    "8": "leaderboard",
    "9": "stats",
    "0": "settings",
  };

  function onGlobalKeydown(e: KeyboardEvent) {
    // Don't capture when typing in inputs or when event modal is open
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (getActiveEvent() !== null) return;

    // Tab switching: 1-9
    if (!e.ctrlKey && !e.altKey && !e.metaKey && TAB_KEYS[e.key]) {
      e.preventDefault();
      setActiveTab(TAB_KEYS[e.key]);
      return;
    }

    // Space = click (only on generators tab)
    if (e.key === " " && getActiveTab() === "generators") {
      e.preventDefault();
      doClick();
      return;
    }

    // S = manual save
    if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
      doSave();
      flashSaveIndicator();
      return;
    }
  }
</script>

<svelte:window onkeydown={onGlobalKeydown} />

{#key bgSrc}
  <!-- svelte-ignore a11y_media_has_caption -->
  <video class="bg-video" autoplay loop muted playsinline>
    <source src={bgSrc} type="video/mp4" />
  </video>
{/key}

<div class="app" class:archetype-megalomaniac={archetype === "megalomaniac"} class:archetype-perfectionist={archetype === "perfectionist"} class:archetype-unhinged={archetype === "unhinged"} class:archetype-realityBreaker={archetype === "realityBreaker"} class:archetype-gadgeteer={archetype === "gadgeteer"} class:archetype-accidentalGenius={archetype === "accidentalGenius"}>
  <Header />
  <TabBar />

  <main class="content">
    {#if activeTab === "generators"}
      <GeneratorsTab />
    {:else if activeTab === "upgrades"}
      <UpgradesTab />
    {:else if activeTab === "research"}
      <ResearchTab />
    {:else if activeTab === "prestige"}
      <PrestigeTab />
    {:else if activeTab === "neighborhood"}
      <NeighborhoodTab />
    {:else if activeTab === "achievements"}
      <AchievementsTab />
    {:else if activeTab === "journal"}
      <JournalTab />
    {:else if activeTab === "leaderboard"}
      <LeaderboardTab />
    {:else if activeTab === "stats"}
      <StatsTab />
    {:else if activeTab === "settings"}
      <SettingsTab />
    {:else}
      <div class="placeholder">
        <p class="text-muted">Coming soon...</p>
      </div>
    {/if}
  </main>

  <Footer />
  <Toast />
  <NewsTicker />
  <EventModal />

  <!-- Offline progress popup -->
  {#if offlineMsg}
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="offline-overlay" onclick={dismissOffline} onkeydown={(e) => { if (e.key === 'Escape') dismissOffline(); }}>
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div class="offline-popup card" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
        <h3>Welcome Back, Scientist!</h3>
        <p>{offlineMsg}</p>
        <button class="primary" onclick={dismissOffline}>Continue Research</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .bg-video {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    z-index: -1;
    opacity: 0.15;
    pointer-events: none;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
  }

  .content {
    flex: 1;
    overflow-y: auto;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    font-size: var(--text-lg);
  }

  .offline-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
  }

  .offline-popup {
    max-width: 450px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .offline-popup h3 {
    font-size: var(--text-lg);
    color: var(--color-rp);
  }

  .offline-popup p {
    color: var(--text-secondary);
    line-height: 1.6;
  }

  @media (max-width: 600px) {
    .offline-popup {
      max-width: calc(100vw - 32px);
      padding: var(--space-md);
    }

    .offline-popup h3 {
      font-size: var(--text-base);
    }
  }
</style>
