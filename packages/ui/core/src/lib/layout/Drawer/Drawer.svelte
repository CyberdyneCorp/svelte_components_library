<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    open = $bindable(false),
    side = "right",
    width = "400px",
    title = "",
    children,
    footer,
  }: {
    open: boolean;
    side?: "left" | "right";
    width?: string;
    title?: string;
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  function close() {
    open = false;
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      close();
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="cy-drawer-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="drawer-title"
    tabindex="-1"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
  >
    <div
      class="cy-drawer cy-drawer--{side}"
      style:width={width}
    >
      <div class="cy-drawer__header">
        <h2 class="cy-drawer__title" id="drawer-title">{title}</h2>
        <button class="cy-drawer__close" onclick={close} aria-label="Close drawer">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="cy-drawer__body">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if footer}
        <div class="cy-drawer__footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .cy-drawer-overlay {
    position: fixed;
    inset: 0;
    background: var(--color-bg-overlay);
    backdrop-filter: blur(4px);
    z-index: 1000;
    animation: cy-overlay-fade-in 150ms ease;
  }

  .cy-drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    box-shadow: var(--shadow-lg);
    max-width: 100vw;
  }

  .cy-drawer--right {
    right: 0;
    border-left: 1px solid var(--color-border-default);
    animation: cy-drawer-slide-right 250ms ease;
  }

  .cy-drawer--left {
    left: 0;
    border-right: 1px solid var(--color-border-default);
    animation: cy-drawer-slide-left 250ms ease;
  }

  .cy-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .cy-drawer__title {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .cy-drawer__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .cy-drawer__close:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-drawer__body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-5);
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .cy-drawer__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    border-top: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  @keyframes cy-overlay-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes cy-drawer-slide-right {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes cy-drawer-slide-left {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
</style>
