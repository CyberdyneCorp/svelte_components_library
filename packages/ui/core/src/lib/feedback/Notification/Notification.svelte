<svelte:options runes={true} />

<script lang="ts">
  let {
    variant = "info",
    message = "",
    duration = 5000,
    onclose,
  }: {
    variant?: "success" | "warning" | "error" | "info";
    message?: string;
    duration?: number;
    onclose?: () => void;
  } = $props();

  let visible = $state(true);
  let leaving = $state(false);

  const icons: Record<string, string> = {
    success: "M5 13l4 4L19 7",
    warning: "M12 9v4m0 4h.01M12 3L2 21h20L12 3z",
    error: "M6 6l12 12M18 6L6 18",
    info: "M12 16v-4m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z",
  };

  function dismiss() {
    leaving = true;
    setTimeout(() => {
      visible = false;
      onclose?.();
    }, 200);
  }

  $effect(() => {
    if (duration > 0) {
      const timer = setTimeout(dismiss, duration);
      return () => clearTimeout(timer);
    }
  });
</script>

{#if visible}
  <div class="cy-notification cy-notification--{variant}" class:cy-notification--leaving={leaving} role="status">
    <svg class="cy-notification__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d={icons[variant]} />
    </svg>
    <span class="cy-notification__message">{message}</span>
    <button class="cy-notification__close" onclick={dismiss} aria-label="Close notification">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
{/if}

<style>
  .cy-notification {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    font-family: var(--font-body);
    font-size: 0.8125rem;
    box-shadow: var(--shadow-md);
    min-width: 280px;
    max-width: 400px;
    animation: cy-slide-in 200ms ease;
  }

  .cy-notification--leaving {
    animation: cy-slide-out 200ms ease forwards;
  }

  .cy-notification--success {
    background: var(--color-surface-default);
    border-color: rgba(0, 255, 65, 0.2);
    color: var(--color-state-success);
  }

  .cy-notification--warning {
    background: var(--color-surface-default);
    border-color: rgba(255, 184, 0, 0.2);
    color: var(--color-state-warning);
  }

  .cy-notification--error {
    background: var(--color-surface-default);
    border-color: rgba(255, 68, 68, 0.2);
    color: var(--color-state-error);
  }

  .cy-notification--info {
    background: var(--color-surface-default);
    border-color: rgba(0, 212, 255, 0.2);
    color: var(--color-state-info);
  }

  .cy-notification__icon {
    flex-shrink: 0;
  }

  .cy-notification__message {
    flex: 1;
    color: var(--color-text-primary);
  }

  .cy-notification__close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: var(--radius-xs);
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .cy-notification__close:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  @keyframes cy-slide-in {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes cy-slide-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
</style>
