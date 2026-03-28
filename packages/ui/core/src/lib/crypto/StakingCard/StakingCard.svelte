<svelte:options runes={true} />

<script lang="ts">
  type StakingStatus = "active" | "locked" | "unlocking" | "claimable";

  let {
    token = "ETH",
    stakedAmount = "32.00",
    apy = "4.2%",
    rewards = "1.245",
    lockPeriod = "",
    unlockDate = "",
    status = "active" as StakingStatus,
    onstake,
    onclaim,
    onunstake,
  }: {
    token?: string;
    stakedAmount?: string;
    apy?: string;
    rewards?: string;
    lockPeriod?: string;
    unlockDate?: string;
    status?: StakingStatus;
    onstake?: () => void;
    onclaim?: () => void;
    onunstake?: () => void;
  } = $props();

  let statusLabel = $derived(
    status === "active"
      ? "Active"
      : status === "locked"
        ? "Locked"
        : status === "unlocking"
          ? "Unlocking"
          : "Claimable"
  );
</script>

<div class="cy-staking">
  <div class="cy-staking__header">
    <div class="cy-staking__token">
      <div class="cy-staking__token-icon">{token.charAt(0)}</div>
      <span class="cy-staking__token-name">{token}</span>
    </div>
    <span class="cy-staking__status cy-staking__status--{status}">{statusLabel}</span>
  </div>

  <div class="cy-staking__amount-section">
    <span class="cy-staking__amount-label">Staked</span>
    <div class="cy-staking__amount">
      <span class="cy-staking__amount-value">{stakedAmount}</span>
      <span class="cy-staking__amount-token">{token}</span>
    </div>
  </div>

  <div class="cy-staking__apy">
    <span class="cy-staking__apy-label">APY</span>
    <span class="cy-staking__apy-badge">{apy}</span>
  </div>

  <div class="cy-staking__rewards">
    <span class="cy-staking__rewards-label">Rewards Earned</span>
    <span class="cy-staking__rewards-value">{rewards} {token}</span>
  </div>

  {#if lockPeriod}
    <div class="cy-staking__detail-row">
      <span class="cy-staking__detail-label">Lock Period</span>
      <span class="cy-staking__detail-value">{lockPeriod}</span>
    </div>
  {/if}

  {#if unlockDate}
    <div class="cy-staking__detail-row">
      <span class="cy-staking__detail-label">Unlock Date</span>
      <span class="cy-staking__detail-value">{unlockDate}</span>
    </div>
  {/if}

  <div class="cy-staking__actions">
    {#if status === "active" || status === "unlocking"}
      <button class="cy-staking__btn cy-staking__btn--primary" onclick={() => onstake?.()}>
        Stake More
      </button>
    {/if}
    {#if status === "claimable" || (status === "active" && parseFloat(rewards) > 0)}
      <button class="cy-staking__btn cy-staking__btn--brand" onclick={() => onclaim?.()}>
        Claim Rewards
      </button>
    {/if}
    {#if status === "active"}
      <button class="cy-staking__btn cy-staking__btn--secondary" onclick={() => onunstake?.()}>
        Unstake
      </button>
    {/if}
    {#if status === "locked"}
      <button class="cy-staking__btn cy-staking__btn--disabled" disabled>
        Locked
      </button>
    {/if}
  </div>
</div>

<style>
  .cy-staking {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-5, 1.25rem);
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    max-width: 360px;
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-staking:hover {
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-staking__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cy-staking__token {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
  }

  .cy-staking__token-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full, 50%);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-bold, 700);
    font-size: 1rem;
    color: var(--color-action-brand-default);
  }

  .cy-staking__token-name {
    font-weight: var(--font-weight-bold, 700);
    font-size: 1.125rem;
    color: var(--color-text-primary);
  }

  .cy-staking__status {
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
    padding: 0.125rem var(--space-2, 0.5rem);
    border-radius: var(--radius-pill, 999px);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cy-staking__status--active {
    color: var(--color-state-success);
    background: var(--color-state-success-bg);
  }

  .cy-staking__status--locked {
    color: var(--color-state-warning);
    background: var(--color-state-warning-bg);
  }

  .cy-staking__status--unlocking {
    color: var(--color-state-info);
    background: var(--color-state-info-bg);
  }

  .cy-staking__status--claimable {
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
  }

  .cy-staking__amount-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-1, 0.25rem);
  }

  .cy-staking__amount-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cy-staking__amount {
    display: flex;
    align-items: baseline;
    gap: var(--space-2, 0.5rem);
  }

  .cy-staking__amount-value {
    font-family: var(--font-mono, monospace);
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .cy-staking__amount-token {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-staking__apy {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cy-staking__apy-label {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .cy-staking__apy-badge {
    font-family: var(--font-mono, monospace);
    font-size: 0.875rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-state-success);
    background: var(--color-state-success-bg);
    padding: 0.125rem var(--space-3, 0.75rem);
    border-radius: var(--radius-pill, 999px);
  }

  .cy-staking__rewards {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    background: var(--color-surface-raised);
    border-radius: var(--radius-md, 8px);
  }

  .cy-staking__rewards-label {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .cy-staking__rewards-value {
    font-family: var(--font-mono, monospace);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary);
  }

  .cy-staking__detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8125rem;
  }

  .cy-staking__detail-label {
    color: var(--color-text-secondary);
  }

  .cy-staking__detail-value {
    color: var(--color-text-primary);
    font-family: var(--font-mono, monospace);
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-staking__actions {
    display: flex;
    gap: var(--space-2, 0.5rem);
    margin-top: var(--space-1, 0.25rem);
  }

  .cy-staking__btn {
    flex: 1;
    padding: var(--space-3, 0.75rem);
    border: none;
    border-radius: var(--radius-md, 8px);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-bold, 700);
    cursor: pointer;
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-staking__btn--brand {
    background: var(--color-action-brand-default);
    color: var(--color-text-on-brand);
  }

  .cy-staking__btn--brand:hover {
    background: var(--color-action-brand-hover);
  }

  .cy-staking__btn--primary {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    color: var(--color-text-primary);
  }

  .cy-staking__btn--primary:hover {
    border-color: var(--color-action-brand-default);
    color: var(--color-action-brand-default);
  }

  .cy-staking__btn--secondary {
    background: transparent;
    border: 1px solid var(--color-border-default);
    color: var(--color-text-secondary);
  }

  .cy-staking__btn--secondary:hover {
    border-color: var(--color-state-error);
    color: var(--color-state-error);
  }

  .cy-staking__btn--disabled {
    background: var(--color-surface-raised);
    color: var(--color-text-secondary);
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
