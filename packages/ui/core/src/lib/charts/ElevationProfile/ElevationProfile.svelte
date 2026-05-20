<svelte:options runes={true} />

<script lang="ts">
  type Sample = {
    /** Cumulative distance from the start of the path, in metres. */
    distanceM: number;
    /** Terrain elevation in metres, or null where unknown. */
    elevationM: number | null;
  };

  type Endpoint = {
    label?: string;
    /** Hex colour for the endpoint dot. */
    color?: string;
  };

  type FresnelSpec = {
    /** Transmit frequency in MHz — sets the wavelength. */
    freqMhz: number;
    /** Antenna height above terrain at the start, in metres. */
    heightFromM: number;
    /** Antenna height above terrain at the end, in metres. */
    heightToM: number;
  };

  type Props = {
    /** Ordered terrain samples from start to end of the path. */
    samples: Sample[];
    from?: Endpoint;
    to?: Endpoint;
    /** Draw the direct (terrain-to-terrain) line-of-sight dashed line. */
    showLineOfSight?: boolean;
    /**
     * When set, overlays the antenna line-of-sight (terrain + heights) and
     * the first Fresnel zone ellipse — for RF / point-to-point link planning.
     */
    fresnel?: FresnelSpec | null;
    /** Hex fill colour for the terrain area. */
    fillColor?: string;
    /** Hex stroke colour for the terrain line. */
    lineColor?: string;
    /** Hex colour for the direct line-of-sight dashed line. */
    losColor?: string;
    /** Hex colour for the Fresnel overlay. */
    fresnelColor?: string;
    /** Show the Δ / min / max / distance footer. */
    showStats?: boolean;
    width?: number;
    height?: number;
  };

  let {
    samples,
    from,
    to,
    showLineOfSight = true,
    fresnel = null,
    fillColor = "#00ff41",
    lineColor = "#00ff41",
    losColor = "#ff4d8d",
    fresnelColor = "#60a5fa",
    showStats = true,
    width = 720,
    height = 260,
  }: Props = $props();

  const PADDING = { l: 50, r: 16, t: 16, b: 32 };
  const FRESNEL_SAMPLES = 96;

  const distanceM = $derived(
    samples.length > 0 ? samples[samples.length - 1].distanceM : 1,
  );
  const distMax = $derived(distanceM || 1);

  const fromE = $derived(samples[0]?.elevationM ?? 0);
  const toE = $derived(samples[samples.length - 1]?.elevationM ?? 0);

  const losFromE = $derived(fromE + (fresnel?.heightFromM ?? 0));
  const losToE = $derived(toE + (fresnel?.heightToM ?? 0));

  const wavelengthM = $derived(
    fresnel ? 299_792_458 / (fresnel.freqMhz * 1e6) : 0,
  );

  const fresnelEnvelope = $derived.by(() => {
    if (!fresnel) return [] as { d: number; r: number; los: number }[];
    const D = distMax;
    const lam = wavelengthM;
    const out: { d: number; r: number; los: number }[] = [];
    for (let i = 0; i <= FRESNEL_SAMPLES; i++) {
      const d = (i / FRESNEL_SAMPLES) * D;
      const da = d;
      const db = D - d;
      const r = da > 0 && db > 0 ? Math.sqrt((lam * da * db) / D) : 0;
      const los = losFromE + ((losToE - losFromE) * d) / D;
      out.push({ d, r, los });
    }
    return out;
  });

  const validValues = $derived(
    samples
      .map((s) => s.elevationM)
      .filter((v): v is number => v != null && Number.isFinite(v)),
  );

  const allYValues = $derived([
    ...validValues,
    ...(fresnel ? fresnelEnvelope.flatMap((p) => [p.los + p.r, p.los - p.r]) : []),
    ...(fresnel ? [losFromE, losToE] : []),
  ]);

  const minE = $derived(allYValues.length ? Math.min(...allYValues) : 0);
  const maxE = $derived(allYValues.length ? Math.max(...allYValues) : 1);
  const eRange = $derived(Math.max(1, maxE - minE));

  function xFor(distM: number): number {
    return PADDING.l + (distM / distMax) * (width - PADDING.l - PADDING.r);
  }
  function yFor(eM: number): number {
    return height - PADDING.b - ((eM - minE) / eRange) * (height - PADDING.t - PADDING.b);
  }

  const linePath = $derived(
    samples
      .map((s, i) => {
        if (s.elevationM == null) return "";
        return `${i === 0 ? "M" : "L"}${xFor(s.distanceM).toFixed(1)},${yFor(s.elevationM).toFixed(1)}`;
      })
      .join(" "),
  );

  const areaPath = $derived.by(() => {
    const baseY = height - PADDING.b;
    const seg = samples
      .map((s) =>
        s.elevationM == null
          ? null
          : { x: xFor(s.distanceM), y: yFor(s.elevationM) },
      )
      .filter((p): p is { x: number; y: number } => p !== null);
    if (seg.length === 0) return "";
    return (
      `M${seg[0].x},${baseY} L` +
      seg.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L") +
      ` L${seg[seg.length - 1].x},${baseY} Z`
    );
  });

  const fresnelPath = $derived.by(() => {
    if (!fresnel || fresnelEnvelope.length < 2) return "";
    const upper = fresnelEnvelope.map(
      (p) => `${xFor(p.d).toFixed(1)},${yFor(p.los + p.r).toFixed(1)}`,
    );
    const lower = fresnelEnvelope
      .slice()
      .reverse()
      .map((p) => `${xFor(p.d).toFixed(1)},${yFor(p.los - p.r).toFixed(1)}`);
    return `M${upper[0]} L${upper.slice(1).join(" L")} L${lower.join(" L")} Z`;
  });

  function fmtDist(m: number): string {
    return m >= 10_000 ? `${(m / 1000).toFixed(1)} km` : `${m.toFixed(0)} m`;
  }

  const stats = $derived.by(() => {
    if (validValues.length === 0) {
      return { diff: null, min: null, max: null };
    }
    return {
      diff: toE - fromE,
      min: Math.min(...validValues),
      max: Math.max(...validValues),
    };
  });

  const fromColor = $derived(from?.color ?? "#00ff41");
  const toColor = $derived(to?.color ?? "#00d4ff");
