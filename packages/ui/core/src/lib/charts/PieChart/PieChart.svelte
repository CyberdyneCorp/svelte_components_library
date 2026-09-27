<svelte:options runes={true} />

<script lang="ts">
  import ChartFrame from "../ChartFrame/ChartFrame.svelte";
  import type { ChartTableData } from "../ChartFrame/chartTable.js";
  import ChartLegend from "../ChartLegend/ChartLegend.svelte";
  import { markerPath, seriesStyle } from "../ChartLegend/markers.js";

  type PieData = { label: string; value: number; color?: string };

  let {
    data = [],
    size = 200,
    donut = false,
    donutWidth = 40,
    showLegend = true,
    showValues = true,
    animate = true,
    title,
    description,
    hideTitle = false,
    showDataToggle = true,
  }: {
    data?: PieData[];
    size?: number;
    donut?: boolean;
    donutWidth?: number;
    showLegend?: boolean;
    showValues?: boolean;
    animate?: boolean;
    title?: string;
    description?: string;
    hideTitle?: boolean;
    showDataToggle?: boolean;
  } = $props();

  const defaultColors = [
    "var(--color-action-brand-default)",
    "var(--color-action-secondary-default)",
    "var(--color-action-tertiary-default)",
    "var(--color-state-warning)",
    "var(--color-state-error)",
  ];

  let hoveredIndex: number | null = $state(null);
  let tooltipPos = $state({ x: 0, y: 0 });

  let total = $derived(data.reduce((sum, d) => sum + d.value, 0));

  function getColor(d: PieData, i: number): string {
    return d.color || defaultColors[i % defaultColors.length];
  }

  function percentage(value: number): string {
    return total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%";
  }

  interface ArcSlice {
    startAngle: number;
    endAngle: number;
    color: string;
    data: PieData;
    index: number;
  }

  let slices = $derived.by((): ArcSlice[] => {
    if (!data.length || total === 0) return [];
    let angle = -Math.PI / 2;
    return data.map((d, i) => {
      const sweep = (d.value / total) * Math.PI * 2;
      const slice: ArcSlice = {
        startAngle: angle,
        endAngle: angle + sweep,
        color: getColor(d, i),
        data: d,
        index: i,
      };
      angle += sweep;
      return slice;
    });
  });

  const cx = $derived(size / 2);
  const cy = $derived(size / 2);
  const outerR = $derived(size / 2 - 8);
  const innerR = $derived(donut ? outerR - donutWidth : 0);

  function describeArc(
    centerX: number,
    centerY: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ): string {
    const sweep = endAngle - startAngle;
    const largeArc = sweep > Math.PI ? 1 : 0;

    const ox1 = centerX + outerRadius * Math.cos(startAngle);
    const oy1 = centerY + outerRadius * Math.sin(startAngle);
    const ox2 = centerX + outerRadius * Math.cos(endAngle);
    const oy2 = centerY + outerRadius * Math.sin(endAngle);

    if (innerRadius <= 0) {
      return [
        `M ${centerX} ${centerY}`,
        `L ${ox1} ${oy1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${ox2} ${oy2}`,
        "Z",
      ].join(" ");
    }

    const ix1 = centerX + innerRadius * Math.cos(startAngle);
    const iy1 = centerY + innerRadius * Math.sin(startAngle);
    const ix2 = centerX + innerRadius * Math.cos(endAngle);
    const iy2 = centerY + innerRadius * Math.sin(endAngle);

    return [
      `M ${ox1} ${oy1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${ox2} ${oy2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");
  }

  function sliceTransform(slice: ArcSlice, hovered: boolean): string {
    if (!hovered) return "";
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const dx = Math.cos(midAngle) * 6;
    const dy = Math.sin(midAngle) * 6;
    return `translate(${dx}, ${dy})`;
  }

  // Slices narrower than this get no in-slice marker (it would not fit).
  const MIN_MARKER_SWEEP = 0.3;

  function sliceMarker(slice: ArcSlice): string {
    const mid = (slice.startAngle + slice.endAngle) / 2;
    const r = innerR > 0 ? (outerR + innerR) / 2 : outerR * 0.62;
    const markerSize = Math.min(12, outerR * 0.16);
    const shape = seriesStyle(slice.index).marker;
    return markerPath(shape, cx + r * Math.cos(mid), cy + r * Math.sin(mid), markerSize);
  }

  let tableData = $derived<ChartTableData>({
    columns: ["Label", "Value", "Share"],
    rows: data.map((d) => [d.label, d.value, percentage(d.value)]),
  });

  let legendItems = $derived(
    data.map((d, i) => ({
      label: d.label,
      color: getColor(d, i),
      marker: seriesStyle(i).marker,
      detail: showValues ? percentage(d.value) : undefined,
    })),
  );

  function onSliceMouseMove(e: MouseEvent) {
    const container = (e.currentTarget as SVGPathElement).closest(".cy-pie-chart");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    tooltipPos = { x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 8 };
  }
</script>

<ChartFrame {title} {description} {hideTitle} {showDataToggle} inline fallbackLabel="Pie chart" data={tableData}>
{#snippet children(a11y)}
<div class="cy-pie-chart" style="width: {size}px;">
  <svg
    {...a11y}
    viewBox="0 0 {size} {size}"
    class="cy-pie-chart__svg"
    width={size}
    height={size}
    role="img"
  >
    {#each slices as slice}
      <path
        d={describeArc(cx, cy, outerR, innerR, slice.startAngle, slice.endAngle)}
        fill={slice.color}
        class="cy-pie-chart__segment"
        class:cy-pie-chart__segment--animated={animate}
        opacity={hoveredIndex !== null && hoveredIndex !== slice.index ? 0.5 : 0.85}
        transform={sliceTransform(slice, hoveredIndex === slice.index)}
        onmouseenter={() => (hoveredIndex = slice.index)}
        onmouseleave={() => (hoveredIndex = null)}
        onmousemove={onSliceMouseMove}
      />
    {/each}
    {#each slices as slice (slice.index)}
      {#if slice.endAngle - slice.startAngle >= MIN_MARKER_SWEEP}
        <path
          d={sliceMarker(slice)}
          transform={sliceTransform(slice, hoveredIndex === slice.index)}
          class="cy-pie-chart__marker"
          data-marker={seriesStyle(slice.index).marker}
        />
      {/if}
    {/each}
  </svg>

  {#if hoveredIndex !== null && data[hoveredIndex]}
    <div class="cy-pie-chart__tooltip" style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;">
      <span class="cy-pie-chart__tooltip-label">{data[hoveredIndex].label}</span>
      <span class="cy-pie-chart__tooltip-value">{data[hoveredIndex].value}</span>
      <span class="cy-pie-chart__tooltip-pct">{percentage(data[hoveredIndex].value)}</span>
    </div>
  {/if}

  {#if showLegend}
    <ChartLegend items={legendItems} blockClass="cy-pie-chart" />
  {/if}
</div>
{/snippet}
</ChartFrame>

<style>
  .cy-pie-chart {
    position: relative;
    font-family: var(--font-body);
    display: inline-block;
  }

  .cy-pie-chart__svg {
    display: block;
  }

  .cy-pie-chart__segment {
    transition: opacity 150ms ease, transform 150ms ease;
    cursor: pointer;
    stroke: var(--color-surface-default);
    stroke-width: 1.5;
  }

  .cy-pie-chart__segment--animated {
    animation: cy-pie-fade 0.6s ease-out forwards;
  }

  @keyframes cy-pie-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.85;
    }
  }

  .cy-pie-chart__tooltip {
    position: absolute;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    font-size: 0.75rem;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .cy-pie-chart__tooltip-label {
    color: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-pie-chart__tooltip-value {
    color: var(--color-text-primary);
    font-family: var(--font-mono);
  }

  .cy-pie-chart__tooltip-pct {
    color: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-pie-chart__marker {
    fill: var(--color-surface-default);
    pointer-events: none;
    transition: transform 150ms ease;
  }
</style>
