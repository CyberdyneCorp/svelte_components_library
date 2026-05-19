<svelte:options runes={true} />

<script lang="ts">
  let {
    onzoomin,
    onzoomout,
    onfit,
    onreset,
    orientation = "vertical",
  }: {
    onzoomin?: () => void;
    onzoomout?: () => void;
    onfit?: () => void;
    onreset?: () => void;
    orientation?: "vertical" | "horizontal";
  } = $props();
</script>

<div class="cy-flow-canvas-controls cy-flow-canvas-controls--{orientation}">
  <button class="cy-flow-canvas-controls__btn" title="Zoom in" onclick={onzoomin}>+</button>
  <button class="cy-flow-canvas-controls__btn" title="Zoom out" onclick={onzoomout}>−</button>
  <button class="cy-flow-canvas-controls__btn" title="Fit to nodes" onclick={onfit}>⛶</button>
  <button class="cy-flow-canvas-controls__btn" title="Reset to 100%" onclick={onreset}>1:1</button>
</div>

<style>
  .cy-flow-canvas-controls {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .cy-flow-canvas-controls--vertical {
    flex-direction: column;
  }

  .cy-flow-canvas-controls__btn {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 14px;
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-flow-canvas-controls__btn:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
  }

  .cy-flow-canvas-controls__btn:active {
    background: var(--color-surface-active);
  }
</style>
