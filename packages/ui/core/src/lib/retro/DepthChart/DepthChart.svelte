<svelte:options runes={true} />

<script lang="ts">
  import type { DepthLevel } from "./types.js";

  let {
    bids = [],
    asks = [],
    currentPrice,
    width = 480,
    height = 200,
    padding = 6,
    bidColor = "var(--color-state-success, #00b32d)",
    askColor = "var(--color-state-error, #ff4444)",
    ariaLabel = "Order book depth",
  }: {
    bids: DepthLevel[];
    asks: DepthLevel[];
    currentPrice?: number;
    width?: number;
    height?: number;
    padding?: number;
    bidColor?: string;
    askColor?: string;
    ariaLabel?: string;
  } = $props();

  const sortedBids = $derived([...bids].sort((a, b) => b.price - a.price));
  const sortedAsks = $derived([...asks].sort((a, b) => a.price - b.price));

  const cumBids = $derived(() => {
    let acc = 0;
    return sortedBids.map((b) => ({ price: b.price, cum: (acc += b.size) }));
  });
  const cumAsks = $derived(() => {
    let acc = 0;
    return sortedAsks.map((a) => ({ price: a.price, cum: (acc += a.size) }));
  });

  const priceMin = $derived(sortedBids.length ? sortedBids[sortedBids.length - 1].price : (currentPrice ?? 0));
  const priceMax = $derived(sortedAsks.length ? sortedAsks[sortedAsks.length - 1].price : (currentPrice ?? 1));
  const maxCum = $derived(Math.max(
    ...cumBids().map((b) => b.cum),
    ...cumAsks().map((a) => a.cum),
    1
  ));

  const innerW = $derived(width - padding * 2);
  const innerH = $derived(height - padding * 2);

  function xFor(p: number): number {
    if (priceMax <= priceMin) return padding;
    return padding + ((p - priceMin) / (priceMax - priceMin)) * innerW;
  }
  function yFor(c: number): number {
    return padding + innerH - (c / maxCum) * innerH;
  }

  function stairPath(points: { price: number; cum: number }[], dir: "bid" | "ask"): string {
    if (points.length === 0) return "";
    const baseY = padding + innerH;
    const list = [...points];
    const d: string[] = [];
    const first = list[0];
    d.push(`M ${xFor(first.price)} ${baseY}`);
    d.push(`L ${xFor(first.price)} ${yFor(first.cum)}`);
    for (let i = 1; i < list.length; i++) {
      const p = list[i];
      d.push(`L ${xFor(p.price)} ${yFor(list[i - 1].cum)}`);
      d.push(`L ${xFor(p.price)} ${yFor(p.cum)}`);
    }
    d.push(`L ${xFor(list[list.length - 1].price)} ${baseY} Z`);
    return d.join(" ");
  }
</script>

<svg
  class="cy-depth"
  viewBox="0 0 {width} {height}"
  role="img"
  aria-label={ariaLabel}
  data-testid="cy-depth"
>
  <rect x="0" y="0" width={width} height={height} fill="var(--color-surface-default, #fff)" stroke="var(--color-text-primary, #12121a)" stroke-width="2"/>
  {#if cumBids().length > 0}
    <path d={stairPath(cumBids(), "bid")} fill={bidColor} fill-opacity="0.35" stroke={bidColor} stroke-width="1.5" data-testid="cy-depth-bids"/>
  {/if}
  {#if cumAsks().length > 0}
    <path d={stairPath(cumAsks(), "ask")} fill={askColor} fill-opacity="0.35" stroke={askColor} stroke-width="1.5" data-testid="cy-depth-asks"/>
  {/if}
  {#if currentPrice !== undefined}
    <line
      x1={xFor(currentPrice)}
      y1={padding}
      x2={xFor(currentPrice)}
      y2={height - padding}
      stroke="var(--color-text-primary, #12121a)"
      stroke-dasharray="3 3"
      data-testid="cy-depth-price"
    />
  {/if}
  {#if cumBids().length === 0 && cumAsks().length === 0}
    <text x={width / 2} y={height / 2} text-anchor="middle" fill="var(--color-text-tertiary, #6a6a7e)" font-family="var(--font-body, monospace)" font-size="12">No depth data</text>
  {/if}
</svg>

<style>
  .cy-depth { image-rendering: pixelated; display: block; }
</style>
