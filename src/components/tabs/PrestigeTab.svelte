<script lang="ts">
  import { getState, getRevision, getPendingBP, doPrestigeAction, doSpecialize, buySpecGenerator, buySpecUpgrade, canSpecialize } from "../../stores/game.svelte";
  import { getBuyAmount } from "../../stores/ui.svelte";
  import { formatRP, formatNumber, formatCost } from "../../lib/utils/format";
  import { formatTime } from "../../lib/utils/time";
  import { PRESTIGE_MIN_BP } from "../../lib/engine/formulas";
  import { isPrestigeUpgradeAvailable } from "../../lib/engine/actions";
  import { PRESTIGE_UPGRADES } from "../../lib/data/upgrades.data";
  import { SPECIALIZATIONS } from "../../lib/data/specializations.data";
  import { specGenCost, specGeneratorProduction, SPEC_MIN_MADNESS_LEVEL } from "../../lib/engine/specialization";
  import { showToast } from "../../stores/ui.svelte";
  import { Decimal } from "../../lib/utils/decimal";
  import PrestigeUpgradeRow from "../shared/PrestigeUpgradeRow.svelte";
  import { doStartChallenge, doAbandonChallenge, doAscensionAction, getPendingTP, buyAscensionUpgrade } from "../../stores/game.svelte";
  import { CHALLENGES, getChallengeDef } from "../../lib/data/challenges.data";
  import { isClickingAllowed, areUpgradesAllowed, isResearchAllowedInChallenge, getChallengeTimeLimit } from "../../lib/engine/challenges";
  import { ASCENSION_UPGRADES } from "../../lib/data/ascension.data";
  import { canAscend, isAscensionUpgradeAvailable, ASCENSION_MIN_TP } from "../../lib/engine/ascension";

  const state = $derived(getState());
  const rev = $derived(getRevision());
  const notation = $derived(state.settings.notation);
  const pendingBP = $derived(getPendingBP());
  const canPrestige = $derived(pendingBP.gte(PRESTIGE_MIN_BP));
  const buyAmt = $derived(getBuyAmount());

  // Specialization
  const isSpecialized = $derived(state.specialization.archetype !== null);
  const canSpec = $derived.by(() => { void rev; return canSpecialize(state); });
  const specDef = $derived(
    state.specialization.archetype ? SPECIALIZATIONS[state.specialization.archetype] : null
  );
  const showSpecSection = $derived(
    isSpecialized ||
    (state.madness.dominantArchetype !== null && state.madness.madnessLevel >= SPEC_MIN_MADNESS_LEVEL)
  );

  // Spec generator cost
  const specCost = $derived.by(() => { void rev; return specGenCost(state); });
  const specProd = $derived.by(() => { void rev; return specGeneratorProduction(state); });
  const specCanAfford = $derived(state.rp.gte(specCost));

  let showConfirmDialog = $state(false);

  const tiers: { tier: 1 | 2 | 3; label: string }[] = [
    { tier: 1, label: "Early Breakthroughs" },
    { tier: 2, label: "Deeper Insights" },
    { tier: 3, label: "Transcendent Science" },
  ];

  const visibleUpgrades = $derived(
    PRESTIGE_UPGRADES.filter(
      (u) =>
        state.prestigeUpgrades.includes(u.id) ||
        isPrestigeUpgradeAvailable(state, u.id)
    )
  );

  function upgradesInTier(tier: number) {
    return visibleUpgrades.filter((u) => u.tier === tier);
  }

  function onPrestigeClick() {
    if (!canPrestige) return;
    if (state.settings.showConfirmOnPrestige) {
      showConfirmDialog = true;
    } else {
      executePrestige();
    }
  }

  function executePrestige() {
    showConfirmDialog = false;
    const bpGained = doPrestigeAction();
    if (bpGained) {
      showToast(`Snap Out of It! Gained ${formatNumber(bpGained, notation)} BP.`, 4000);
    }
  }

  function cancelPrestige() {
    showConfirmDialog = false;
  }

  function onSpecialize() {
    doSpecialize();
  }

  function onBuySpecGen() {
    buySpecGenerator(buyAmt);
  }

  function onBuySpecUpgrade(id: string) {
    buySpecUpgrade(id);
  }

  // Challenge Runs
  const showChallenges = $derived(state.labLevel >= 1);
  const activeChallenge = $derived(state.activeChallenge);
  const activeChallengeDef = $derived(activeChallenge ? getChallengeDef(activeChallenge) : null);
  const challengeTimeLimit = $derived.by(() => { void rev; return getChallengeTimeLimit(state); });
  const challengeTimeRemaining = $derived.by(() => {
    if (challengeTimeLimit === null) return null;
    return Math.max(0, challengeTimeLimit - state.currentRunTimeSec);
  });
  const availableChallenges = $derived(
    CHALLENGES.filter((c) => state.labLevel >= c.requiredLabLevel)
  );

  let showChallengeConfirm = $state<string | null>(null);

  function onStartChallenge(id: string) {
    showChallengeConfirm = id;
  }

  function confirmStartChallenge() {
    if (showChallengeConfirm) {
      doStartChallenge(showChallengeConfirm);
      showChallengeConfirm = null;
    }
  }

  function cancelChallengeStart() {
    showChallengeConfirm = null;
  }

  function onAbandonChallenge() {
    doAbandonChallenge();
  }

  // Ascension
  const showAscension = $derived(state.labLevel >= 3 || state.ascensionCount > 0 || state.tp.gt(0));
  const pendingTP = $derived(getPendingTP());
  const canDoAscension = $derived.by(() => { void rev; return canAscend(state); });
  let showAscensionConfirm = $state(false);

  const ascensionTiers: { tier: 1 | 2 | 3; label: string }[] = [
    { tier: 1, label: "Foundation" },
    { tier: 2, label: "Enhancement" },
    { tier: 3, label: "Transcendence" },
  ];

  const visibleAscensionUpgrades = $derived(
    ASCENSION_UPGRADES.filter(
      (u) =>
        state.ascensionUpgrades.includes(u.id) ||
        isAscensionUpgradeAvailable(state, u.id)
    )
  );

  function ascUpgradesInTier(tier: number) {
    return visibleAscensionUpgrades.filter((u) => u.tier === tier);
  }

  function onAscensionClick() {
    if (!canDoAscension) return;
    showAscensionConfirm = true;
  }

  function executeAscension() {
    showAscensionConfirm = false;
    doAscensionAction();
  }

  function cancelAscension() {
    showAscensionConfirm = false;
  }

  function onBuyAscUpgrade(id: string) {
    buyAscensionUpgrade(id);
  }
