<svelte:options runes={true} />

<script lang="ts">
  import TokenPairIcon from "../TokenPairIcon/TokenPairIcon.svelte";
  import LiquidityRangeBar from "../LiquidityRangeBar/LiquidityRangeBar.svelte";
  import CurrencyDisplay from "../../data/CurrencyDisplay/CurrencyDisplay.svelte";
  import { subtitleParts, tokenAmountDecimals } from "./liquidityPositionCard.js";
  import type { LiquidityMoney, LiquidityTokenAmount } from "./types.js";

  let {
    tokenA,
    tokenB,
    value,
    pnl,
    currency = "$",
    range,
    feeApyPct,
    uncollected,
    precision = 4,
    onClick,
    valueMoney,
    pnlMoney,
    uncollectedFees,
    uncollectedTotal,
    locale,
    feeTier,
    tokenId,
    chain,
    walletLabel,
    rangeText,
  }: {
    tokenA: string;
    tokenB: string;
    /** Position value as a number. Ignored when `valueMoney` is set. */
    value?: number;
    /** Profit/loss as a number; the row is hidden when neither `pnl` nor `pnlMoney` is set. */
    pnl?: number;
    /** Symbol prefixed to the number props (`value`, `pnl`, `uncollected`). */
    currency?: string;
    range: { min: number; max: number; lower: number; upper: number; current: number };
    /** Fee APY in percent; the row is hidden when absent. */
    feeApyPct?: number;
    /** Uncollected fees as one number. Ignored when `uncollectedFees` or `uncollectedTotal` is set. */
    uncollected?: number;
    precision?: number;
    onClick?: () => void;
    /** Decimal-safe position value, rendered by `CurrencyDisplay`; takes precedence over `value`. */
    valueMoney?: LiquidityMoney;
    /** Decimal-safe profit/loss (signed, coloured); takes precedence over `pnl`. */
    pnlMoney?: LiquidityMoney;
    /** Uncollected fees per token (e.g. both tokens of the pair); take precedence over `uncollected`. */
    uncollectedFees?: LiquidityTokenAmount[];
    /** Approximate total of the uncollected fees, shown as "≈ total"; takes precedence over `uncollected`. */
    uncollectedTotal?: LiquidityMoney;
    /** Locale for the decimal-safe amounts (defaults to the runtime locale). */
    locale?: string;
    /** Fee tier shown after the pair in the title, e.g. "0.05%". */
    feeTier?: string;
    /** Position NFT id, shown as "#id" in the subtitle. */
    tokenId?: string;
    /** Chain name shown in the subtitle. */
    chain?: string;
    /** Wallet name shown in the subtitle. */
    walletLabel?: string;
    /**
     * The price range as one sentence for screen readers (e.g. "In range: 3,200 to
     * 3,900 USDC per WETH, current 3,450"). When set, it describes the card and the
     * visual range bar becomes decorative and `aria-hidden`.
     */
    rangeText?: string;
  } = $props();

  const rangeTextId = `cy-lpos-range-${Math.random().toString(36).slice(2, 9)}`;

  const pair = $derived(`${tokenA}/${tokenB}`);
  const subtitle = $derived(subtitleParts({ tokenId, chain, walletLabel }).join(" · "));
  const hasFees = $derived((uncollectedFees?.length ?? 0) > 0);
  const hasDecimalUncollected = $derived(hasFees || uncollectedTotal !== undefined);
  const showBottom = $derived(
    feeApyPct !== undefined || hasDecimalUncollected || uncollected !== undefined,
  );

  const signOf = (v: number) => (v > 0 ? "+" : v < 0 ? "-" : "");
  const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });
</script>

