<svelte:options runes={true} />

<script lang="ts">
  type TxType = "send" | "swap" | "stake" | "approve";

  let {
    open = $bindable(false),
    type = "send" as TxType,
    fromLabel = "",
    toLabel = "",
    amount = "",
    token = "",
    gasEstimate = "",
    gasCurrency = "ETH",
    networkName = "Ethereum",
    onconfirm,
    oncancel,
  }: {
    open?: boolean;
    type?: TxType;
    fromLabel?: string;
    toLabel?: string;
    amount?: string;
    token?: string;
    gasEstimate?: string;
    gasCurrency?: string;
    networkName?: string;
    onconfirm?: () => void;
    oncancel?: () => void;
  } = $props();

  let typeLabel = $derived(
    type === "send"
      ? "Send"
      : type === "swap"
        ? "Swap"
        : type === "stake"
          ? "Stake"
          : "Approve"
  );

  function truncateAddress(addr: string): string {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function handleOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains("cy-tx-confirm__overlay")) {
      oncancel?.();
      open = false;
    }
  }

  function handleCancel() {
    oncancel?.();
    open = false;
  }

  function handleConfirm() {
    onconfirm?.();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="cy-tx-confirm__overlay" onclick={handleOverlayClick}>
    <div class="cy-tx-confirm" role="dialog" aria-label="Confirm transaction">
      <div class="cy-tx-confirm__icon cy-tx-confirm__icon--{type}">
        {#if type === "send"}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else if type === "swap"}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else if type === "stake"}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        {:else}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          </svg>
        {/if}
      </div>

      <h3 class="cy-tx-confirm__title">Confirm {typeLabel}</h3>

      <div class="cy-tx-confirm__amount-section">
        <span class="cy-tx-confirm__amount">{amount}</span>
        <span class="cy-tx-confirm__token">{token}</span>
      </div>

      {#if fromLabel && toLabel}
        <div class="cy-tx-confirm__addresses">
          <div class="cy-tx-confirm__address">
            <span class="cy-tx-confirm__address-label">From</span>
            <span class="cy-tx-confirm__address-value" title={fromLabel}>{truncateAddress(fromLabel)}</span>
          </div>
          <div class="cy-tx-confirm__arrow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M8 13l-3-3M8 13l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="cy-tx-confirm__address">
            <span class="cy-tx-confirm__address-label">To</span>
            <span class="cy-tx-confirm__address-value" title={toLabel}>{truncateAddress(toLabel)}</span>
          </div>
        </div>
      {/if}

      <div class="cy-tx-confirm__details">
        {#if gasEstimate}
          <div class="cy-tx-confirm__detail-row">
            <span class="cy-tx-confirm__detail-label">Estimated Gas</span>
            <span class="cy-tx-confirm__detail-value">{gasEstimate} {gasCurrency}</span>
          </div>
        {/if}
        <div class="cy-tx-confirm__detail-row">
          <span class="cy-tx-confirm__detail-label">Network</span>
          <span class="cy-tx-confirm__network-badge">{networkName}</span>
        </div>
      </div>

      <p class="cy-tx-confirm__warning">Please verify all details before confirming</p>

      <div class="cy-tx-confirm__actions">
        <button class="cy-tx-confirm__btn cy-tx-confirm__btn--cancel" onclick={handleCancel}>
          Cancel
        </button>
        <button class="cy-tx-confirm__btn cy-tx-confirm__btn--confirm" onclick={handleConfirm}>
          Confirm {typeLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .cy-tx-confirm__overlay {
    position: fixed;
    inset: 0;
    background: var(--color-overlay, rgba(0, 0, 0, 0.6));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .cy-tx-confirm {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-6, 1.5rem);
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4, 1rem);
  }

  .cy-tx-confirm__icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-full, 50%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cy-tx-confirm__icon--send {
    background: var(--color-state-info-bg);
    color: var(--color-state-info);
  }

  .cy-tx-confirm__icon--swap {
    background: var(--color-state-success-bg);
    color: var(--color-state-success);
  }

  .cy-tx-confirm__icon--stake {
    background: var(--color-state-warning-bg);
    color: var(--color-state-warning);
  }

  .cy-tx-confirm__icon--approve {
    background: var(--color-state-success-bg);
    color: var(--color-action-brand-default);
  }

  .cy-tx-confirm__title {
    font-size: 1.125rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    margin: 0;
  }

  .cy-tx-confirm__amount-section {
    display: flex;
    align-items: baseline;
    gap: var(--space-2, 0.5rem);
  }

  .cy-tx-confirm__amount {
    font-family: var(--font-mono, monospace);
    font-size: 2rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .cy-tx-confirm__token {
    font-size: 1rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-tx-confirm__addresses {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    width: 100%;
    background: var(--color-surface-raised);
    border-radius: var(--radius-md, 8px);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
  }

  .cy-tx-confirm__address {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }

  .cy-tx-confirm__address-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-tx-confirm__address-value {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    color: var(--color-text-primary);
  }

  .cy-tx-confirm__arrow {
    color: var(--color-text-secondary);
    padding: var(--space-1, 0.25rem) 0;
  }

  .cy-tx-confirm__details {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .cy-tx-confirm__detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8125rem;
  }

  .cy-tx-confirm__detail-label {
    color: var(--color-text-secondary);
  }

  .cy-tx-confirm__detail-value {
    color: var(--color-text-primary);
    font-family: var(--font-mono, monospace);
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-tx-confirm__network-badge {
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
    padding: 0.125rem var(--space-2, 0.5rem);
    border-radius: var(--radius-pill, 999px);
  }

  .cy-tx-confirm__warning {
    font-size: 0.75rem;
    color: var(--color-state-warning);
    text-align: center;
    margin: 0;
    font-style: italic;
  }

  .cy-tx-confirm__actions {
    display: flex;
    gap: var(--space-3, 0.75rem);
    width: 100%;
  }

  .cy-tx-confirm__btn {
    flex: 1;
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border: none;
    border-radius: var(--radius-md, 8px);
    font-size: 0.875rem;
    font-weight: var(--font-weight-bold, 700);
    cursor: pointer;
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-tx-confirm__btn--cancel {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    color: var(--color-text-secondary);
  }

  .cy-tx-confirm__btn--cancel:hover {
    color: var(--color-text-primary);
    border-color: var(--color-text-secondary);
  }

  .cy-tx-confirm__btn--confirm {
    background: var(--color-action-brand-default);
    color: var(--color-text-on-brand);
  }

  .cy-tx-confirm__btn--confirm:hover {
    background: var(--color-action-brand-hover);
  }
</style>
