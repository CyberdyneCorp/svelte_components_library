<svelte:options runes={true} />

<script lang="ts">
  let {
    values = [],
    width = 120,
    height = 32,
    color,
    fill = true,
    showDelta = false,
    ariaLabel = "Trend",
  }: {
    values: number[];
    width?: number;
    height?: number;
    color?: string;
    fill?: boolean;
    showDelta?: boolean;
    ariaLabel?: string;
  } = $props();

  const first = $derived(values[0] ?? 0);
  const last = $derived(values[values.length - 1] ?? 0);
  const up = $derived(last >= first);
  const autoColor = $derived(up ? "var(--color-state-success, #00b32d)" : "var(--color-state-error, #ff4444)");
  const stroke = $derived(color ?? autoColor);

  const bounds = $derived(() => {
    if (values.length === 0) return { min: 0, max: 1 };
    let mn = Infinity, mx = -Infinity;
    for (const v of values) { if (v < mn) mn = v; if (v > mx) mx = v; }
    if (mn === mx) { mn -= 1; mx += 1; }
    return { min: mn, max: mx };
  });

  function pointsStr(): string {
    if (values.length === 0) return "";
    const { min, max } = bounds();
    const stepX = values.length === 1 ? 0 : width / (values.length - 1);
    return values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / (max - min)) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }

  function areaPath(): string {
    const pts = pointsStr();
    if (!pts) return "";
    return `M 0 ${height} L ${pts.split(" ").join(" L ")} L ${width} ${height} Z`;
  }

  const deltaPct = $derived(first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0);
</script>

<span class="cy-tvlspark" aria-label={ariaLabel} role="img" data-testid="cy-tvlspark">
  <svg viewBox="0 0 {width} {height}" width={width} height={height} aria-hidden="true">
    {#if fill && values.length > 1}
      <path d={areaPath()} fill={stroke} fill-opacity="0.2" data-testid="cy-tvlspark-area"/>
    {/if}
    {#if values.length > 1}
      <polyline points={pointsStr()} fill="none" stroke={stroke} stroke-width="2" data-testid="cy-tvlspark-line"/>
    {/if}
  </svg>
  {#if showDelta && values.length > 0}
    <span class="cy-tvlspark__delta" class:cy-tvlspark__delta--up={up} class:cy-tvlspark__delta--down={!up} data-testid="cy-tvlspark-delta">
      {up ? "▲" : "▼"} {deltaPct.toFixed(1)}%
    </span>
  {/if}
</span>

<style>
  .cy-tvlspark { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body, monospace); }
  .cy-tvlspark__delta { font-size: 0.7rem; font-weight: 700; }
  .cy-tvlspark__delta--up { color: var(--color-state-success, #00b32d); }
  .cy-tvlspark__delta--down { color: var(--color-state-error, #ff4444); }
</style>
