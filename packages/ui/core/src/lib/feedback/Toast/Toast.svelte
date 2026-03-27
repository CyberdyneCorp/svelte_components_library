<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet, setContext, onMount } from "svelte";

  let {
    children,
  }: {
    children?: Snippet;
  } = $props();

  type ToastVariant = "success" | "warning" | "error" | "info";

  interface ToastItem {
    id: number;
    variant: ToastVariant;
    message: string;
    action?: { label: string; onclick: () => void };
    dismissing?: boolean;
  }

  let toasts: ToastItem[] = $state([]);
  let nextId = 0;

  function addToast(variant: ToastVariant, message: string, action?: { label: string; onclick: () => void }) {
    const id = nextId++;
    toasts.push({ id, variant, message, action });
    setTimeout(() => dismiss(id), 5000);
  }

  function dismiss(id: number) {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx === -1) return;
    toasts[idx].dismissing = true;
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
    }, 300);
  }

  const toastApi = {
    success: (msg: string, action?: { label: string; onclick: () => void }) => addToast("success", msg, action),
    warning: (msg: string, action?: { label: string; onclick: () => void }) => addToast("warning", msg, action),
    error: (msg: string, action?: { label: string; onclick: () => void }) => addToast("error", msg, action),
    info: (msg: string, action?: { label: string; onclick: () => void }) => addToast("info", msg, action),
    dismiss,
  };

  setContext("toast", toastApi);

  const iconPaths: Record<ToastVariant, string> = {
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    warning: "M12 9v2m0 4h.01M12 3l9.66 16.5H2.34L12 3z",
    error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };
</script>

{#if children}
  {@render children()}
{/if}

<div class="cy-toast-container" aria-live="polite">
  {#each toasts as toast (toast.id)}
    <div
      class="cy-toast cy-toast--{toast.variant}"
      class:cy-toast--dismissing={toast.dismissing}
      role="alert"
    >
      <svg class="cy-toast__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d={iconPaths[toast.variant]} />
      </svg>
      <span class="cy-toast__message">{toast.message}</span>
      {#if toast.action}
        <button class="cy-toast__action" onclick={() => { toast.action?.onclick(); dismiss(toast.id); }}>
          {toast.action.label}
        </button>
      {/if}
      <button class="cy-toast__close" onclick={() => dismiss(toast.id)} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .cy-toast-container {
    position: fixed;
    top: var(--space-4);
    right: var(--space-4);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-width: 400px;
  }

  .cy-toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    box-shadow: var(--shadow-lg);
    animation: cy-toast-in 300ms ease forwards;
  }

  .cy-toast--dismissing {
    animation: cy-toast-out 300ms ease forwards;
  }

  .cy-toast--success {
    border-left: 3px solid #00ff41;
  }
  .cy-toast--success .cy-toast__icon {
    color: #00ff41;
  }

  .cy-toast--warning {
    border-left: 3px solid #ffaa00;
  }
  .cy-toast--warning .cy-toast__icon {
    color: #ffaa00;
  }

  .cy-toast--error {
    border-left: 3px solid #ff4444;
  }
  .cy-toast--error .cy-toast__icon {
    color: #ff4444;
  }

  .cy-toast--info {
    border-left: 3px solid #00d4ff;
  }
  .cy-toast--info .cy-toast__icon {
    color: #00d4ff;
  }

  .cy-toast__message {
    flex: 1;
    line-height: 1.4;
  }

  .cy-toast__action {
    background: none;
    border: none;
    color: #00ff41;
    font-family: var(--font-body);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
    white-space: nowrap;
  }

  .cy-toast__action:hover {
    background: rgba(0, 255, 65, 0.1);
  }

  .cy-toast__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }

  .cy-toast__close:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  @keyframes cy-toast-in {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes cy-toast-out {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
</style>
