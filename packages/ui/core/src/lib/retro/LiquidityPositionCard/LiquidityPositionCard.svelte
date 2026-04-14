<svelte:options runes={true} />

<script lang="ts">
  import TokenPairIcon from "../TokenPairIcon/TokenPairIcon.svelte";
  import LiquidityRangeBar from "../LiquidityRangeBar/LiquidityRangeBar.svelte";

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
  }: {
    tokenA: string;
    tokenB: string;
    value: number;
    pnl: number;
    currency?: string;
    range: { min: number; max: number; lower: number; upper: number; current: number };
    feeApyPct: number;
    uncollected: number;
    precision?: number;
    onClick?: () => void;
  } = $props();

  const pair = $derived(`${tokenA}/${tokenB}`);
  const pnlSign = $derived(pnl > 0 ? "+" : pnl < 0 ? "-" : "");
  const pnlAbs = $derived(Math.abs(pnl));
  const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });
</script>

<button
  type="button"
  class="cy-lpos"
  aria-label="Position {pair}"
  onclick={() => onClick?.()}
>
  <div class="cy-lpos__top">
    <div class="cy-lpos__pair">
      <TokenPairIcon {tokenA} {tokenB} size={24} />
      <span class="cy-lpos__pair-name">{pair}</span>
    </div>
    <div class="cy-lpos__value-col">
      <span class="cy-lpos__value">{currency}{fmt(value)}</span>
      <span
        class="cy-lpos__pnl"
        class:cy-lpos__pnl--up={pnl > 0}
        class:cy-lpos__pnl--down={pnl < 0}
        data-testid="cy-lpos-pnl"
      >{pnlSign}{currency}{fmt(pnlAbs)}</span>
    </div>
  </div>

  <LiquidityRangeBar
    min={range.min}
    max={range.max}
    lower={range.lower}
    upper={range.upper}
    current={range.current}
    {precision}
  />

  <div class="cy-lpos__bottom">
    <span>Fee APY: <strong data-testid="cy-lpos-fee">{feeApyPct.toFixed(2)}%</strong></span>
    <span>Uncollected: <strong data-testid="cy-lpos-uncollected">{currency}{uncollected.toFixed(2)}</strong></span>
  </div>
</button>

<style>
  .cy-lpos { display: block; width: 100%; text-align: left; background: var(--color-surface-default, #fff); border: 2px solid var(--color-text-primary, #12121a); padding: 8px 10px; font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); cursor: pointer; }
  .cy-lpos:hover { background: var(--color-surface-hover, #ebebf0); }
  .cy-lpos__top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
  .cy-lpos__pair { display: flex; align-items: center; gap: 6px; font-weight: 700; }
  .cy-lpos__pair-name { font-size: 0.85rem; }
  .cy-lpos__value-col { text-align: right; display: flex; flex-direction: column; line-height: 1.2; }
  .cy-lpos__value { font-weight: 700; font-size: 0.9rem; }
  .cy-lpos__pnl { font-size: 0.75rem; color: var(--color-text-secondary, #4a4a5c); }
  .cy-lpos__pnl--up { color: var(--color-state-success, #00b32d); }
  .cy-lpos__pnl--down { color: var(--color-state-error, #ff4444); }
  .cy-lpos__bottom { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-secondary, #4a4a5c); margin-top: 6px; }
</style>
