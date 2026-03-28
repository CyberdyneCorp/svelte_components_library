<svelte:options runes={true} />

<script lang="ts">
  type Threshold = { value: number; color: string };

  let {
    value = 0,
    min = 0,
    max = 100,
    label = "",
    unit = "",
    size = 160,
    thresholds = [],
    showValue = true,
  }: {
    value?: number;
    min?: number;
    max?: number;
    label?: string;
    unit?: string;
    size?: number;
    thresholds?: Threshold[];
    showValue?: boolean;
  } = $props();

  const defaultThresholds: Threshold[] = [
    { value: 60, color: "var(--color-state-success)" },
    { value: 80, color: "var(--color-state-warning)" },
    { value: 100, color: "var(--color-state-error)" },
  ];

  let activeThresholds = $derived(thresholds.length > 0 ? thresholds : defaultThresholds);

  const sweepAngle = 270;
  const startAngleDeg = 135;
  const cx = $derived(size / 2);
  const cy = $derived(size / 2);
  const radius = $derived(size / 2 - 12);
  const strokeW = $derived(Math.max(8, size * 0.06));

  let range = $derived(max - min || 1);
  let clampedValue = $derived(Math.min(Math.max(value, min), max));
  let pct = $derived((clampedValue - min) / range);

  function polarToCartesian(centerX: number, centerY: number, r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: centerX + r * Math.cos(rad), y: centerY + r * Math.sin(rad) };
  }

  function describeArc(centerX: number, centerY: number, r: number, startDeg: number, endDeg: number): string {
    const start = polarToCartesian(centerX, centerY, r, endDeg);
    const end = polarToCartesian(centerX, centerY, r, startDeg);
    const sweep = endDeg - startDeg;
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  let trackPath = $derived(describeArc(cx, cy, radius, startAngleDeg, startAngleDeg + sweepAngle));
  let fillEndAngle = $derived(startAngleDeg + pct * sweepAngle);
  let fillPath = $derived(pct > 0 ? describeArc(cx, cy, radius, startAngleDeg, fillEndAngle) : "");

  let fillColor = $derived.by(() => {
    const pctValue = pct * 100;
    let color = activeThresholds[activeThresholds.length - 1]?.color || "var(--color-action-brand-default)";
    for (const t of activeThresholds) {
      const tPct = ((t.value - min) / range) * 100;
      if (pctValue <= tPct) {
        color = t.color;
        break;
      }
    }
    return color;
  });

  function formatValue(v: number): string {
    return Number.isInteger(v) ? v.toString() : v.toFixed(1);
  }
</script>

<div class="cy-gauge" style="width: {size}px;">
  <svg viewBox="0 0 {size} {size}" class="cy-gauge__svg" width={size} height={size}>
    <!-- Background track -->
    <path
      d={trackPath}
      fill="none"
      stroke="var(--color-surface-hover)"
      stroke-width={strokeW}
      stroke-linecap="round"
      class="cy-gauge__track"
    />

    <!-- Fill arc -->
    {#if fillPath}
      <path
        d={fillPath}
        fill="none"
        stroke={fillColor}
        stroke-width={strokeW}
        stroke-linecap="round"
        class="cy-gauge__fill"
      />
    {/if}

    <!-- Value text -->
    {#if showValue}
      <text x={cx} y={cy + 4} class="cy-gauge__value" text-anchor="middle" dominant-baseline="central">
        {formatValue(clampedValue)}{#if unit}<tspan class="cy-gauge__unit">{unit}</tspan>{/if}
      </text>
    {/if}

    <!-- Label -->
    {#if label}
      <text x={cx} y={cy + size * 0.2} class="cy-gauge__label" text-anchor="middle">
        {label}
      </text>
    {/if}

    <!-- Min / Max labels -->
    {#if true}
      {@const minPos = polarToCartesian(cx, cy, radius + strokeW + 6, startAngleDeg)}
      {@const maxPos = polarToCartesian(cx, cy, radius + strokeW + 6, startAngleDeg + sweepAngle)}
      <text x={minPos.x} y={minPos.y} class="cy-gauge__range" text-anchor="middle">{formatValue(min)}</text>
      <text x={maxPos.x} y={maxPos.y} class="cy-gauge__range" text-anchor="middle">{formatValue(max)}</text>
    {/if}
  </svg>
</div>

<style>
  .cy-gauge {
    position: relative;
    font-family: var(--font-body);
    display: inline-block;
  }

  .cy-gauge__svg {
    display: block;
  }

  .cy-gauge__fill {
    transition: stroke 300ms ease;
    filter: drop-shadow(0 0 4px currentColor);
  }

  .cy-gauge__value {
    font-size: 1.5rem;
    fill: var(--color-text-primary);
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .cy-gauge__unit {
    font-size: 0.75rem;
    fill: var(--color-text-tertiary);
    font-weight: 400;
  }

  .cy-gauge__label {
    font-size: 0.7rem;
    fill: var(--color-text-secondary);
    font-family: var(--font-body);
  }

  .cy-gauge__range {
    font-size: 0.55rem;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }
</style>
