<svelte:options runes={true} />

<script lang="ts">
  import type { FormatMoneyOptions } from "../../forms/MoneyInput/money.js";
  import {
    INVALID_AMOUNT_TEXT,
    maskGlyphs,
    maskSizer,
    tryFormatAmount,
  } from "./currencyDisplay.js";

  let {
    amount,
    currency,
    locale = undefined,
    signDisplay = "auto",
    currencyDisplay = "symbol",
    tone = "neutral",
    masked = false,
    maskedLabel = "Hidden amount",
    negativeLabel = "negative",
    decimals = undefined,
    minDecimals = undefined,
    symbol = undefined,
  }: {
    /** Decimal string ("-1234.50"), never a number. */
    amount: string;
    /** ISO 4217 code ("USD"), or any asset code ("ETH") when `decimals` is set. */
    currency: string;
    locale?: string;
    signDisplay?: NonNullable<FormatMoneyOptions["signDisplay"]>;
    currencyDisplay?: NonNullable<FormatMoneyOptions["currencyDisplay"]>;
    /** "signed" colours positive/negative amounts; the sign or label always stays. */
    tone?: "neutral" | "signed";
    /** Hides the value while keeping its width; assistive tech reads `maskedLabel`. */
    masked?: boolean;
    maskedLabel?: string;
    /** Screen-reader prefix for negatives when `signDisplay="never"` drops the sign. */
    negativeLabel?: string;
    /**
     * Asset mode for non-ISO assets (crypto tokens): exactly this many fraction
     * digits, with `currency` appended as a code ("1.234,5678 ETH").
     */
    decimals?: number;
    /**
     * Asset mode only: fewest fraction digits to show (0–`decimals`). Trailing
     * zeros beyond it are dropped ("2 ETH", "0.00067 ETH"); defaults to
     * `decimals`, keeping the fixed-width display.
     */
    minDecimals?: number;
    /**
     * Asset mode only: symbol placed where the locale puts currency symbols
     * ("₿1.00"), unless `currencyDisplay` is "code" or "name".
     */
    symbol?: string;
  } = $props();

  let formatted = $derived(
    tryFormatAmount(amount, {
      currency,
      locale,
      signDisplay,
      currencyDisplay,
      decimals,
      minDecimals,
      symbol,
    }),
  );
  let negative = $derived(formatted?.sign === -1);
  let positive = $derived(formatted?.sign === 1);
  let showNegativeLabel = $derived(negative && signDisplay === "never");
  let colored = $derived(tone === "signed" && !masked);

  // Plain variable on purpose: tracking what was already reported must not
  // re-trigger the effect.
  let lastWarned: string | undefined;

  $effect(() => {
    if (formatted !== null) return;
    const key = `${String(amount)}|${currency}|${String(decimals)}|${String(minDecimals)}`;
    if (key === lastWarned) return;
    lastWarned = key;
    console.warn(
      `CurrencyDisplay: cannot format amount "${String(amount)}" in currency "${currency}".`,
    );
  });
</script>

<span
  class="cy-currency"
  class:cy-currency--masked={masked && formatted !== null}
  class:cy-currency--invalid={formatted === null}
  class:cy-currency--positive={colored && positive}
  class:cy-currency--negative={colored && negative}
>
  {#if formatted === null}
    <span class="cy-currency__value">{INVALID_AMOUNT_TEXT}</span>
  {:else if masked}
    <span class="cy-currency__sr">{maskedLabel}</span>
    <span class="cy-currency__sizer" aria-hidden="true"
      >{maskSizer(formatted.text, formatted.zeroDigit)}</span
    >
    <span class="cy-currency__mask" aria-hidden="true">{maskGlyphs(formatted.text)}</span>
  {:else}
    {#if showNegativeLabel}
      <span class="cy-currency__sr">{negativeLabel} </span>
    {/if}
    <span class="cy-currency__value">{formatted.text}</span>
  {/if}
</span>

<style>
  .cy-currency {
    position: relative;
    display: inline-block;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    color: inherit;
  }

  .cy-currency--positive {
    color: var(--color-state-success);
  }

  .cy-currency--negative {
    color: var(--color-state-error);
  }

  .cy-currency--invalid {
    color: var(--color-text-tertiary);
  }

  .cy-currency__sizer {
    visibility: hidden;
  }

  .cy-currency__mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: var(--color-text-tertiary);
    letter-spacing: 0.08em;
    user-select: none;
  }

  .cy-currency__sr {
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
