<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    title = "",
    open = $bindable(true),
    x = $bindable(80),
    y = $bindable(80),
    width = $bindable(720),
    height = $bindable(480),
    minWidth = 280,
    minHeight = 160,
    draggable = true,
    resizable = true,
    showFooter = true,
    onClose,
    onFocus,
    children,
    footer,
  }: {
    title?: string;
    open?: boolean;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    draggable?: boolean;
    resizable?: boolean;
    showFooter?: boolean;
    onClose?: () => void;
    onFocus?: () => void;
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  let dragging = $state(false);
  let resizing = $state(false);
  let dragOffX = 0;
  let dragOffY = 0;
  let startW = 0;
  let startH = 0;
  let startMX = 0;
  let startMY = 0;

  function close() {
    open = false;
    onClose?.();
  }

  function onTitleDown(e: MouseEvent) {
    if (!draggable) return;
    dragging = true;
    dragOffX = e.clientX - x;
    dragOffY = e.clientY - y;
    onFocus?.();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    e.preventDefault();
  }

  function onResizeDown(e: MouseEvent) {
    if (!resizable) return;
    resizing = true;
    startW = width;
    startH = height;
    startMX = e.clientX;
    startMY = e.clientY;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    e.stopPropagation();
    e.preventDefault();
  }

  function onMove(e: MouseEvent) {
    if (dragging) {
      x = e.clientX - dragOffX;
      y = e.clientY - dragOffY;
    } else if (resizing) {
      width = Math.max(minWidth, startW + (e.clientX - startMX));
      height = Math.max(minHeight, startH + (e.clientY - startMY));
    }
  }

  function onUp() {
    dragging = false;
    resizing = false;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }
</script>

{#if open}
  <div
    class="cy-rwin"
    style:left="{x}px"
    style:top="{y}px"
    style:width="{width}px"
    style:height="{height}px"
    role="dialog"
    aria-label={title}
    tabindex="-1"
    onmousedown={() => onFocus?.()}
    onkeydown={onKeydown}
  >
    <div
      class="cy-rwin__titlebar"
      role="toolbar"
      aria-label="Window title bar"
      tabindex="-1"
      onmousedown={onTitleDown}
    >
      <button
        class="cy-rwin__close"
        aria-label="Close window"
        onclick={close}
        onmousedown={(e) => e.stopPropagation()}
      >×</button>
      <div class="cy-rwin__lines cy-rwin__lines--left" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <span class="cy-rwin__title">{title}</span>
      <div class="cy-rwin__lines cy-rwin__lines--right" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    </div>

    <div class="cy-rwin__body">
      {#if children}{@render children()}{/if}
    </div>

    {#if showFooter}
      <div class="cy-rwin__footer">
        {#if footer}
          {@render footer()}
        {:else}
          <span class="cy-rwin__status">{title}</span>
        {/if}
        {#if resizable}
          <div
            class="cy-rwin__resize"
            role="button"
            tabindex="0"
            aria-label="Resize window"
            onmousedown={onResizeDown}
          ></div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .cy-rwin {
    position: fixed;
    display: flex;
    flex-direction: column;
    background: var(--color-surface-default, #fff);
    border: 2px solid var(--color-text-primary, #12121a);
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.5);
    font-family: var(--font-body, monospace);
    user-select: none;
    z-index: 100;
  }
  .cy-rwin__titlebar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-bottom: 2px solid var(--color-text-primary, #12121a);
    background: var(--color-surface-default, #fff);
    cursor: move;
  }
  .cy-rwin__close {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border: 2px solid var(--color-text-primary, #12121a);
    background: var(--color-surface-default, #fff);
    color: var(--color-text-primary, #12121a);
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
    padding: 0;
  }
  .cy-rwin__close:hover { background: var(--color-state-error, #ff4444); color: #fff; }
  .cy-rwin__lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 20px;
  }
  .cy-rwin__lines span {
    display: block;
    height: 2px;
    background: var(--color-text-primary, #12121a);
  }
  .cy-rwin__title {
    font-weight: 600;
    white-space: nowrap;
    padding: 0 8px;
  }
  .cy-rwin__body {
    flex: 1;
    overflow: auto;
    padding: 12px;
    background: var(--color-surface-default, #fff);
  }
  .cy-rwin__footer {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-top: 2px solid var(--color-text-primary, #12121a);
    background: var(--color-surface-raised, #f5f5fa);
    font-size: 0.75rem;
  }
  .cy-rwin__status { flex: 1; }
  .cy-rwin__resize {
    width: 14px;
    height: 14px;
    cursor: nwse-resize;
    background: repeating-linear-gradient(
      135deg,
      var(--color-text-primary, #12121a) 0 2px,
      transparent 2px 4px
    );
  }
</style>
