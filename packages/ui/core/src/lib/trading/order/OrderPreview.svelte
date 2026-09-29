<svelte:options runes={true} />

<script lang="ts">
  /** Read-only preview rows of the order ticket (internal). */
  import { formatAmount } from "../../forms/MoneyInput/asset.js";
  import type { OrderTicketLabels } from "./labels.js";
  import type { OrderPreview } from "./preview.js";

  let {
    preview,
    labels,
    quoteAsset,
    quoteDecimals,
    locale = undefined,
    liquidation = undefined,
    showLiquidation = false,
  }: {
    preview: OrderPreview;
    labels: OrderTicketLabels;
    quoteAsset: string;
    quoteDecimals: number;
    locale?: string;
    /** Already formatted liquidation price. */
    liquidation?: string;
    showLiquidation?: boolean;
  } = $props();

  function amount(value: string | undefined): string {
    if (value === undefined) return labels.unavailable;
    return formatAmount(value, { currency: quoteAsset, decimals: quoteDecimals, locale });
  }

  let rows = $derived([
    { key: "notional", term: labels.notional, value: amount(preview.notional) },
    { key: "margin", term: labels.initialMargin, value: amount(preview.initialMargin) },
    ...(preview.feeRate === undefined
      ? []
      : [{ key: "fee", term: labels.estimatedFee, value: amount(preview.fee) }]),
    ...(showLiquidation
      ? [{ key: "liq", term: labels.liquidationPrice, value: liquidation ?? labels.unavailable }]
      : []),
  ]);
</script>

<div class="cy-otp" role="group" aria-label={labels.preview}>
  <dl class="cy-otp__list">
    {#each rows as row (row.key)}
      <div class="cy-otp__row" data-row={row.key}>
        <dt class="cy-otp__term">{row.term}</dt>
        <dd class="cy-otp__value">{row.value}</dd>
      </div>
    {/each}
  </dl>
</div>

<style>
  .cy-otp__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0;
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
  }

  .cy-otp__row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .cy-otp__term {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
  }

  .cy-otp__value {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
    text-align: right;
  }
</style>
