<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let {
    open = $bindable(true),
    title,
    message,
    variant = "info",
    durationMs = 0,
    dismissible = true,
    onDismiss,
  }: {
    open?: boolean;
    title?: string;
    message: string;
    variant?: "info" | "success" | "warning" | "error";
    durationMs?: number;
    dismissible?: boolean;
    onDismiss?: () => void;
  } = $props();

  let timer: ReturnType<typeof setTimeout> | undefined;

  function dismiss() {
    open = false;
    onDismiss?.();
  }

  onMount(() => {
    if (durationMs > 0) timer = setTimeout(dismiss, durationMs);
  });
  onDestroy(() => { if (timer) clearTimeout(timer); });

  const icons = { info: "ℹ", success: "✓", warning: "⚠", error: "✕" };
</script>

{#if open}
  <div class="cy-pnotif cy-pnotif--{variant}" role="status" aria-live="polite">
    <span class="cy-pnotif__icon" aria-hidden="true">{icons[variant]}</span>
    <div class="cy-pnotif__body">
      {#if title}<div class="cy-pnotif__title">{title}</div>{/if}
      <div class="cy-pnotif__msg">{message}</div>
    </div>
    {#if dismissible}
      <button type="button" class="cy-pnotif__close" aria-label="Dismiss" onclick={dismiss}>×</button>
    {/if}
  </div>
{/if}

<style>
  .cy-pnotif { display: inline-flex; align-items: flex-start; gap: 10px; padding: 8px 12px; background: var(--color-surface-default, #fff); border: 2px solid var(--color-text-primary, #12121a); box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.4); font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); font-size: 0.8rem; min-width: 260px; max-width: 400px; }
  .cy-pnotif__icon { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: 2px solid var(--color-text-primary, #12121a); font-weight: 700; flex-shrink: 0; }
  .cy-pnotif--info .cy-pnotif__icon { background: var(--color-state-info-bg, rgba(0, 149, 179, 0.1)); color: var(--color-state-info, #00aacc); }
  .cy-pnotif--success .cy-pnotif__icon { background: var(--color-state-success-bg, rgba(0, 153, 38, 0.1)); color: var(--color-state-success, #00b32d); }
  .cy-pnotif--warning .cy-pnotif__icon { background: var(--color-state-warning-bg, rgba(179, 130, 0, 0.1)); color: var(--color-state-warning, #b38200); }
  .cy-pnotif--error .cy-pnotif__icon { background: var(--color-state-error-bg, rgba(204, 46, 46, 0.1)); color: var(--color-state-error, #ff4444); }
  .cy-pnotif__body { flex: 1; }
  .cy-pnotif__title { font-weight: 700; margin-bottom: 2px; }
  .cy-pnotif__close { background: transparent; border: 0; color: var(--color-text-tertiary, #6a6a7e); cursor: pointer; font-size: 1.1rem; line-height: 1; width: 22px; height: 22px; }
  .cy-pnotif__close:hover { color: var(--color-state-error, #ff4444); }
</style>