</script>

<div class="cy-elev-profile">
  {#if from?.label || to?.label}
    <div class="cy-elev-profile__header">
      <div class="cy-elev-profile__endpoints">
        <span class="cy-elev-profile__dot" style="background: {fromColor}; color: {fromColor};"></span>
        <span class="cy-elev-profile__mono">{from?.label ?? "Start"}</span>
        <span class="cy-elev-profile__muted">→</span>
        <span class="cy-elev-profile__dot" style="background: {toColor}; color: {toColor};"></span>
        <span class="cy-elev-profile__mono">{to?.label ?? "End"}</span>
      </div>
      <div class="cy-elev-profile__muted cy-elev-profile__mono">{fmtDist(distanceM)}</div>
    </div>
  {/if}

  <svg
    class="cy-elev-profile__chart"
    viewBox="0 0 {width} {height}"
    preserveAspectRatio="none"
    role="img"
    aria-label="Elevation profile over {fmtDist(distanceM)}"
  >
    {#each [0, 0.25, 0.5, 0.75, 1] as t (t)}
      <line
        x1={PADDING.l}
        x2={width - PADDING.r}
        y1={PADDING.t + t * (height - PADDING.t - PADDING.b)}
        y2={PADDING.t + t * (height - PADDING.t - PADDING.b)}
        stroke="var(--color-border-subtle)"
        stroke-dasharray="3,3"
      />
    {/each}

    {#each [0, 0.5, 1] as t (t)}
      {@const eVal = maxE - t * eRange}
      <text
        x={PADDING.l - 8}
        y={PADDING.t + t * (height - PADDING.t - PADDING.b) + 4}
        text-anchor="end"
        font-size="10"
        font-family="var(--font-mono, monospace)"
        fill="var(--color-text-tertiary)"
      >
        {eVal.toFixed(0)} m
      </text>
    {/each}

    {#each [0, 0.5, 1] as t (t)}
      <text
        x={PADDING.l + t * (width - PADDING.l - PADDING.r)}
        y={height - 10}
        text-anchor="middle"
        font-size="10"
        font-family="var(--font-mono, monospace)"
        fill="var(--color-text-tertiary)"
      >
        {fmtDist(distMax * t)}
      </text>
    {/each}

    <path d={areaPath} fill={fillColor} fill-opacity="0.18" />
    <path d={linePath} fill="none" stroke={lineColor} stroke-width="1.5" />

    {#if fresnel}
      <path
        d={fresnelPath}
        fill={fresnelColor}
        fill-opacity="0.2"
        stroke={fresnelColor}
        stroke-opacity="0.7"
        stroke-width="1"
      />
      <line
        x1={xFor(0)}
        y1={yFor(losFromE)}
        x2={xFor(distMax)}
        y2={yFor(losToE)}
        stroke={fresnelColor}
        stroke-width="1"
        stroke-opacity="0.8"
      />
    {/if}

    {#if showLineOfSight}
      <line
        x1={xFor(0)}
        y1={yFor(fromE)}
        x2={xFor(distMax)}
        y2={yFor(toE)}
        stroke={losColor}
        stroke-width="1.2"
        stroke-dasharray="6,4"
        stroke-opacity="0.85"
      />
    {/if}

    <circle cx={xFor(0)} cy={yFor(fromE)} r="5" fill={fromColor} stroke="white" stroke-width="1.5" />
    <circle cx={xFor(distMax)} cy={yFor(toE)} r="5" fill={toColor} stroke="white" stroke-width="1.5" />
  </svg>

  {#if showStats}
    <div class="cy-elev-profile__stats">
      <div class="cy-elev-profile__cell">
        <span class="cy-elev-profile__label">Δ Elevation</span>
        <span class="cy-elev-profile__mono">
          {stats.diff == null ? "—" : `${stats.diff >= 0 ? "+" : ""}${stats.diff.toFixed(0)} m`}
        </span>
      </div>
      <div class="cy-elev-profile__cell">
        <span class="cy-elev-profile__label">Min</span>
        <span class="cy-elev-profile__mono">{stats.min == null ? "—" : `${stats.min.toFixed(0)} m`}</span>
      </div>
      <div class="cy-elev-profile__cell">
        <span class="cy-elev-profile__label">Max</span>
        <span class="cy-elev-profile__mono">{stats.max == null ? "—" : `${stats.max.toFixed(0)} m`}</span>
      </div>
      <div class="cy-elev-profile__cell">
        <span class="cy-elev-profile__label">Distance</span>
        <span class="cy-elev-profile__mono">{fmtDist(distanceM)}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .cy-elev-profile {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }
  .cy-elev-profile__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cy-elev-profile__endpoints {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .cy-elev-profile__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 6px currentColor;
  }
  .cy-elev-profile__mono {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    color: var(--color-text-primary);
  }
  .cy-elev-profile__muted {
    color: var(--color-text-tertiary);
  }
  .cy-elev-profile__chart {
    width: 100%;
    height: auto;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md, 8px);
  }
  .cy-elev-profile__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2, 0.5rem);
  }
  .cy-elev-profile__cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md, 8px);
  }
  .cy-elev-profile__label {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-tertiary);
  }
</style>
