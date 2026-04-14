<svelte:options runes={true} />

<script lang="ts">
  import type { OHLCCandle } from "./types.js";

  let {
    candles = [],
    width = 480,
    height = 200,
    upColor = "var(--color-state-success, #00b32d)",
    downColor = "var(--color-state-error, #ff4444)",
    padding = 6,
    ariaLabel = "Price chart",
  }: {
    candles: OHLCCandle[];
    width?: number;
    height?: number;
    upColor?: string;
    downColor?: string;
    padding?: number;
    ariaLabel?: string;
  } = $props();

  const bounds = $derived(() => {
    if (candles.length === 0) return { min: 0, max: 1 };
    let mn = Infinity;
    let mx = -Infinity;
    for (const c of candles) {
      if (c.low < mn) mn = c.low;
      if (c.high > mx) mx = c.high;
    }
    if (mn === mx) { mn -= 1; mx += 1; }
    return { min: mn, max: mx };
  });

  const innerW = $derived(width - padding * 2);
  const innerH = $derived(height - padding * 2);

  function yFor(v: number): number {
    const b = bounds();
    return padding + innerH - ((v - b.min) / (b.max - b.min)) * innerH;
  }

  const barW = $derived(candles.length > 0 ? Math.max(1, (innerW / candles.length) * 0.7) : 0);
</script>

<svg
  class="cy-pricech"
  viewBox="0 0 {width} {height}"
  role="img"
  aria-label={ariaLabel}
  data-testid="cy-pricech"
>
  <rect x="0" y="0" width={width} height={height} fill="var(--color-surface-default, #fff)" stroke="var(--color-text-primary, #12121a)" stroke-width="2"/>
  {#each candles as c, i (c.t)}
    {@const step = innerW / Math.max(1, candles.length)}
    {@const cx = padding + i * step + step / 2}
    {@const isUp = c.close >= c.open}
    {@const color = isUp ? upColor : downColor}
    {@const oy = yFor(c.open)}
    {@const cy = yFor(c.close)}
    <line x1={cx} y1={yFor(c.high)} x2={cx} y2={yFor(c.low)} stroke={color} stroke-width="1" data-testid="cy-pricech-wick-{i}"/>
    <rect
      x={cx - barW / 2}
      y={Math.min(oy, cy)}
      width={barW}
      height={Math.max(1, Math.abs(cy - oy))}
      fill={color}
      stroke="var(--color-text-primary, #12121a)"
      stroke-width="1"
      data-testid="cy-pricech-body-{i}"
    />
  {/each}
  {#if candles.length === 0}
    <text
      x={width / 2}
      y={height / 2}
      text-anchor="middle"
      fill="var(--color-text-tertiary, #6a6a7e)"
      font-family="var(--font-body, monospace)"
      font-size="12"
    >No data</text>
  {/if}
</svg>

<style>
  .cy-pricech { image-rendering: pixelated; display: block; }
</style>
