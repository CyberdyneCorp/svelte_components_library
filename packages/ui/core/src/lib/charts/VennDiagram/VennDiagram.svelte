<svelte:options runes={true} />

<script lang="ts">
  type VennSet = { label: string; size: number; color?: string };
  type VennOverlap = { sets: number[]; size: number; label?: string };

  let {
    sets = [],
    overlaps = [],
    width = "100%",
    height = "350px",
    showLabels = true,
    showValues = true,
    showTooltip = true,
    animate = true,
    onSetClick,
    onOverlapClick,
    class: className = "",
  }: {
    sets?: VennSet[];
    overlaps?: VennOverlap[];
    width?: string;
    height?: string;
    showLabels?: boolean;
    showValues?: boolean;
    showTooltip?: boolean;
    animate?: boolean;
    onSetClick?: (set: VennSet, index: number) => void;
    onOverlapClick?: (overlap: VennOverlap) => void;
    class?: string;
  } = $props();

  const defaultColors = ["#00ff41", "#00d4ff", "#a855f7", "#ffb800"];
  const viewW = 500;
  const viewH = 350;
  const cx = viewW / 2;
  const cy = viewH / 2;

  function getColor(s: VennSet, i: number): string {
    return s.color || defaultColors[i % defaultColors.length];
  }

  // Layout: position circles based on set count
  let circleLayout = $derived.by(() => {
    const count = sets.length;
    if (count === 0) return [];

    const maxSize = Math.max(...sets.map((s) => s.size), 1);
    const baseRadius = Math.min(viewW, viewH) * 0.22;

    if (count === 1) {
      return [{
        cx: cx,
        cy: cy,
        r: baseRadius * 1.3,
        set: sets[0],
        index: 0,
      }];
    }

    if (count === 2) {
      const r1 = baseRadius * Math.sqrt(sets[0].size / maxSize) * 1.2;
      const r2 = baseRadius * Math.sqrt(sets[1].size / maxSize) * 1.2;
      const overlap = overlaps.find((o) => o.sets.length === 2 && o.sets.includes(0) && o.sets.includes(1));
      const overlapRatio = overlap ? overlap.size / Math.min(sets[0].size, sets[1].size) : 0.3;
      const separation = (r1 + r2) * (1 - overlapRatio * 0.5);
      return [
        { cx: cx - separation / 2, cy: cy, r: r1, set: sets[0], index: 0 },
        { cx: cx + separation / 2, cy: cy, r: r2, set: sets[1], index: 1 },
      ];
    }

    // 3+ sets: arrange in a circle
    const angleStep = (2 * Math.PI) / count;
    const orbitR = baseRadius * 0.7;
    return sets.map((s, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = baseRadius * Math.sqrt(s.size / maxSize) * 0.9;
      return {
        cx: cx + Math.cos(angle) * orbitR,
        cy: cy + Math.sin(angle) * orbitR,
        r: Math.max(r, 30),
        set: s,
        index: i,
      };
    });
  });

  // Overlap regions for 2-set case — compute intersection label position
  let overlapPositions = $derived.by(() => {
    return overlaps.map((o) => {
      if (o.sets.length === 2) {
        const c1 = circleLayout[o.sets[0]];
        const c2 = circleLayout[o.sets[1]];
        if (!c1 || !c2) return null;
        return {
          x: (c1.cx + c2.cx) / 2,
          y: (c1.cy + c2.cy) / 2,
          overlap: o,
        };
      }
      if (o.sets.length === 3) {
        const circles = o.sets.map((i) => circleLayout[i]).filter(Boolean);
        if (circles.length < 3) return null;
        return {
          x: circles.reduce((s, c) => s + c!.cx, 0) / circles.length,
          y: circles.reduce((s, c) => s + c!.cy, 0) / circles.length,
          overlap: o,
        };
      }
      return null;
    }).filter(Boolean);
  });

  // Tooltip
  let tooltip: { text: string; x: number; y: number } | null = $state(null);

  function showSetTooltip(set: VennSet, e: MouseEvent) {
    const svg = (e.currentTarget as SVGElement).closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    tooltip = {
      text: `${set.label}: ${set.size}`,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function hideTooltip() {
    tooltip = null;
  }
</script>

<div class="cy-venn-diagram {className}" style="width: {width}; height: {height};">
  <svg
    viewBox="0 0 {viewW} {viewH}"
    preserveAspectRatio="xMidYMid meet"
    class="cy-venn-diagram__svg"
    role="img"
    aria-label="Venn diagram"
  >
    <!-- Circles -->
    {#each circleLayout as circle}
      <circle
        cx={circle.cx}
        cy={circle.cy}
        r={circle.r}
        fill={getColor(circle.set, circle.index)}
        class="cy-venn-diagram__circle"
        class:cy-venn-diagram__circle--animated={animate}
        style="animation-delay: {circle.index * 0.15}s"
        onmouseenter={(e) => showSetTooltip(circle.set, e)}
        onmouseleave={hideTooltip}
        onclick={() => onSetClick?.(circle.set, circle.index)}
        role="presentation"
      />
    {/each}

    <!-- Set labels -->
    {#if showLabels}
      {#each circleLayout as circle}
        <text
          x={circle.cx}
          y={circle.cy - (showValues ? 8 : 0)}
          class="cy-venn-diagram__label"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {circle.set.label}
        </text>
        {#if showValues}
          <text
            x={circle.cx}
            y={circle.cy + 14}
            class="cy-venn-diagram__value"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {circle.set.size}
          </text>
        {/if}
      {/each}
    {/if}

    <!-- Overlap labels -->
    {#if showValues}
      {#each overlapPositions as pos}
        {#if pos}
          <text
            x={pos.x}
            y={pos.y}
            class="cy-venn-diagram__overlap-label"
            text-anchor="middle"
            dominant-baseline="middle"
            onclick={() => onOverlapClick?.(pos.overlap)}
            role="presentation"
          >
            {pos.overlap.label || pos.overlap.size}
          </text>
        {/if}
      {/each}
    {/if}
  </svg>

  <!-- Tooltip -->
  {#if showTooltip && tooltip}
    <div class="cy-venn-diagram__tooltip" style="left: {tooltip.x + 12}px; top: {tooltip.y - 8}px;">
      {tooltip.text}
    </div>
  {/if}
</div>

<style>
  .cy-venn-diagram {
    position: relative;
    font-family: var(--font-body, "Inter", sans-serif);
  }

  .cy-venn-diagram__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cy-venn-diagram__circle {
    opacity: 0.3;
    cursor: pointer;
    transition: opacity 200ms ease;
    stroke: none;
    mix-blend-mode: screen;
  }

  .cy-venn-diagram__circle:hover {
    opacity: 0.5;
  }

  .cy-venn-diagram__circle--animated {
    animation: cy-venn-grow 0.6s ease-out forwards;
    opacity: 0;
  }

  @keyframes cy-venn-grow {
    from { opacity: 0; r: 0; }
    to { opacity: 0.3; }
  }

  .cy-venn-diagram__label {
    fill: var(--color-text-primary);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-display, "Space Grotesk", sans-serif);
    pointer-events: none;
  }

  .cy-venn-diagram__value {
    fill: var(--color-text-secondary);
    font-size: 12px;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    pointer-events: none;
  }

  .cy-venn-diagram__overlap-label {
    fill: var(--color-text-primary);
    font-size: 13px;
    font-weight: 700;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    cursor: pointer;
    transition: fill 150ms ease;
  }

  .cy-venn-diagram__overlap-label:hover {
    fill: var(--color-action-brand-default);
  }

  .cy-venn-diagram__tooltip {
    position: absolute;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 0.75rem;
    color: var(--color-text-primary);
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
</style>
