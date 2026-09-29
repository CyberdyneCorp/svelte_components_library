<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";
  import CurrencyDisplay from "../../data/CurrencyDisplay/CurrencyDisplay.svelte";
  import NetworkBadge from "../NetworkBadge/NetworkBadge.svelte";

  let {
    symbol,
    name = undefined,
    amount,
    decimals,
    value = undefined,
    unpricedLabel = "No price available",
    chain = undefined,
    locale = undefined,
    as = "div",
    icon,
  }: {
    /** Token code ("ETH", "USDC"); also appended to the formatted amount. */
    symbol: string;
    /** Full token name ("Ether"). */
    name?: string;
    /** Token amount as a decimal string ("1.5"), never a number. */
    amount: string;
    /** Fraction digits the amount is shown with (18 for ETH, 6 for USDC). */
    decimals: number;
    /** Fiat value as a decimal string plus ISO 4217 code; omit when the token has no price. */
    value?: { amount: string; currency: string };
    /** Text shown instead of the value when `value` is absent (e.g. the reason there is no price). */
    unpricedLabel?: string;
    /** Chain name or label ("Ethereum", "Base"), shown as a badge without chain id or status. */
    chain?: string;
    locale?: string;
    /** Root element: "li" inside a `<ul>`/`<ol>`, "div" anywhere else (e.g. a table cell). */
    as?: "div" | "li";
    icon?: Snippet;
  } = $props();
</script>

<svelte:element this={as} class="cy-token-row">
  {#if icon}
    <span class="cy-token-row__icon" aria-hidden="true">
      {@render icon()}
    </span>
  {/if}
  <span class="cy-token-row__asset">
    <span class="cy-token-row__symbol">{symbol}</span>
    {#if name}
      <span class="cy-token-row__name">{name}</span>
    {/if}
  </span>
  {#if chain}
    <span class="cy-token-row__chain">
      <NetworkBadge network={chain} showStatus={false} />
    </span>
  {/if}
  <span class="cy-token-row__figures">
    <span class="cy-token-row__amount">
      <CurrencyDisplay {amount} currency={symbol} {decimals} {locale} />
    </span>
    {#if value}
      <span class="cy-token-row__value">
        <CurrencyDisplay amount={value.amount} currency={value.currency} {locale} />
      </span>
    {:else}
      <span class="cy-token-row__unpriced">{unpricedLabel}</span>
    {/if}
  </span>
</svelte:element>

<style>
  .cy-token-row {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    min-width: 0;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    font-family: var(--font-body, inherit);
    color: var(--color-text-primary);
    list-style: none;
  }

  .cy-token-row__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .cy-token-row__asset {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .cy-token-row__symbol {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-token-row__name {
    overflow: hidden;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .cy-token-row__chain {
    flex-shrink: 0;
  }

  .cy-token-row__figures {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: flex-end;
    margin-left: auto;
    text-align: right;
  }

  .cy-token-row__amount {
    font-size: 0.875rem;
  }

  .cy-token-row__value,
  .cy-token-row__unpriced {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-token-row__unpriced {
    font-style: italic;
  }
</style>
