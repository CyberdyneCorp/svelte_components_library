<svelte:options runes={true} />

<script lang="ts">
  import { type Snippet } from "svelte";

  let {
    variant = "info",
    title = "",
    dismissible = false,
    ondismiss,
    children,
  }: {
    variant?: "success" | "warning" | "error" | "info";
    title?: string;
    dismissible?: boolean;
    ondismiss?: () => void;
    children?: Snippet;
  } = $props();

  let visible = $state(true);

  function dismiss() {
    visible = false;
    ondismiss?.();
  }
</script>

{#if visible}
  <div class="cy-alert cy-alert--{variant}" role="alert">
    <div class="cy-alert__content">
      {#if title}
        <div class="cy-alert__title">{title}</div>
      {/if}
      {#if children}
        <div class="cy-alert__body">
          {@render children()}
        </div>
      {/if}
    </div>
    {#if dismissible}
      <button class="cy-alert__dismiss" onclick={dismiss} aria-label="Dismiss alert">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    {/if}
  </div>
{/if}

<style>
  .cy-alert {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    border-left: 3px solid transparent;
    font-family: var(--font-body);
    animation: cy-fade-in 200ms ease;
  }

  .cy-alert--success {
    background: var(--color-state-success-bg);
    border-color: rgba(0, 255, 65, 0.15);
    border-left-color: var(--color-state-success);
  }

  .cy-alert--warning {
    background: var(--color-state-warning-bg);
    border-color: rgba(255, 184, 0, 0.15);
    border-left-color: var(--color-state-warning);
  }

  .cy-alert--error {
    background: var(--color-state-error-bg);
    border-color: rgba(255, 68, 68, 0.15);
    border-left-color: var(--color-state-error);
  }

  .cy-alert--info {
    background: var(--color-state-info-bg);
    border-color: rgba(0, 212, 255, 0.15);
    border-left-color: var(--color-state-info);
  }

  .cy-alert__content {
    flex: 1;
    min-width: 0;
  }

  .cy-alert__title {
    font-weight: var(--font-weight-semibold);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    margin-bottom: var(--space-1);
  }

  .cy-alert__body {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  .cy-alert__dismiss {
    flex-shrink: 0;
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
  }

  .cy-alert__dismiss:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  @keyframes cy-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
