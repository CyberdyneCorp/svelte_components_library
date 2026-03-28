<svelte:options runes={true} />

<script lang="ts">
  let {
    data = [],
    width = 120,
    height = 32,
    color,
    showArea = false,
    showEndDot = true,
    animate = true,
  }: {
    data?: number[];
    width?: number;
    height?: number;
    color?: string;
    showArea?: boolean;
    showEndDot?: boolean;
    animate?: boolean;
  } = $props();

  const strokeColor = $derived(color || "var(--color-action-brand-default)");
  const pad = 2;

  let yMin = $derived(data.length ? Math.min(...data) : 0);
  let yMax = $derived(data.length ? Math.max(...data) : 1);
  let yRange = $derived(yMax - yMin || 1);

  function scaleX(i: number): number {
    if (data.length <= 1) return width / 2;
    return pad + (i / (data.length - 1)) * (width - pad * 2);
  }

  function scaleY(v: number): number {
    return pad + (1 - (v - yMin) / yRange) * (height - pad * 2);
  }

  let polylinePoints = $derived(
    data.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ")
  );

  let areaPath = $derived.by(() => {
    if (data.length < 2) return "";
    const pts = data.map((v, i) => `${scaleX(i)},${scaleY(v)}`);
    return `M ${pts[0]} ${pts.slice(1).map((p) => `L ${p}`).join(" ")} L ${scaleX(data.length - 1)},${height - pad} L ${scaleX(0)},${height - pad} Z`;
  });

  let lastX = $derived(data.length ? scaleX(data.length - 1) : 0);
  let lastY = $derived(data.length ? scaleY(data[data.length - 1]) : 0);
</script>

<svg
  {width}
  {height}
  viewBox="0 0 {width} {height}"
  class="cy-sparkline"
  class:cy-sparkline--animated={animate}
>
  <defs>
    <linearGradient id="cy-sparkline-grad-{width}-{height}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color={strokeColor} stop-opacity="0.3" />
      <stop offset="100%" stop-color={strokeColor} stop-opacity="0.02" />
    </linearGradient>
  </defs>

  {#if showArea && data.length >= 2}
    <path
      d={areaPath}
      fill="url(#cy-sparkline-grad-{width}-{height})"
      class="cy-sparkline__area"
    />
  {/if}

  {#if data.length >= 2}
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

  {#if showEndDot && data.length > 0}
    <circle
      cx={lastX}
      cy={lastY}
      r="2.5"
      fill={strokeColor}
      class="cy-sparkline__dot"
    />
  {/if}
</svg>

<style>
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
