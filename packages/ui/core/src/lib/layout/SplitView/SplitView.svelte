<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    direction = "horizontal",
    initialSplit = 50,
    minSize = 100,
    collapsible = false,
    left,
    right,
    top,
    bottom,
  }: {
    direction?: "horizontal" | "vertical";
    initialSplit?: number;
    minSize?: number;
    collapsible?: boolean;
    left?: Snippet;
    right?: Snippet;
    top?: Snippet;
    bottom?: Snippet;
  } = $props();

  let splitPercent = $state(initialSplit);
  let dragging = $state(false);
  let containerEl: HTMLDivElement | undefined = $state();

  function onMouseDown(e: MouseEvent) {
    e.preventDefault();
    dragging = true;

    const onMouseMove = (e: MouseEvent) => {
      if (!containerEl) return;
      const rect = containerEl.getBoundingClientRect();

      let newPercent: number;
      if (direction === "horizontal") {
        const x = e.clientX - rect.left;
        newPercent = (x / rect.width) * 100;
      } else {
        const y = e.clientY - rect.top;
        newPercent = (y / rect.height) * 100;
      }

      const totalSize = direction === "horizontal" ? rect.width : rect.height;
      const minPercent = (minSize / totalSize) * 100;
      const maxPercent = 100 - minPercent;

      splitPercent = Math.min(maxPercent, Math.max(minPercent, newPercent));
    };

    const onMouseUp = () => {
      dragging = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function handleCollapse(panel: "first" | "second") {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const totalSize = direction === "horizontal" ? rect.width : rect.height;
    const minPercent = (minSize / totalSize) * 100;

    if (panel === "first") {
      splitPercent = minPercent;
    } else {
      splitPercent = 100 - minPercent;
    }
  }

  let firstSnippet = $derived(direction === "horizontal" ? left : top);
  let secondSnippet = $derived(direction === "horizontal" ? right : bottom);
</script>

<div
  class="cy-split cy-split--{direction}"
  class:cy-split--dragging={dragging}
  bind:this={containerEl}
>
  <div class="cy-split__panel cy-split__panel--first" style="{direction === 'horizontal' ? 'width' : 'height'}: {splitPercent}%">
    {#if firstSnippet}
      {@render firstSnippet()}
    {/if}
  </div>

  <div
    class="cy-split__divider"
    onmousedown={onMouseDown}
    role="separator"
    aria-orientation={direction}
    tabindex="0"
  >
    <div class="cy-split__grip">
      <span></span><span></span><span></span>
    </div>
    {#if collapsible}
      <button class="cy-split__collapse cy-split__collapse--first" onclick={() => handleCollapse("first")} type="button" aria-label="Collapse first panel">
        {direction === "horizontal" ? "\u25C0" : "\u25B2"}
      </button>
      <button class="cy-split__collapse cy-split__collapse--second" onclick={() => handleCollapse("second")} type="button" aria-label="Collapse second panel">
        {direction === "horizontal" ? "\u25B6" : "\u25BC"}
      </button>
    {/if}
  </div>

  <div class="cy-split__panel cy-split__panel--second" style="{direction === 'horizontal' ? 'width' : 'height'}: {100 - splitPercent}%">
    {#if secondSnippet}
      {@render secondSnippet()}
    {/if}
  </div>
</div>

<style>
  .cy-split {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--color-bg-primary);
  }

  .cy-split--horizontal {
    flex-direction: row;
  }

  .cy-split--vertical {
    flex-direction: column;
  }

  .cy-split--dragging {
    user-select: none;
  }

  .cy-split--horizontal.cy-split--dragging {
    cursor: col-resize;
  }

  .cy-split--vertical.cy-split--dragging {
    cursor: row-resize;
  }

  .cy-split__panel {
    overflow: auto;
    min-width: 0;
    min-height: 0;
  }

  .cy-split__divider {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-tertiary);
    border: none;
    position: relative;
    transition: background 150ms ease;
  }

  .cy-split--horizontal .cy-split__divider {
    width: 8px;
    cursor: col-resize;
    flex-direction: column;
    border-left: 1px solid var(--color-border-subtle);
    border-right: 1px solid var(--color-border-subtle);
  }

  .cy-split--vertical .cy-split__divider {
    height: 8px;
    cursor: row-resize;
    flex-direction: row;
    border-top: 1px solid var(--color-border-subtle);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-split__divider:hover,
  .cy-split--dragging .cy-split__divider {
    background: rgba(0, 255, 65, 0.15);
    border-color: var(--color-action-brand-default);
  }

  .cy-split__grip {
    display: flex;
    gap: 2px;
  }

  .cy-split--horizontal .cy-split__grip {
    flex-direction: column;
  }

  .cy-split--vertical .cy-split__grip {
    flex-direction: row;
  }

  .cy-split__grip span {
    display: block;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--color-text-tertiary);
    transition: background 150ms ease;
  }

  .cy-split__divider:hover .cy-split__grip span,
  .cy-split--dragging .cy-split__grip span {
    background: var(--color-action-brand-default);
  }

  .cy-split__collapse {
    position: absolute;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    color: var(--color-text-tertiary);
    font-size: 0.5rem;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: var(--radius-sm);
    padding: 0;
    transition: color 150ms ease, border-color 150ms ease;
    z-index: 1;
  }

  .cy-split__collapse:hover {
    color: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
  }

  .cy-split--horizontal .cy-split__collapse--first {
    top: 4px;
  }

  .cy-split--horizontal .cy-split__collapse--second {
    bottom: 4px;
  }

  .cy-split--vertical .cy-split__collapse--first {
    left: 4px;
  }

  .cy-split--vertical .cy-split__collapse--second {
    right: 4px;
  }
</style>
