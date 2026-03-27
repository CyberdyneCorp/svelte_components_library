<svelte:options runes={true} />

<script lang="ts">
  let {
    symbol = "",
    price = "",
    change,
    period = "24h",
  }: {
    symbol: string;
    price: string;
    change?: number;
    period?: string;
  } = $props();

  let changeClass = $derived(
    change === undefined ? "" : change > 0 ? "positive" : change < 0 ? "negative" : "neutral"
  );

  let changeFormatted = $derived(
    change === undefined
      ? ""
      : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
  );

  let arrow = $derived(
    change === undefined ? "" : change > 0 ? "\u25B2" : change < 0 ? "\u25BC" : "\u2014"
  );
</script>

<div class="cy-price">
  <div class="cy-price__header">
    <span class="cy-price__symbol">{symbol}</span>
    {#if period}
      <span class="cy-price__period">{period}</span>
    {/if}
  </div>
  <div class="cy-price__value">{price}</div>
  {#if change !== undefined}
    <div class="cy-price__change cy-price__change--{changeClass}">
      <span class="cy-price__arrow">{arrow}</span>
      <span>{changeFormatted}</span>
    </div>
  {/if}
</div>

<style>
  .cy-price {
    background: var(--color-surface-base, #12121a);
    border: 1px solid var(--color-border-default, rgba(0, 255, 65, 0.1));
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
    transition: all var(--transition-default, 0.2s ease);
  }

  .cy-price:hover {
    border-color: rgba(0, 255, 65, 0.2);
    box-shadow: var(--shadow-glow-sm, 0 0 12px rgba(0, 255, 65, 0.06));
  }

  .cy-price__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2, 0.5rem);
  }

  .cy-price__symbol {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-secondary, #8a8a8a);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-price__period {
    font-family: var(--font-mono, monospace);
    font-size: 0.625rem;
    color: var(--color-text-tertiary, #666);
    background: var(--color-surface-raised, #1a1a2e);
    padding: 0.0625rem var(--space-2, 0.5rem);
    border-radius: var(--radius-pill, 999px);
  }

  .cy-price__value {
    font-family: var(--font-mono, monospace);
    font-size: 1.75rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-primary, #e0e0e0);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .cy-price__change {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    margin-top: var(--space-2, 0.5rem);
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium, 500);
    padding: 0.125rem var(--space-2, 0.5rem);
    border-radius: var(--radius-pill, 999px);
  }

  .cy-price__change--positive {
    color: var(--color-state-success, #00ff41);
    background: rgba(0, 255, 65, 0.1);
  }

  .cy-price__change--negative {
    color: var(--color-state-error, #ff4444);
    background: rgba(255, 68, 68, 0.1);
  }

  .cy-price__change--neutral {
    color: var(--color-text-secondary, #8a8a8a);
    background: var(--color-surface-raised, rgba(255, 255, 255, 0.04));
  }

  .cy-price__arrow {
    font-size: 0.625rem;
  }
</style>
