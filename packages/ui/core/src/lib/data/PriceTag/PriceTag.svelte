<svelte:options runes={true} />

<script lang="ts">
  import CurrencyDisplay from "../CurrencyDisplay/CurrencyDisplay.svelte";
  import Badge from "../../primitives/Badge/Badge.svelte";

  let {
    amount,
    currency,
    locale = undefined,
    originalAmount = undefined,
    period = undefined,
    savings = undefined,
    originalLabel = "Original price",
    size = "md",
  }: {
    /** Current price as a decimal string ("10.99"), never a number. */
    amount: string;
    /** ISO 4217 code ("BRL", "USD"). */
    currency: string;
    locale?: string;
    /** Pre-discount price as a decimal string; rendered struck through when set. */
    originalAmount?: string;
    /** Billing period shown after the price, e.g. "/mês" or "/1º ano". */
    period?: string;
    /** Savings text rendered as a badge, e.g. "Save 89%". */
    savings?: string;
    /** Visually hidden prefix read before the struck original price (i18n). */
    originalLabel?: string;
    /** Type scale of the current price. */
    size?: "sm" | "md" | "lg";
  } = $props();
</script>

<span class="cy-price-tag cy-price-tag--{size}">
  <span class="cy-price-tag__current">
    <span class="cy-price-tag__amount">
      <CurrencyDisplay {amount} {currency} {locale} />
    </span>
    {#if period}
      <span class="cy-price-tag__period">{period}</span>
    {/if}
  </span>
  {#if originalAmount}
    <span class="cy-price-tag__original">
      <span class="cy-price-tag__sr">{originalLabel} </span>
      <s class="cy-price-tag__struck">
        <CurrencyDisplay amount={originalAmount} {currency} {locale} />
      </s>
    </span>
  {/if}
  {#if savings}
    <span class="cy-price-tag__savings">
      <Badge variant="success" size="sm">{savings}</Badge>
    </span>
  {/if}
</span>

<style>
  .cy-price-tag {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-1) var(--space-2);
    font-family: var(--font-body);
    color: var(--color-text-primary);
  }

  .cy-price-tag__current {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
  }

  .cy-price-tag__amount {
    font-family: var(--font-display);
    font-weight: var(--font-weight-semibold);
    line-height: 1.2;
  }

  .cy-price-tag--sm .cy-price-tag__amount {
    font-size: 1rem;
  }

  .cy-price-tag--md .cy-price-tag__amount {
    font-size: 1.5rem;
  }

  .cy-price-tag--lg .cy-price-tag__amount {
    font-size: 2rem;
  }

  .cy-price-tag__period {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .cy-price-tag--lg .cy-price-tag__period {
    font-size: 0.875rem;
  }

  .cy-price-tag__original {
    position: relative;
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
  }

  .cy-price-tag__struck {
    text-decoration-thickness: 1px;
  }

  .cy-price-tag__savings {
    display: inline-flex;
    align-self: center;
  }

  .cy-price-tag__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
