<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    open = $bindable(false),
    title = "",
    size = "md",
    children,
    footer,
  }: {
    open: boolean;
    title?: string;
    size?: "sm" | "md" | "lg";
    children?: Snippet;
    footer?: Snippet;
  } = $props();

  let modalEl: HTMLDivElement | undefined = $state();

  function close() {
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      close();
    }
    if (e.key === "Tab" && modalEl) {
      const focusable = modalEl.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  $effect(() => {
    if (open && modalEl) {
      const closeBtn = modalEl.querySelector<HTMLElement>(".cy-modal__close");
      closeBtn?.focus();
    }
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="cy-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onkeydown={handleKeydown} onclick={handleBackdropClick}>
    <div class="cy-modal cy-modal--{size}" bind:this={modalEl}>
      <div class="cy-modal__header">
        <h2 class="cy-modal__title" id="modal-title">{title}</h2>
        <button class="cy-modal__close" onclick={close} aria-label="Close modal">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      {#if children}
        <div class="cy-modal__body">
          {@render children()}
        </div>
      {/if}
      {#if footer}
        <div class="cy-modal__footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .cy-modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-overlay);
    backdrop-filter: blur(4px);
    z-index: 1000;
    animation: cy-overlay-in 150ms ease;
  }

  .cy-modal {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    margin: var(--space-4);
    max-height: calc(100vh - 4rem);
    display: flex;
    flex-direction: column;
    animation: cy-modal-in 200ms ease;
  }

  .cy-modal--sm { width: 100%; max-width: 400px; }
  .cy-modal--md { width: 100%; max-width: 560px; }
  .cy-modal--lg { width: 100%; max-width: 720px; }

  .cy-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .cy-modal__title {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .cy-modal__close {
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

  .cy-modal__close:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-modal__body {
    padding: var(--space-5);
    overflow-y: auto;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .cy-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    border-top: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  @keyframes cy-overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes cy-modal-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