{#snippet money(m: LiquidityMoney, signed = false)}
  <CurrencyDisplay
    amount={m.amount}
    currency={m.currency}
    decimals={m.decimals}
    {locale}
    signDisplay={signed ? "exceptZero" : "auto"}
    tone={signed ? "signed" : "neutral"}
  />
{/snippet}

{#snippet tokenAmount(fee: LiquidityTokenAmount)}
  {@render money({ amount: fee.amount, currency: fee.asset, decimals: tokenAmountDecimals(fee) })}
{/snippet}

<button
  type="button"
  class="cy-lpos"
  aria-label="Position {pair}"
  aria-describedby={rangeText ? rangeTextId : undefined}
  onclick={() => onClick?.()}
>
  <div class="cy-lpos__top">
    <div class="cy-lpos__pair">
      <TokenPairIcon {tokenA} {tokenB} size={24} />
      <span class="cy-lpos__title">
        <span class="cy-lpos__pair-name"
          >{pair}{#if feeTier}<span class="cy-lpos__fee-tier" data-testid="cy-lpos-fee-tier"
              >{feeTier}</span
            >{/if}</span
        >
        {#if subtitle}
          <span class="cy-lpos__subtitle" data-testid="cy-lpos-subtitle">{subtitle}</span>
        {/if}
      </span>
    </div>
    <div class="cy-lpos__value-col">
      {#if valueMoney}
        <span class="cy-lpos__value" data-testid="cy-lpos-value">{@render money(valueMoney)}</span>
      {:else if value !== undefined}
        <span class="cy-lpos__value" data-testid="cy-lpos-value">{currency}{fmt(value)}</span>
      {/if}
      {#if pnlMoney}
        <span class="cy-lpos__pnl" data-testid="cy-lpos-pnl">{@render money(pnlMoney, true)}</span>
      {:else if pnl !== undefined}
        <span
          class="cy-lpos__pnl"
          class:cy-lpos__pnl--up={pnl > 0}
          class:cy-lpos__pnl--down={pnl < 0}
          data-testid="cy-lpos-pnl">{signOf(pnl)}{currency}{fmt(Math.abs(pnl))}</span
        >
      {/if}
    </div>
  </div>

  {#if rangeText}
    <span class="cy-lpos__sr" id={rangeTextId} data-testid="cy-lpos-range-text">{rangeText}</span>
    <div aria-hidden="true" data-testid="cy-lpos-range">
      <LiquidityRangeBar
        min={range.min}
        max={range.max}
        lower={range.lower}
        upper={range.upper}
        current={range.current}
        {precision}
        decorative
      />
    </div>
  {:else}
    <LiquidityRangeBar
      min={range.min}
      max={range.max}
      lower={range.lower}
      upper={range.upper}
      current={range.current}
      {precision}
    />
  {/if}

  {#if showBottom}
    <div class="cy-lpos__bottom">
      {#if feeApyPct !== undefined}
        <span>Fee APY: <strong data-testid="cy-lpos-fee">{feeApyPct.toFixed(2)}%</strong></span>
      {/if}
      {#if hasDecimalUncollected}
        <span class="cy-lpos__uncollected">
          Uncollected:
          <strong data-testid="cy-lpos-uncollected">
            {#each uncollectedFees ?? [] as fee, i (i)}
              {#if i > 0}<span class="cy-lpos__sep">+</span>{/if}
              <span data-testid="cy-lpos-uncollected-fee">{@render tokenAmount(fee)}</span>
            {/each}
            {#if uncollectedTotal}
              <span class="cy-lpos__total" data-testid="cy-lpos-uncollected-total"
                >≈ {@render money(uncollectedTotal)}</span
              >
            {/if}
          </strong>
        </span>
      {:else if uncollected !== undefined}
        <span>Uncollected: <strong data-testid="cy-lpos-uncollected">{currency}{uncollected.toFixed(2)}</strong></span>
      {/if}
    </div>
  {/if}
</button>

<style>
  .cy-lpos { display: block; width: 100%; text-align: left; background: var(--color-surface-default, #fff); border: var(--lpos-border, 2px solid var(--color-text-primary, #12121a)); border-radius: var(--lpos-radius, 0); padding: 8px 10px; font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); cursor: pointer; }
  .cy-lpos:hover { background: var(--color-surface-hover, #ebebf0); }
  .cy-lpos__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
  .cy-lpos__pair { display: flex; align-items: center; gap: 6px; font-weight: 700; }
  .cy-lpos__title { display: flex; flex-direction: column; line-height: 1.2; }
  .cy-lpos__pair-name { font-size: 0.85rem; }
  .cy-lpos__fee-tier { margin-left: 6px; font-weight: 400; font-size: 0.72rem; color: var(--color-text-secondary, #4a4a5c); }
  .cy-lpos__subtitle { font-weight: 400; font-size: 0.72rem; color: var(--color-text-secondary, #4a4a5c); }
  .cy-lpos__value-col { text-align: right; display: flex; flex-direction: column; line-height: 1.2; }
  .cy-lpos__value { font-weight: 700; font-size: 0.9rem; }
  .cy-lpos__pnl { font-size: 0.75rem; color: var(--color-text-secondary, #4a4a5c); }
  .cy-lpos__pnl--up { color: var(--color-state-success, #00b32d); }
  .cy-lpos__pnl--down { color: var(--color-state-error, #ff4444); }
  .cy-lpos__bottom { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; font-size: 0.75rem; color: var(--color-text-secondary, #4a4a5c); margin-top: 6px; }
  .cy-lpos__uncollected strong { display: inline-flex; flex-wrap: wrap; gap: 0 4px; }
  .cy-lpos__total { font-weight: 400; }
  .cy-lpos__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