</script>

<div class="prestige-tab">
  <!-- Prestige Action Section -->
  <div class="prestige-section">
    <h2 class="section-title text-bp">Snap Out of It</h2>
    <p class="section-desc text-muted">
      Reset your run for Breakthrough Points. Generators and regular upgrades reset.
      BP and prestige upgrades persist forever.
    </p>

    <div class="bp-display">
      <div class="bp-current">
        <span class="bp-label">Current BP</span>
        <span class="bp-value text-bp mono">{formatRP(state.bp, notation)}</span>
      </div>
      <div class="bp-pending">
        <span class="bp-label">On Prestige</span>
        <span class="bp-value mono" class:text-bp={canPrestige} class:text-muted={!canPrestige}>
          +{formatRP(pendingBP, notation)} BP
        </span>
      </div>
    </div>

    {#if !canPrestige}
      <p class="bp-hint text-muted">
        Need at least {formatNumber(PRESTIGE_MIN_BP, notation)} BP to prestige.
        Keep producing RP!
      </p>
    {/if}

    <button
      class="prestige-button"
      class:ready={canPrestige}
      disabled={!canPrestige}
      onclick={onPrestigeClick}
    >
      {canPrestige ? "Snap Out of It!" : "Not Yet..."}
    </button>

    {#if state.prestigeCount > 0}
      <div class="prestige-stats text-muted">
        Prestige count: {state.prestigeCount}
        {#if state.fastestPrestigeSec !== null}
          &middot; Fastest: {formatTime(state.fastestPrestigeSec)}
        {/if}
      </div>
    {/if}
  </div>

  <!-- Specialization Section -->
  {#if showSpecSection}
    <div class="spec-section">
      {#if !isSpecialized}
        <!-- Specialization available but not activated -->
        <h2 class="section-title spec-title">Archetype Specialization</h2>
        <p class="section-desc text-muted">
          Your madness has reached a critical point. Embrace your dominant archetype for powerful
          bonuses this run. Resets on prestige — you can pick a different path each time.
        </p>
        {#if canSpec && state.madness.dominantArchetype}
          {@const previewDef = SPECIALIZATIONS[state.madness.dominantArchetype]}
          <div class="spec-preview card">
            <h3 class="spec-name">{previewDef.name}</h3>
            <p class="spec-flavor text-muted">{previewDef.flavorText}</p>
            <div class="spec-bonuses">
              <div class="spec-bonus-item">
                <span class="spec-bonus-label">Unique Generator</span>
                <span>{previewDef.generator.name}</span>
              </div>
              <div class="spec-bonus-item">
                <span class="spec-bonus-label">Passive Ability</span>
                <span>{previewDef.passive.description}</span>
              </div>
              <div class="spec-bonus-item">
                <span class="spec-bonus-label">Prestige Modifier</span>
                <span>{previewDef.prestigeMod.description}</span>
              </div>
            </div>
            <button class="spec-activate-btn" onclick={onSpecialize}>
              Specialize as {previewDef.name}
            </button>
          </div>
        {:else}
          <p class="text-muted" style="text-align: center; font-size: var(--text-xs);">
            Requires madness level {SPEC_MIN_MADNESS_LEVEL}+ and a dominant archetype.
          </p>
        {/if}
      {:else if specDef}
        <!-- Active specialization -->
        <h2 class="section-title spec-title">{specDef.name}</h2>
        <p class="spec-flavor text-muted" style="text-align: center; margin-bottom: var(--space-md);">
          {specDef.flavorText}
        </p>

        <!-- Passive & Prestige Mod info -->
        <div class="spec-info-row">
          <div class="spec-info-card card">
            <span class="spec-info-label">{specDef.passive.name}</span>
            <span class="spec-info-desc text-muted">{specDef.passive.description}</span>
          </div>
          <div class="spec-info-card card">
            <span class="spec-info-label">Prestige Modifier</span>
            <span class="spec-info-desc text-muted">{specDef.prestigeMod.description}</span>
          </div>
        </div>

        <!-- Spec Generator -->
        {#if state.specialization.generator}
          <div class="spec-gen card">
            <div class="spec-gen-info">
              <div class="spec-gen-name">{specDef.generator.name}</div>
              <div class="spec-gen-desc text-muted">{specDef.generator.description}</div>
            </div>
            <div class="spec-gen-stats mono">
              <span class="spec-gen-owned">{state.specialization.generator.owned.toFixed(0)}</span>
              <span class="spec-gen-prod text-rp">{formatRP(specProd, notation)}/s</span>
            </div>
            <button
              class="spec-gen-buy"
              class:primary={specCanAfford}
              disabled={!specCanAfford}
              onclick={onBuySpecGen}
            >
              <span class="buy-label">
                {buyAmt === -1 ? "MAX" : `x${buyAmt}`}
              </span>
              <span class="buy-cost">{formatCost(specCost, notation)} RP</span>
            </button>
          </div>
        {/if}

        <!-- Spec Upgrades -->
        <div class="spec-upgrades">
          <h3 class="tier-label">Specialization Upgrades</h3>
          <div class="spec-upgrade-list">
            {#each specDef.upgrades as upgrade (upgrade.id)}
              {@const owned = state.specialization.purchasedUpgrades.includes(upgrade.id)}
              {@const affordable = state.rp.gte(upgrade.cost)}
              <div class="spec-upgrade-card" class:owned class:affordable={!owned && affordable}>
                <div class="spec-upg-info">
                  <span class="spec-upg-name">{upgrade.name}</span>
                  <span class="spec-upg-desc text-muted">{upgrade.description}</span>
                </div>
                {#if owned}
                  <span class="spec-upg-owned-badge">Owned</span>
                {:else}
                  <button
                    class="spec-upg-buy"
                    class:primary={affordable}
                    disabled={!affordable}
                    onclick={onBuySpecUpgrade.bind(null, upgrade.id)}
                  >
                    {formatCost(upgrade.cost, notation)} RP
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Challenge Runs Section -->
  {#if showChallenges}
    <div class="challenge-section">
      <h2 class="section-title challenge-title">Challenge Runs</h2>
      <p class="section-desc text-muted">
        Modified prestige runs with restrictions. Complete them for permanent rewards.
        Starting a challenge resets your current run.
      </p>

      <!-- Active Challenge Banner -->
      {#if activeChallengeDef}
        <div class="challenge-active-banner">
          <div class="challenge-active-header">
            <span class="challenge-active-label">Active Challenge</span>
            <span class="challenge-active-name">{activeChallengeDef.name}</span>
          </div>
          <p class="challenge-active-desc text-muted">{activeChallengeDef.description}</p>
          <div class="challenge-active-info">
            <span class="challenge-restriction-list">
              {#if !isClickingAllowed(state)}<span class="restriction-tag">No Clicking</span>{/if}
              {#if !areUpgradesAllowed(state)}<span class="restriction-tag">No Upgrades</span>{/if}
              {#if !isResearchAllowedInChallenge(state)}<span class="restriction-tag">No Research</span>{/if}
              {#if challengeTimeLimit !== null}
                <span class="restriction-tag time-tag">
                  Time: {formatTime(challengeTimeRemaining ?? 0)}
                </span>
              {/if}
            </span>
            <span class="challenge-goal mono">Goal: {activeChallengeDef.bpGoal} BP</span>
          </div>
          <div class="challenge-active-actions">
            <span class="challenge-reward-preview text-muted">
              Reward: {activeChallengeDef.rewardDescription}
            </span>
            <button class="challenge-abandon-btn" onclick={onAbandonChallenge}>
              Abandon
            </button>
          </div>
        </div>
      {/if}

      <!-- Challenge List -->
      {#if !activeChallenge}
        <div class="challenge-list">
          {#each availableChallenges as challenge (challenge.id)}
            {@const completed = state.completedChallenges.includes(challenge.id)}
            <div class="challenge-card" class:completed>
              <div class="challenge-card-header">
                <span class="challenge-card-name">
                  {#if completed}<span class="challenge-check">✓</span>{/if}
                  {challenge.name}
                </span>
                {#if challenge.requiredLabLevel >= 2}
                  <span class="challenge-tier-badge">Advanced</span>
                {/if}
              </div>
              <p class="challenge-card-desc text-muted">{challenge.description}</p>
              <p class="challenge-card-flavor text-muted">{challenge.flavorText}</p>
              <div class="challenge-card-footer">
                <div class="challenge-card-details">
                  <span class="challenge-card-goal mono">Goal: {challenge.bpGoal} BP</span>
                  <span class="challenge-card-reward">
                    {completed ? "✓ " : ""}{challenge.rewardDescription}
                  </span>
                </div>
                {#if !completed}
                  <button
                    class="challenge-start-btn"
                    onclick={() => onStartChallenge(challenge.id)}
                  >
                    Start
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Prestige Upgrades Shop -->
  {#if state.bp.gt(0) || state.prestigeUpgrades.length > 0}
    <div class="upgrades-section">
      <h2 class="section-title">Breakthrough Upgrades</h2>
      <p class="section-desc text-muted">
        Permanent bonuses purchased with BP. These persist across all future runs.
      </p>

      {#each tiers as t}
        {@const items = upgradesInTier(t.tier)}
        {#if items.length > 0}
          <div class="tier-group">
            <h3 class="tier-label">Tier {t.tier}: {t.label}</h3>
            <div class="tier-list">
              {#each items as upgrade (upgrade.id)}
                <PrestigeUpgradeRow {upgrade} />
              {/each}
            </div>
          </div>
        {/if}
      {/each}

      {#if visibleUpgrades.length === 0}
        <div class="empty text-muted">
          No prestige upgrades available yet. Earn more BP!
        </div>
      {/if}
    </div>
  {/if}

  <!-- Ascension Section -->
  {#if showAscension}
    <div class="ascension-section">
      <h2 class="section-title ascension-title">Ascension — Thesis Defense</h2>
      <p class="section-desc text-muted">
        Reset everything for Thesis Points. BP, prestige upgrades, research, and lab level reset.
        TP and ascension upgrades persist forever. Requires Underground Facility.
      </p>

      <div class="bp-display">
        <div class="bp-current">
          <span class="bp-label">Current TP</span>
          <span class="bp-value ascension-value mono">{formatNumber(state.tp, notation)}</span>
        </div>
        <div class="bp-pending">
          <span class="bp-label">On Ascension</span>
          <span class="bp-value mono" class:ascension-value={canDoAscension} class:text-muted={!canDoAscension}>
            +{formatNumber(pendingTP, notation)} TP
          </span>
        </div>
      </div>

      {#if !canDoAscension}
        <p class="bp-hint text-muted">
          {#if state.labLevel < 3}
            Requires Underground Facility (lab level 3).
          {:else}
            Need at least {formatNumber(ASCENSION_MIN_TP, notation)} TP to ascend. Spend more BP!
          {/if}
        </p>
      {/if}

      <button
        class="prestige-button ascension-btn"
        class:ready={canDoAscension}
        disabled={!canDoAscension}
        onclick={onAscensionClick}
      >
        {canDoAscension ? "Defend Your Thesis" : "Not Ready..."}
      </button>

      {#if state.ascensionCount > 0}
        <div class="prestige-stats text-muted">
          Ascension count: {state.ascensionCount}
        </div>
      {/if}

      <!-- Ascension Upgrades -->
      {#if state.tp.gt(0) || state.ascensionUpgrades.length > 0}
        <div class="asc-upgrades">
          <h3 class="section-title ascension-title" style="font-size: var(--text-base); margin-top: var(--space-lg);">Thesis Upgrades</h3>
          <p class="section-desc text-muted">Permanent bonuses purchased with TP.</p>

          {#each ascensionTiers as t}
            {@const items = ascUpgradesInTier(t.tier)}
            {#if items.length > 0}
              <div class="tier-group">
                <h3 class="tier-label" style="color: #89ddff;">Tier {t.tier}: {t.label}</h3>
                <div class="tier-list">
                  {#each items as upgrade (upgrade.id)}
                    {@const owned = state.ascensionUpgrades.includes(upgrade.id)}
                    {@const available = isAscensionUpgradeAvailable(state, upgrade.id)}
                    {@const affordable = state.tp.gte(upgrade.cost)}
                    <div class="asc-upgrade-card" class:owned class:available={available && affordable}>
                      <div class="asc-upg-info">
                        <span class="asc-upg-name">{upgrade.name}</span>
                        <span class="asc-upg-desc text-muted">{upgrade.description}</span>
                        <span class="asc-upg-flavor text-muted">{upgrade.flavorText}</span>
                      </div>
                      {#if owned}
                        <span class="asc-upg-owned-badge">Owned</span>
                      {:else}
                        <button
                          class="asc-upg-buy"
                          class:primary={affordable && available}
                          disabled={!affordable || !available}
                          onclick={() => onBuyAscUpgrade(upgrade.id)}
                        >
                          {upgrade.cost} TP
                        </button>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Confirmation Dialog -->
{#if showAscensionConfirm}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="confirm-overlay" onclick={cancelAscension}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="confirm-dialog" onclick={(e) => e.stopPropagation()}>
      <h3 class="confirm-title ascension-title">Defend Your Thesis?</h3>
      <div class="confirm-body">
        <p>You will gain <strong class="ascension-value">{formatNumber(pendingTP, notation)} TP</strong>.</p>
        <div class="confirm-details">
          <div class="detail-col">
            <span class="detail-header text-danger">Resets</span>
            <ul>
              <li>Breakthrough Points</li>
              <li>Prestige upgrades</li>
              <li>Research tree</li>
              <li>Lab level</li>
              <li>Generators & upgrades</li>
              <li>Specialization</li>
            </ul>
          </div>
          <div class="detail-col">
            <span class="detail-header" style="color: #89ddff;">Keeps</span>
            <ul>
              <li>Thesis Points</li>
              <li>Ascension upgrades</li>
              <li>Achievements</li>
              <li>Challenges completed</li>
              <li>NPC relationships</li>
              <li>Madness memory</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="confirm-actions">
        <button onclick={cancelAscension}>Cancel</button>
        <button class="asc-confirm-btn" onclick={executeAscension}>Ascend!</button>
      </div>
    </div>
  </div>
{/if}

{#if showChallengeConfirm}
  {@const confirmDef = getChallengeDef(showChallengeConfirm)}
  {#if confirmDef}
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="confirm-overlay" onclick={cancelChallengeStart}>
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div class="confirm-dialog" onclick={(e) => e.stopPropagation()}>
        <h3 class="confirm-title challenge-title">Start Challenge?</h3>
        <div class="confirm-body">
          <p><strong class="challenge-title">{confirmDef.name}</strong></p>
          <p class="text-muted" style="font-size: var(--text-xs);">{confirmDef.description}</p>
          <p style="margin-top: var(--space-sm); font-size: var(--text-xs);">
            Your current run will be <strong class="text-danger">reset</strong>.
            Complete the challenge by prestiging with {confirmDef.bpGoal}+ BP under the restrictions.
          </p>
          <p style="margin-top: var(--space-xs); font-size: var(--text-xs);">
            Reward: <strong style="color: var(--color-rp);">{confirmDef.rewardDescription}</strong>
          </p>
        </div>
        <div class="confirm-actions">
          <button onclick={cancelChallengeStart}>Cancel</button>
          <button class="challenge-confirm-btn" onclick={confirmStartChallenge}>Accept Challenge</button>
        </div>
      </div>
    </div>
  {/if}
{/if}

{#if showConfirmDialog}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="confirm-overlay" onclick={cancelPrestige}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="confirm-dialog" onclick={(e) => e.stopPropagation()}>
      <h3 class="confirm-title text-bp">Snap Out of It?</h3>
      <div class="confirm-body">
        <p>You will gain <strong class="text-bp">{formatRP(pendingBP, notation)} BP</strong>.</p>
        <div class="confirm-details">
          <div class="detail-col">
            <span class="detail-header text-danger">Resets</span>
            <ul>
              <li>Research Points</li>
              <li>All generators</li>
              <li>Regular upgrades</li>
              <li>Run research</li>
              <li>Specialization</li>
              <li>Active buffs</li>
            </ul>
          </div>
          <div class="detail-col">
            <span class="detail-header text-rp">Keeps</span>
            <ul>
              <li>Breakthrough Points</li>
              <li>Insight Points</li>
              <li>Prestige upgrades</li>
              <li>Permanent research</li>
              <li>Madness memory</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="confirm-actions">
        <button onclick={cancelPrestige}>Cancel</button>
        <button class="confirm-btn" onclick={executePrestige}>Do It!</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .prestige-tab {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
  }

  .prestige-section {
    text-align: center;
    margin-bottom: var(--space-xl);
    padding: var(--space-lg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    backdrop-filter: blur(4px);
  }

  .section-title {
    font-size: var(--text-lg);
    font-weight: 700;
    margin-bottom: var(--space-xs);
  }

  .section-desc {
    font-size: var(--text-sm);
    margin-bottom: var(--space-md);
  }

  .bp-display {
    display: flex;
    justify-content: center;
    gap: var(--space-xl);
    margin-bottom: var(--space-md);
  }

  .bp-current,
  .bp-pending {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .bp-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .bp-value {
    font-size: var(--text-xl);
    font-weight: 700;
  }

  .bp-hint {
    font-size: var(--text-xs);
    margin-bottom: var(--space-md);
  }

  .prestige-button {
    padding: var(--space-sm) var(--space-xl);
    font-size: var(--text-base);
    font-weight: 700;
    letter-spacing: 0.05em;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .prestige-button.ready {
    border-color: var(--color-bp);
    color: var(--color-bp);
    box-shadow: 0 0 20px rgba(199, 146, 234, 0.2);
  }

  .prestige-button.ready:hover:not(:disabled) {
    background: rgba(199, 146, 234, 0.15);
    box-shadow: 0 0 30px rgba(199, 146, 234, 0.3);
  }

  .prestige-stats {
    margin-top: var(--space-sm);
    font-size: var(--text-xs);
  }

  /* Upgrades Section */
  .upgrades-section {
    margin-top: var(--space-lg);
  }

  .tier-group {
    margin-bottom: var(--space-lg);
  }

  .tier-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-bp);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-sm);
  }

  .tier-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .empty {
    text-align: center;
    padding: var(--space-xl);
    font-size: var(--text-base);
  }

  /* Confirmation Dialog */
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .confirm-dialog {
    background: var(--bg-secondary);
    border: 1px solid var(--color-bp);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    max-width: 420px;
    width: 90%;
  }

  .confirm-title {
    font-size: var(--text-lg);
    font-weight: 700;
    margin-bottom: var(--space-md);
    text-align: center;
  }

  .confirm-body {
    margin-bottom: var(--space-md);
    text-align: center;
  }

  .confirm-details {
    display: flex;
    gap: var(--space-lg);
    justify-content: center;
    margin-top: var(--space-md);
    text-align: left;
  }

  .detail-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: var(--text-xs);
  }

  .detail-col li::before {
    content: "• ";
    color: var(--text-muted);
  }

  .detail-header {
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .text-danger {
    color: var(--color-danger);
  }

  .confirm-actions {
    display: flex;
    gap: var(--space-sm);
    justify-content: center;
  }

  .confirm-btn {
    border-color: var(--color-bp);
    color: var(--color-bp);
  }

  .confirm-btn:hover:not(:disabled) {
    background: rgba(199, 146, 234, 0.15);
  }

  /* Specialization Section */
  .spec-section {
    margin-bottom: var(--space-xl);
    padding: var(--space-lg);
    border: 1px solid rgba(255, 165, 0, 0.3);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
  }

  .spec-title {
    color: #ffa500;
  }

  .spec-preview {
    padding: var(--space-md);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .spec-name {
    font-size: var(--text-lg);
    font-weight: 700;
    color: #ffa500;
  }

  .spec-flavor {
    font-size: var(--text-xs);
    font-style: italic;
    line-height: 1.4;
  }

  .spec-bonuses {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    text-align: left;
    font-size: var(--text-xs);
  }

  .spec-bonus-item {
    display: flex;
    gap: var(--space-sm);
  }

  .spec-bonus-label {
    font-weight: 600;
    color: #ffa500;
    min-width: 130px;
    flex-shrink: 0;
  }

  .spec-activate-btn {
    padding: var(--space-sm) var(--space-lg);
    font-weight: 700;
    border-color: #ffa500;
    color: #ffa500;
    transition: all var(--transition-fast);
  }

  .spec-activate-btn:hover:not(:disabled) {
    background: rgba(255, 165, 0, 0.15);
    box-shadow: 0 0 20px rgba(255, 165, 0, 0.2);
  }

  .spec-info-row {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  .spec-info-card {
    flex: 1;
    padding: var(--space-sm);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .spec-info-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: #ffa500;
  }

  .spec-info-desc {
    font-size: var(--text-xs);
    line-height: 1.3;
  }

  .spec-gen {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
    border-color: rgba(255, 165, 0, 0.3);
  }

  .spec-gen-info {
    flex: 1;
    min-width: 0;
  }

  .spec-gen-name {
    font-weight: 600;
    color: #ffa500;
  }

  .spec-gen-desc {
    font-size: var(--text-xs);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .spec-gen-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 80px;
  }

  .spec-gen-owned {
    font-size: var(--text-lg);
    font-weight: 700;
  }

  .spec-gen-prod {
    font-size: var(--text-xs);
  }

  .spec-gen-buy {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100px;
    padding: var(--space-sm) var(--space-md);
  }

  .buy-label {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .buy-cost {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
  }

  .spec-upgrades {
    margin-top: var(--space-sm);
  }

  .spec-upgrade-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .spec-upgrade-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    transition: all var(--transition-fast);
  }

  .spec-upgrade-card.owned {
    border-color: rgba(255, 165, 0, 0.3);
    background: rgba(255, 165, 0, 0.03);
  }

  .spec-upgrade-card.affordable {
    border-color: var(--border-light);
  }

  .spec-upg-info {
    flex: 1;
    min-width: 0;
  }

  .spec-upg-name {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .spec-upg-desc {
    font-size: var(--text-xs);
  }

  .spec-upg-owned-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    color: #ffa500;
    text-transform: uppercase;
  }

  .spec-upg-buy {
    padding: 4px var(--space-md);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  /* Challenge Runs Section */
  .challenge-section {
    margin-bottom: var(--space-xl);
    padding: var(--space-lg);
    border: 1px solid rgba(130, 170, 255, 0.3);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
  }

  .challenge-title {
    color: #82aaff;
  }

  .challenge-active-banner {
    padding: var(--space-md);
    border: 1px solid rgba(130, 170, 255, 0.5);
    border-radius: var(--radius-md);
    background: rgba(130, 170, 255, 0.05);
    margin-bottom: var(--space-md);
  }

  .challenge-active-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
    margin-bottom: var(--space-xs);
  }

  .challenge-active-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: #82aaff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .challenge-active-name {
    font-size: var(--text-base);
    font-weight: 700;
    color: #82aaff;
  }

  .challenge-active-desc {
    font-size: var(--text-xs);
    margin-bottom: var(--space-sm);
  }

  .challenge-active-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin-bottom: var(--space-sm);
  }

  .challenge-restriction-list {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
  }

  .restriction-tag {
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 1px var(--space-xs);
    border-radius: var(--radius-sm);
    background: rgba(255, 83, 112, 0.15);
    color: var(--color-danger);
    border: 1px solid rgba(255, 83, 112, 0.3);
  }

  .time-tag {
    background: rgba(255, 203, 107, 0.15);
    color: var(--color-warning);
    border-color: rgba(255, 203, 107, 0.3);
  }

  .challenge-goal {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-bp);
  }

  .challenge-active-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
  }

  .challenge-reward-preview {
    font-size: var(--text-xs);
    font-style: italic;
  }

  .challenge-abandon-btn {
    font-size: var(--text-xs);
    padding: 2px var(--space-sm);
    border-color: var(--color-danger);
    color: var(--color-danger);
  }

  .challenge-abandon-btn:hover:not(:disabled) {
    background: rgba(255, 83, 112, 0.15);
  }

  .challenge-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .challenge-card {
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.5);
    transition: all var(--transition-fast);
  }

  .challenge-card:hover:not(.completed) {
    border-color: rgba(130, 170, 255, 0.4);
  }

  .challenge-card.completed {
    border-color: rgba(130, 170, 255, 0.2);
    background: rgba(130, 170, 255, 0.03);
    opacity: 0.7;
  }

  .challenge-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    margin-bottom: 2px;
  }

  .challenge-card-name {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .challenge-check {
    color: #82aaff;
    margin-right: 2px;
  }

  .challenge-tier-badge {
    font-size: 0.6rem;
    font-weight: 600;
    padding: 1px var(--space-xs);
    border-radius: var(--radius-sm);
    background: rgba(199, 146, 234, 0.15);
    color: var(--color-bp);
    border: 1px solid rgba(199, 146, 234, 0.3);
    text-transform: uppercase;
  }

  .challenge-card-desc {
    font-size: var(--text-xs);
    margin-bottom: 2px;
  }

  .challenge-card-flavor {
    font-size: 0.65rem;
    font-style: italic;
    margin-bottom: var(--space-xs);
    opacity: 0.7;
  }

  .challenge-card-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-sm);
  }

  .challenge-card-details {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .challenge-card-goal {
    font-size: var(--text-xs);
    color: var(--color-bp);
    font-weight: 600;
  }

  .challenge-card-reward {
    font-size: var(--text-xs);
    color: var(--color-rp);
  }

  .challenge-start-btn {
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 4px var(--space-md);
    border-color: #82aaff;
    color: #82aaff;
    flex-shrink: 0;
  }

  .challenge-start-btn:hover:not(:disabled) {
    background: rgba(130, 170, 255, 0.15);
    box-shadow: 0 0 12px rgba(130, 170, 255, 0.2);
  }

  .challenge-confirm-btn {
    border-color: #82aaff;
    color: #82aaff;
  }

  .challenge-confirm-btn:hover:not(:disabled) {
    background: rgba(130, 170, 255, 0.15);
  }

  /* Ascension Section */
  .ascension-section {
    margin-top: var(--space-xl);
    margin-bottom: var(--space-xl);
    padding: var(--space-lg);
    border: 1px solid rgba(137, 221, 255, 0.3);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.85);
    text-align: center;
  }

  .ascension-title {
    color: #89ddff;
  }

  .ascension-value {
    color: #89ddff;
  }

  .ascension-btn.ready {
    border-color: #89ddff;
    color: #89ddff;
    box-shadow: 0 0 20px rgba(137, 221, 255, 0.2);
  }

  .ascension-btn.ready:hover:not(:disabled) {
    background: rgba(137, 221, 255, 0.15);
    box-shadow: 0 0 30px rgba(137, 221, 255, 0.3);
  }

  .asc-upgrades {
    text-align: left;
    margin-top: var(--space-md);
  }

  .asc-upgrade-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: rgba(26, 29, 39, 0.75);
    transition: all var(--transition-fast);
  }

  .asc-upgrade-card.owned {
    border-color: rgba(137, 221, 255, 0.3);
    background: rgba(137, 221, 255, 0.03);
  }

  .asc-upgrade-card.available {
    border-color: rgba(137, 221, 255, 0.4);
  }

  .asc-upg-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .asc-upg-name {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .asc-upg-desc {
    font-size: var(--text-xs);
  }

  .asc-upg-flavor {
    font-size: 0.65rem;
    font-style: italic;
    opacity: 0.6;
  }

  .asc-upg-owned-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    color: #89ddff;
    text-transform: uppercase;
  }

  .asc-upg-buy {
    padding: 4px var(--space-md);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    white-space: nowrap;
    border-color: #89ddff;
    color: #89ddff;
  }

  .asc-upg-buy:hover:not(:disabled) {
    background: rgba(137, 221, 255, 0.1);
  }

  .asc-confirm-btn {
    border-color: #89ddff;
    color: #89ddff;
  }

  .asc-confirm-btn:hover:not(:disabled) {
    background: rgba(137, 221, 255, 0.15);
  }

  @media (max-width: 600px) {
    .prestige-tab {
      padding: var(--space-sm);
    }

    .bp-display {
      flex-direction: column;
      gap: var(--space-md);
    }

    .spec-info-row {
      flex-direction: column;
    }

    .spec-gen {
      flex-wrap: wrap;
    }

    .spec-gen-buy {
      width: 100%;
      flex-direction: row;
      justify-content: center;
      gap: var(--space-sm);
      min-height: 44px;
    }

    .challenge-card-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .challenge-start-btn {
      width: 100%;
      min-height: 44px;
    }

    /* Confirm dialogs */
    .confirm-dialog {
      max-width: calc(100vw - 32px);
      padding: var(--space-md);
    }

    .confirm-details {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .confirm-actions {
      flex-direction: column;
      gap: var(--space-xs);
    }

    .confirm-actions button {
      width: 100%;
      min-height: 44px;
    }
  }
</style>
