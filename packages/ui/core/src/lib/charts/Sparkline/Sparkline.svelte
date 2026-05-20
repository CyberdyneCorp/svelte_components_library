<svelte:options runes={true} />

<script lang="ts">
  type Sample = { ts: number; value: number };

  let {
    /** Simple numeric series. Ignored when `samples` is provided. */
    data = [],
    /** Timestamped samples. Takes precedence over `data` when present. */
    samples,
    width = 120,
    height = 32,
    color,
    /**
     * `data` legacy boolean is still respected: when true, behaves like
     * `fill: 'gradient'`. Use `fill` for finer control.
     */
    showArea = false,
    /** Area fill style. Defaults to `none` (just the line). */
    fill = "none",
    showEndDot = true,
    animate = true,
    /**
     * Domain clamp for the y-axis. When both are provided, two sparklines
     * sharing the same `min`/`max` line up visually. When omitted, the chart
     * auto-fits the series.
     */
    min,
    max,
    /** Inline legend rendered above the SVG: name + last value. */
    label,
    /** Custom formatter for the last value shown in the legend. */
    formatValue,
  }: {
    data?: number[];
    samples?: Sample[];
    width?: number;
    height?: number;
    color?: string;
    showArea?: boolean;
    fill?: "none" | "solid" | "gradient";
    showEndDot?: boolean;
    animate?: boolean;
    min?: number;
    max?: number;
    label?: string;
    formatValue?: (value: number) => string;
  } = $props();

  const strokeColor = $derived(color || "var(--color-action-brand-default)");
  const pad = 2;

  // Resolve the values array from `samples` (preferred) or `data`.
  const values = $derived<number[]>(
    samples && samples.length > 0
      ? samples.map((s) => s.value)
      : data,
  );

  // Effective fill mode: keep `showArea: true` working as `fill: 'gradient'`.
  const effectiveFill = $derived<"none" | "solid" | "gradient">(
    fill !== "none" ? fill : showArea ? "gradient" : "none",
  );

  // Y-axis range: clamp to [min, max] when provided; otherwise auto-fit.
  const autoMin = $derived(values.length ? Math.min(...values) : 0);
  const autoMax = $derived(values.length ? Math.max(...values) : 1);
  const yMin = $derived(typeof min === "number" ? min : autoMin);
  const yMax = $derived(typeof max === "number" ? max : autoMax);
  const yRange = $derived(yMax - yMin || 1);

  function scaleX(i: number, n: number): number {
    if (n <= 1) return width / 2;
    return pad + (i / (n - 1)) * (width - pad * 2);
  }

  function scaleY(v: number): number {
    return pad + (1 - (v - yMin) / yRange) * (height - pad * 2);
  }

  const polylinePoints = $derived(
    values.map((v, i) => `${scaleX(i, values.length)},${scaleY(v)}`).join(" "),
  );

  const areaPath = $derived.by(() => {
    if (values.length < 2) return "";
    const n = values.length;
    const pts = values.map((v, i) => `${scaleX(i, n)},${scaleY(v)}`);
    return `M ${pts[0]} ${pts
      .slice(1)
      .map((p) => `L ${p}`)
      .join(" ")} L ${scaleX(n - 1, n)},${height - pad} L ${scaleX(0, n)},${height - pad} Z`;
  });

  const lastX = $derived(
    values.length ? scaleX(values.length - 1, values.length) : 0,
  );
  const lastY = $derived(values.length ? scaleY(values[values.length - 1]) : 0);

  const lastValue = $derived(
    values.length ? values[values.length - 1] : null,
  );
  const lastValueText = $derived<string>(
    lastValue == null
      ? "—"
      : formatValue
        ? formatValue(lastValue)
        : Math.abs(lastValue) >= 1
          ? lastValue.toFixed(1)
          : lastValue.toFixed(3),
  );

  // Unique gradient id so multiple sparklines on the same page don't collide.
  const gradientId = $derived(
    `cy-sparkline-grad-${Math.random().toString(36).slice(2, 9)}`,
  );
</script>

<div class="cy-sparkline-wrap">
  {#if label}
    <div class="cy-sparkline__legend">
      <span class="cy-sparkline__name">{label}</span>
      <span class="cy-sparkline__last" style="color: {strokeColor};">{lastValueText}</span>
    </div>
  {/if}
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    class="cy-sparkline"
    class:cy-sparkline--animated={animate}
  >
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color={strokeColor} stop-opacity="0.3" />
        <stop offset="100%" stop-color={strokeColor} stop-opacity="0.02" />
      </linearGradient>
    </defs>

    {#if effectiveFill !== "none" && values.length >= 2}
      <path
        d={areaPath}
        fill={effectiveFill === "gradient"
          ? `url(#${gradientId})`
          : strokeColor}
        fill-opacity={effectiveFill === "solid" ? 0.16 : undefined}
        class="cy-sparkline__area"
      />
    {/if}

    {#if values.length >= 2}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={strokeColor}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="cy-sparkline__line"
      />
    {/if}

    {#if showEndDot && values.length > 0}
      <circle
        cx={lastX}
        cy={lastY}
        r="2.5"
        fill={strokeColor}
        class="cy-sparkline__dot"
      />
    {/if}
  </svg>
</div>

<style>
  .cy-sparkline-wrap {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    vertical-align: middle;
  }
  .cy-sparkline__legend {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2, 0.5rem);
    font-size: 0.6875rem;
  }
  .cy-sparkline__name {
    font-family: var(--font-mono, monospace);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-tertiary);
  }
  .cy-sparkline__last {
    font-family: var(--font-mono, monospace);
    font-weight: 600;
  }
  .cy-sparkline {
    display: inline-block;
    vertical-align: middle;
  }

  .cy-sparkline--animated .cy-sparkline__line {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: cy-sparkline-draw 1s ease forwards;
  }

  .cy-sparkline--animated .cy-sparkline__area {
    opacity: 0;
    animation: cy-sparkline-fade 0.6s ease 0.4s forwards;
  }

  .cy-sparkline--animated .cy-sparkline__dot {
    opacity: 0;
    animation: cy-sparkline-fade 0.3s ease 0.8s forwards;
  }

  @keyframes cy-sparkline-draw {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes cy-sparkline-fade {
    to {
      opacity: 1;
    }
  }

  .cy-sparkline__dot {
    filter: drop-shadow(0 0 3px currentColor);
  }
</style>
