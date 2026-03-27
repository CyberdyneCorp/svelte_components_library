<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    open = $bindable(false),
    title = "",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    onconfirm,
    oncancel,
    children,
  }: {
    open: boolean;
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "danger";
    onconfirm?: () => void;
    oncancel?: () => void;
    children?: Snippet;
  } = $props();

  let dialogEl: HTMLDivElement | undefined = $state();

  function handleCancel() {
    open = false;
    oncancel?.();
  }

  function handleConfirm() {
    open = false;
    onconfirm?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      handleCancel();
    }
    if (e.key === "Tab" && dialogEl) {
      const focusable = dialogEl.querySelectorAll<HTMLElement>(
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
      handleCancel();
    }
  }

  $effect(() => {
    if (open && dialogEl) {
      const firstBtn = dialogEl.querySelector<HTMLElement>("button");
      firstBtn?.focus();
    }
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="cy-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onkeydown={handleKeydown} onclick={handleBackdropClick}>
    <div class="cy-dialog" bind:this={dialogEl}>
      <div class="cy-dialog__header">
        <h2 class="cy-dialog__title" id="dialog-title">{title}</h2>
      </div>
      {#if children}
        <div class="cy-dialog__body">
          {@render children()}
        </div>
      {/if}
      <div class="cy-dialog__footer">
        <button class="cy-dialog__btn cy-dialog__btn--cancel" onclick={handleCancel}>
          {cancelLabel}
        </button>
        <button class="cy-dialog__btn cy-dialog__btn--confirm cy-dialog__btn--{variant}" onclick={handleConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .cy-dialog-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-overlay);
    backdrop-filter: blur(4px);
    z-index: 1000;
    animation: cy-fade-in 150ms ease;
  }

  .cy-dialog {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 480px;
    margin: var(--space-4);
    animation: cy-scale-in 200ms ease;
  }

  .cy-dialog__header {
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-dialog__title {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .cy-dialog__body {
    padding: var(--space-4) var(--space-5);
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .cy-dialog__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    border-top: 1px solid var(--color-border-subtle);
  }

  .cy-dialog__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-default);
    border: 1px solid transparent;
  }

  .cy-dialog__btn--cancel {
    background: var(--color-surface-raised);
    color: var(--color-text-secondary);
    border-color: var(--color-border-default);
  }

  .cy-dialog__btn--cancel:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .cy-dialog__btn--confirm.cy-dialog__btn--default {
    background: var(--btn-brand-bg);
    color: var(--btn-brand-text);
  }

  .cy-dialog__btn--confirm.cy-dialog__btn--default:hover {
    background: var(--btn-brand-bg-hover);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-dialog__btn--confirm.cy-dialog__btn--danger {
    background: var(--btn-danger-bg);
    color: var(--btn-danger-text);
  }

  .cy-dialog__btn--confirm.cy-dialog__btn--danger:hover {
    background: var(--btn-danger-bg-hover);
    box-shadow: 0 0 12px rgba(255, 68, 68, 0.3);
  }

  @keyframes cy-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes cy-scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
