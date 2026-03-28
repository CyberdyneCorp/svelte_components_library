<svelte:options runes={true} />

<script lang="ts">
  interface Token {
    symbol: string;
    balance: string;
    icon?: string;
  }

  let {
    fromToken = $bindable({ symbol: "ETH", balance: "5.23" }),
    toToken = $bindable({ symbol: "USDC", balance: "10,240" }),
    fromAmount = $bindable(""),
    toAmount = "",
    exchangeRate = "",
    priceImpact = "",
    slippage = 0.5,
    loading = false,
    onswap,
    ontokenselect,
  }: {
    fromToken?: Token;
    toToken?: Token;
    fromAmount?: string;
    toAmount?: string;
    exchangeRate?: string;
    priceImpact?: string;
    slippage?: number;
    loading?: boolean;
    onswap?: () => void;
    ontokenselect?: (side: "from" | "to") => void;
  } = $props();

  let isValid = $derived(
    fromAmount !== "" &&
      parseFloat(fromAmount) > 0 &&
      fromToken.symbol !== "" &&
      toToken.symbol !== ""
  );

  function handleSwapDirection() {
    const temp = fromToken;
    fromToken = toToken;
    toToken = temp;
  }

  function handleMax() {
    fromAmount = fromToken.balance.replace(/,/g, "");
  }

  let minimumReceived = $derived(() => {
    if (!toAmount || !slippage) return "";
    const amt = parseFloat(toAmount.replace(/,/g, ""));
    if (isNaN(amt)) return "";
    return (amt * (1 - slippage / 100)).toFixed(4);
  });
</script>

<div class="cy-swap">
  <div class="cy-swap__section">
    <div class="cy-swap__section-header">
      <span class="cy-swap__label">From</span>
      <span class="cy-swap__balance">Balance: {fromToken.balance}</span>
    </div>
    <div class="cy-swap__input-row">
      <input
        type="text"
        class="cy-swap__amount-input"
        placeholder="0.0"
        bind:value={fromAmount}
        inputmode="decimal"
      />
      <button
        class="cy-swap__token-badge"
        onclick={() => ontokenselect?.("from")}
      >
        {#if fromToken.icon}
          <span class="cy-swap__token-icon">{fromToken.icon}</span>
        {/if}
        {fromToken.symbol}
      </button>
    </div>
    <button class="cy-swap__max-btn" onclick={handleMax}>MAX</button>
  </div>

  <button class="cy-swap__direction-btn" onclick={handleSwapDirection} aria-label="Swap direction">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3v14M10 17l-4-4M10 17l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  <div class="cy-swap__section">
    <div class="cy-swap__section-header">
      <span class="cy-swap__label">To</span>
      <span class="cy-swap__balance">Balance: {toToken.balance}</span>
    </div>
    <div class="cy-swap__input-row">
      <input
        type="text"
        class="cy-swap__amount-input"
        placeholder="0.0"
        value={toAmount}
        readonly
      />
      <button
        class="cy-swap__token-badge"
        onclick={() => ontokenselect?.("to")}
      >
        {#if toToken.icon}
          <span class="cy-swap__token-icon">{toToken.icon}</span>
        {/if}
        {toToken.symbol}
      </button>
    </div>
  </div>

  {#if exchangeRate || priceImpact}
    <div class="cy-swap__details">
      {#if exchangeRate}
        <div class="cy-swap__detail-row">
          <span class="cy-swap__detail-label">Exchange Rate</span>
          <span class="cy-swap__detail-value">{exchangeRate}</span>
        </div>
      {/if}
      {#if priceImpact}
        <div class="cy-swap__detail-row">
          <span class="cy-swap__detail-label">Price Impact</span>
          <span class="cy-swap__detail-value cy-swap__detail-value--impact">{priceImpact}</span>
        </div>
      {/if}
      <div class="cy-swap__detail-row">
        <span class="cy-swap__detail-label">Slippage Tolerance</span>
        <span class="cy-swap__detail-value">{slippage}%</span>
      </div>
      {#if minimumReceived()}
        <div class="cy-swap__detail-row">
          <span class="cy-swap__detail-label">Minimum Received</span>
          <span class="cy-swap__detail-value">{minimumReceived()} {toToken.symbol}</span>
        </div>
      {/if}
    </div>
  {/if}

  <button
    class="cy-swap__submit"
    disabled={!isValid || loading}
    onclick={() => onswap?.()}
  >
    {#if loading}
      <span class="cy-swap__spinner"></span>
      Swapping...
    {:else}
      Swap
    {/if}
  </button>
</div>

<style>
  .cy-swap {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-5, 1.25rem);
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
    max-width: 440px;
  }

  .cy-swap__section {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 8px);
    padding: var(--space-4, 1rem);
  }

  .cy-swap__section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2, 0.5rem);
  }

  .cy-swap__label {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-swap__balance {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    font-family: var(--font-mono, monospace);
  }

  .cy-swap__input-row {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
  }

  .cy-swap__amount-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: var(--font-mono, monospace);
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    min-width: 0;
  }

  .cy-swap__amount-input::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.5;
  }

  .cy-swap__token-badge {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-pill, 999px);
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    font-size: 0.875rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary);
    cursor: pointer;
    white-space: nowrap;
    transition: border-color var(--transition-default, 0.2s ease);
  }

  .cy-swap__token-badge:hover {
    border-color: var(--color-action-brand-default);
  }

  .cy-swap__token-icon {
    font-size: 1rem;
  }

  .cy-swap__max-btn {
    background: transparent;
    border: none;
    font-size: 0.6875rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-action-brand-default);
    cursor: pointer;
    padding: var(--space-1, 0.25rem) 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cy-swap__max-btn:hover {
    text-decoration: underline;
  }

  .cy-swap__direction-btn {
    align-self: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full, 50%);
    border: 1px solid var(--color-border-default);
    background: var(--color-surface-default);
    color: var(--color-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-default, 0.2s ease);
    margin: calc(-1 * var(--space-2, 0.5rem)) 0;
    z-index: 1;
  }

  .cy-swap__direction-btn:hover {
    color: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    transform: rotate(180deg);
  }

  .cy-swap__details {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 8px);
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .cy-swap__detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8125rem;
  }

  .cy-swap__detail-label {
    color: var(--color-text-secondary);
  }

  .cy-swap__detail-value {
    color: var(--color-text-primary);
    font-family: var(--font-mono, monospace);
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-swap__detail-value--impact {
    color: var(--color-state-warning);
  }

  .cy-swap__submit {
    width: 100%;
    padding: var(--space-4, 1rem);
    border: none;
    border-radius: var(--radius-md, 8px);
    background: var(--color-action-brand-default);
    color: var(--color-text-on-brand);
    font-size: 1rem;
    font-weight: var(--font-weight-bold, 700);
    cursor: pointer;
    transition: all var(--transition-default, 0.2s ease);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    margin-top: var(--space-2, 0.5rem);
  }

  .cy-swap__submit:hover:not(:disabled) {
    background: var(--color-action-brand-hover);
  }

  .cy-swap__submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-swap__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: var(--radius-full, 50%);
    animation: cy-swap-spin 0.6s linear infinite;
  }

  @keyframes cy-swap-spin {
    to { transform: rotate(360deg); }
  }
</style>
