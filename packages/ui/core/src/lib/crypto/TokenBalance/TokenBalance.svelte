<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    symbol,
    balance,
    usdValue = "",
    icon,
    change,
  }: {
    symbol: string;
    balance: string;
    usdValue?: string;
    icon?: Snippet;
    change?: number;
  } = $props();

  let changeClass = $derived(
    change === undefined ? "" : change >= 0 ? "positive" : "negative"
  );

  let changeFormatted = $derived(
    change === undefined
      ? ""
      : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
  );
</script>

<div class="cy-token-balance">
  <div class="cy-token-balance__header">
    {#if icon}
      <span class="cy-token-balance__icon">
        {@render icon()}
      </span>
    {/if}
    <div class="cy-token-balance__amount">
      <span class="cy-token-balance__balance">{balance}</span>
      <span class="cy-token-balance__symbol">{symbol}</span>
    </div>
  </div>
  <div class="cy-token-balance__footer">
    {#if usdValue}
      <span class="cy-token-balance__usd">{usdValue}</span>
    {/if}
    {#if change !== undefined}
      <span class="cy-token-balance__change cy-token-balance__change--{changeClass}">
        {changeFormatted}
      </span>
    {/if}
  </div>
</div>

<style>
  .cy-token-balance {
    background: var(--color-surface-base, #12121a);
    border: 1px solid var(--color-border-default, rgba(0, 255, 65, 0.1));
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
    font-family: var(--font-mono, monospace);
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-token-balance:hover {
    border-color: rgba(0, 255, 65, 0.25);
    box-shadow: var(--shadow-glow-sm, 0 0 12px rgba(0, 255, 65, 0.08));
  }

  .cy-token-balance__header {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
  }

  .cy-token-balance__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full, 50%);
    background: var(--color-surface-raised, #1a1a2e);
    color: var(--color-primary, #00ff41);
    flex-shrink: 0;
  }

  .cy-token-balance__amount {
    display: flex;
    align-items: baseline;
    gap: var(--space-2, 0.5rem);
  }

  .cy-token-balance__balance {
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary, #e0e0e0);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .cy-token-balance__symbol {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #8a8a8a);
    font-weight: var(--font-weight-medium, 500);
    text-transform: uppercase;
  }

  .cy-token-balance__footer {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    margin-top: var(--space-2, 0.5rem);
    padding-left: 0;
  }

  .cy-token-balance__usd {
    font-size: 0.8125rem;
    color: var(--color-text-secondary, #8a8a8a);
  }

  .cy-token-balance__change {
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
    padding: 0.125rem var(--space-2, 0.5rem);
    border-radius: var(--radius-pill, 999px);
  }

  .cy-token-balance__change--positive {
    color: var(--color-state-success, #00ff41);
    background: var(--color-state-success-bg, rgba(0, 255, 65, 0.1));
  }

  .cy-token-balance__change--negative {
    color: var(--color-state-error, #ff4444);
    background: var(--color-state-error-bg, rgba(255, 68, 68, 0.1));
  }
</style>
