<svelte:options runes={true} />

<script lang="ts">
  import type { LiquidityBucket } from "./types.js";

  let {
    buckets = [],
    currentPrice,
    selectedLower,
    selectedUpper,
    width = 480,
    height = 180,
    padding = 8,
    barColor = "var(--color-action-secondary-default, #00aacc)",
    selectedColor = "var(--color-action-brand-default, #00b32d)",
    ariaLabel = "Pool liquidity distribution",
  }: {
    buckets: LiquidityBucket[];
    currentPrice?: number;
    selectedLower?: number;
    selectedUpper?: number;
    width?: number;
    height?: number;
    padding?: number;
    barColor?: string;
    selectedColor?: string;
    ariaLabel?: string;
  } = $props();

  const sorted = $derived([...buckets].sort((a, b) => a.price - b.price));
  const minP = $derived(sorted.length ? sorted[0].price : 0);
  const maxP = $derived(sorted.length ? sorted[sorted.length - 1].price : 1);
  const maxL = $derived(sorted.reduce((m, b) => Math.max(m, b.liquidity), 0) || 1);

  const innerW = $derived(width - padding * 2);
  const innerH = $derived(height - padding * 2);
  const barW = $derived(sorted.length > 0 ? innerW / sorted.length : 0);

  function xFor(p: number): number {
    if (maxP === minP) return padding;
    return padding + ((p - minP) / (maxP - minP)) * innerW;
  }

  function inRange(p: number): boolean {
    if (selectedLower === undefined || selectedUpper === undefined) return false;
    return p >= selectedLower && p <= selectedUpper;
  }
</script>

<svg
  class="cy-prhist"
  viewBox="0 0 {width} {height}"
  role="img"
  aria-label={ariaLabel}
  data-testid="cy-prhist"
>
  <rect x="0" y="0" width={width} height={height} fill="var(--color-surface-default, #fff)" stroke="var(--color-text-primary, #12121a)" stroke-width="2"/>
  {#if sorted.length === 0}
    <text x={width / 2} y={height / 2} text-anchor="middle" fill="var(--color-text-tertiary, #6a6a7e)" font-family="var(--font-body, monospace)" font-size="12">No liquidity data</text>
  {:else}
    {#each sorted as b, i (b.price)}
      {@const h = (b.liquidity / maxL) * innerH}
      {@const x = padding + i * barW}
      {@const y = padding + innerH - h}
      <rect
        x={x + 1}
        y={y}
        width={Math.max(1, barW - 2)}
        height={h}
        fill={inRange(b.price) ? selectedColor : barColor}
        stroke="var(--color-text-primary, #12121a)"
        stroke-width="0.5"
        data-testid="cy-prhist-bar-{i}"
        data-inrange={inRange(b.price) ? "true" : "false"}
      />
    {/each}
    {#if selectedLower !== undefined}
      <line x1={xFor(selectedLower)} y1={padding} x2={xFor(selectedLower)} y2={height - padding} stroke={selectedColor} stroke-width="1.5" stroke-dasharray="4 3" data-testid="cy-prhist-lower"/>
    {/if}
    {#if selectedUpper !== undefined}
      <line x1={xFor(selectedUpper)} y1={padding} x2={xFor(selectedUpper)} y2={height - padding} stroke={selectedColor} stroke-width="1.5" stroke-dasharray="4 3" data-testid="cy-prhist-upper"/>
    {/if}
    {#if currentPrice !== undefined}
      <line x1={xFor(currentPrice)} y1={padding} x2={xFor(currentPrice)} y2={height - padding} stroke="var(--color-text-primary, #12121a)" stroke-width="2" data-testid="cy-prhist-current"/>
    {/if}
  {/if}
</svg>

<style>
  .cy-prhist { image-rendering: pixelated; display: block; }
</style>
