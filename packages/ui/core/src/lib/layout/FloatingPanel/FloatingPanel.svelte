<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    /** Bindable open state. */
    open?: boolean;
    /** Right-aligned controls in the header (e.g. toggles, menus). */
    header?: Snippet;
    children: Snippet;
    /** Optional footer region below the body. */
    footer?: Snippet;
    minWidth?: number;
    minHeight?: number;
    /** Width used when `initialWidth` is not provided. */
    defaultWidth?: number;
    /** Initial top-left X in px. Defaults to docking 24px from the right edge. */
    initialX?: number;
    /** Initial top Y in px. */
    initialY?: number;
    /** Initial width in px. Falls back to `defaultWidth`. */
    initialWidth?: number;
    /** Initial height in px. When unset, content + min-height decide. */
    initialHeight?: number;
    /** Show a bottom-right resize handle. */
    resizable?: boolean;
    onclose?: () => void;
  };

  let {
    title,
    open = $bindable(false),
    header,
    children,
    footer,
    minWidth = 320,
    minHeight = 200,
    defaultWidth = 400,
    initialX,
    initialY,
    initialWidth,
    initialHeight,
    resizable = true,
    onclose,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let x = $state<number | null>(initialX ?? null);
  // svelte-ignore state_referenced_locally
  let y = $state<number | null>(initialY ?? null);
  // svelte-ignore state_referenced_locally
  let w = $state<number | null>(initialWidth ?? null);
  // svelte-ignore state_referenced_locally
  let h = $state<number | null>(initialHeight ?? null);

  let dragOffset: { dx: number; dy: number } | null = null;
  let resizeStart: { x: number; y: number; w: number; h: number } | null = null;

  function startDrag(e: PointerEvent) {
    const target = e.currentTarget as HTMLElement;
    const panel = target.closest(".cy-floating-panel") as HTMLElement | null;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragOffset = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    if (x === null || y === null) {
      x = rect.left;
      y = rect.top;
    }
    target.setPointerCapture(e.pointerId);
    target.addEventListener("pointermove", onDrag);
    target.addEventListener("pointerup", endDrag);
  }

  function onDrag(e: PointerEvent) {
    if (!dragOffset) return;
    x = Math.max(0, e.clientX - dragOffset.dx);
    y = Math.max(0, e.clientY - dragOffset.dy);
  }

  function endDrag(e: PointerEvent) {
    dragOffset = null;
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    target.removeEventListener("pointermove", onDrag);
    target.removeEventListener("pointerup", endDrag);
  }

  function startResize(e: PointerEvent) {
    const handle = e.currentTarget as HTMLElement;
    const panel = handle.closest(".cy-floating-panel") as HTMLElement | null;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    resizeStart = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };
    handle.setPointerCapture(e.pointerId);
    handle.addEventListener("pointermove", onResize);
    handle.addEventListener("pointerup", endResize);
    e.stopPropagation();
  }

  function onResize(e: PointerEvent) {
    if (!resizeStart) return;
    w = Math.max(minWidth, resizeStart.w + (e.clientX - resizeStart.x));
    h = Math.max(minHeight, resizeStart.h + (e.clientY - resizeStart.y));
  }

  function endResize(e: PointerEvent) {
    resizeStart = null;
    const handle = e.currentTarget as HTMLElement;
    handle.releasePointerCapture(e.pointerId);
    handle.removeEventListener("pointermove", onResize);
    handle.removeEventListener("pointerup", endResize);
  }

  const positionStyle = $derived(
    x === null
      ? `left: auto; right: 24px; top: ${y ?? 88}px;`
      : `left: ${x}px; right: auto; top: ${y}px;`,
  );
  // Always emit a definite width. Without one, a fixed-position element with
  // `left` set takes a shrink-to-fit width tied to the distance to the
  // viewport's right edge — so the panel would visually resize while being
  // dragged and pin its right edge to the screen.
  const resolvedWidth = $derived(w ?? Math.max(minWidth, defaultWidth));
  const sizeStyle = $derived(
    `width: ${resolvedWidth}px;${h !== null ? ` height: ${h}px;` : ""}`,
  );
</script>

{#if open}
  <div
    class="cy-floating-panel"
    data-testid="cy-floating-panel"
    role="dialog"
    aria-label={title}
    style="--cy-fp-min-w: {minWidth}px; --cy-fp-min-h: {minHeight}px; {positionStyle} {sizeStyle}"
  >
    <div class="cy-floating-panel__header" role="presentation" onpointerdown={startDrag}>
      <span class="cy-floating-panel__title">{title}</span>
      {#if header}
        <div
          class="cy-floating-panel__header-extra"
          role="presentation"
          onpointerdown={(e) => e.stopPropagation()}
        >
          {@render header()}
        </div>
      {/if}
      <button
        class="cy-floating-panel__close"
        type="button"
        aria-label="Close"
        onpointerdown={(e) => e.stopPropagation()}
        onclick={() => {
          open = false;
          onclose?.();
        }}
      >
        ×
      </button>
    </div>

    <div class="cy-floating-panel__body">
      {@render children()}
    </div>

    {#if footer}
      <div class="cy-floating-panel__footer">
        {@render footer()}
      </div>
    {/if}

    {#if resizable}
      <div
        class="cy-floating-panel__resize"
        role="presentation"
        aria-hidden="true"
        onpointerdown={startResize}
      ></div>
    {/if}
  </div>
{/if}

<style>
  .cy-floating-panel {
    position: fixed;
    min-width: var(--cy-fp-min-w);
    min-height: var(--cy-fp-min-h);
    max-width: 90vw;
    max-height: 85vh;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
    display: flex;
    flex-direction: column;
    z-index: 50;
    pointer-events: auto;
  }
  .cy-floating-panel__header {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border-subtle);
    cursor: grab;
    user-select: none;
    touch-action: none;
  }
  .cy-floating-panel__header:active {
    cursor: grabbing;
  }
  .cy-floating-panel__title {
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-text-secondary);
  }
  .cy-floating-panel__header-extra {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }
  .cy-floating-panel__close {
    margin-left: auto;
    background: transparent;
    border: 1px solid var(--color-border-default);
    color: var(--color-text-secondary);
    border-radius: var(--radius-md, 8px);
    width: 24px;
    height: 24px;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }
  .cy-floating-panel__close:hover {
    color: var(--color-text-primary);
    border-color: var(--color-action-brand-default);
  }
  .cy-floating-panel__body {
    flex: 1;
    overflow: auto;
    padding: var(--space-3, 0.75rem);
    min-height: 0;
  }
  .cy-floating-panel__footer {
    border-top: 1px solid var(--color-border-subtle);
    padding: var(--space-3, 0.75rem);
  }
  .cy-floating-panel__resize {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    touch-action: none;
    background:
      linear-gradient(
        135deg,
        transparent 0 50%,
        var(--color-border-strong, var(--color-border-default)) 50% 60%,
        transparent 60% 70%,
        var(--color-border-strong, var(--color-border-default)) 70% 80%,
        transparent 80%
      );
  }
</style>
