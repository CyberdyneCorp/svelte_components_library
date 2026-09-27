<svelte:options runes={true} />

<script lang="ts">
  import { markerClipPath, type ChartMarkerShape } from "./markers.js";
  import type { ChartLegendItem } from "./types.js";

  let {
    items = [],
    showLine = false,
    ariaLabel = "Legend",
    blockClass = "",
    class: className = "",
  }: {
    items?: ChartLegendItem[];
    /** Draw a short line sample (with the item's dash pattern) before the marker. */
    showLine?: boolean;
    ariaLabel?: string;
    /** BEM block of the host chart; adds `<block>__legend`, `__legend-item`, … hooks. */
    blockClass?: string;
    class?: string;
  } = $props();

  // Set imperatively: some CSS parsers (e.g. jsdom) drop a whole style
  // attribute that contains a polygon() value, taking the colour with it.
  // A `use:` action: attachments need Svelte 5.29+, above the peer range.
  function clipTo(node: HTMLElement, shape: ChartMarkerShape) {
    const apply = (next: ChartMarkerShape) => node.style.setProperty("clip-path", markerClipPath(next));
    apply(shape);
    return { update: apply };
  }

  function hook(element: string): string {
    return blockClass ? `${blockClass}__${element}` : "";
  }
</script>

<ul class="cy-chart-legend {hook('legend')} {className}" aria-label={ariaLabel}>
  {#each items as item, i (i)}
    <li class="cy-chart-legend__item {hook('legend-item')}" data-marker={item.marker ?? "circle"}>
      {#if showLine}
        <svg class="cy-chart-legend__line" width="20" height="10" viewBox="0 0 20 10" aria-hidden="true">
          <line x1="1" y1="5" x2="19" y2="5" stroke={item.color} stroke-width="2" stroke-dasharray={item.dash || undefined} />
        </svg>
      {/if}
      <span
        class="cy-chart-legend__marker {hook('legend-dot')}"
        style:background={item.color}
        use:clipTo={item.marker ?? "circle"}
        aria-hidden="true"
      ></span>
      <span class="cy-chart-legend__label {hook('legend-label')}">{item.label}</span>
      {#if item.detail}
        <span class="cy-chart-legend__detail {hook('legend-value')}">{item.detail}</span>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .cy-chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    justify-content: center;
    margin: 0;
    padding: var(--space-2) 0 0;
    list-style: none;
  }

  .cy-chart-legend__item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-family: var(--font-body);
    color: var(--color-text-secondary);
  }

  .cy-chart-legend__line {
    flex-shrink: 0;
  }

  .cy-chart-legend__marker {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
  }

  .cy-chart-legend__detail {
    font-family: var(--font-mono);
    color: var(--color-text-secondary);
  }
</style>
