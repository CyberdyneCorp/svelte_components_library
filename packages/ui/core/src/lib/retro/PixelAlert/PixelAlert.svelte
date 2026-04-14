<svelte:options runes={true} />

<script lang="ts">
  let {
    open = $bindable(false),
    title = "Alert",
    message = "",
    variant = "info",
    confirmLabel = "OK",
    cancelLabel,
    onConfirm,
    onCancel,
  }: {
    open?: boolean;
    title?: string;
    message?: string;
    variant?: "info" | "success" | "warning" | "error";
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } = $props();

  function confirm() { onConfirm?.(); open = false; }
  function cancel() { onCancel?.(); open = false; }
  function onKey(e: KeyboardEvent) { if (e.key === "Escape") cancel(); if (e.key === "Enter") confirm(); }
  const icons = { info: "ℹ", success: "✓", warning: "⚠", error: "✕" };
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="cy-palert__backdrop" role="alertdialog" aria-modal="true" aria-labelledby="cy-palert-title" tabindex="-1" onkeydown={onKey}>
    <div class="cy-palert cy-palert--{variant}">
      <div class="cy-palert__header">
        <span class="cy-palert__icon" aria-hidden="true">{icons[variant]}</span>
        <h2 class="cy-palert__title" id="cy-palert-title">{title}</h2>
      </div>
      <p class="cy-palert__msg">{message}</p>
      <div class="cy-palert__actions">
        {#if cancelLabel}
          <button type="button" class="cy-palert__btn cy-palert__btn--cancel" onclick={cancel}>{cancelLabel}</button>
        {/if}
        <button type="button" class="cy-palert__btn cy-palert__btn--confirm" onclick={confirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .cy-palert__backdrop { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(10, 10, 15, 0.6); z-index: 1000; }
  .cy-palert { width: 100%; max-width: 380px; background: var(--color-surface-default, #fff); border: 2px solid var(--color-text-primary, #12121a); box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4); padding: 16px; font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); }
  .cy-palert__header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .cy-palert__title { margin: 0; font-size: 0.95rem; }
  .cy-palert__icon { font-size: 1.2rem; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: 2px solid var(--color-text-primary, #12121a); }
  .cy-palert--info .cy-palert__icon { background: var(--color-state-info-bg, rgba(0, 149, 179, 0.1)); }
  .cy-palert--success .cy-palert__icon { background: var(--color-state-success-bg, rgba(0, 153, 38, 0.1)); }
  .cy-palert--warning .cy-palert__icon { background: var(--color-state-warning-bg, rgba(179, 130, 0, 0.1)); }
  .cy-palert--error .cy-palert__icon { background: var(--color-state-error-bg, rgba(204, 46, 46, 0.1)); }
  .cy-palert__msg { font-size: 0.85rem; margin: 0 0 14px; }
  .cy-palert__actions { display: flex; justify-content: flex-end; gap: 8px; }
  .cy-palert__btn { padding: 5px 14px; border: 2px solid var(--color-text-primary, #12121a); cursor: pointer; font: inherit; font-weight: 700; }
  .cy-palert__btn--confirm { background: var(--color-action-brand-default, #00b32d); color: var(--color-action-brand-text, #fff); }
  .cy-palert__btn--cancel { background: var(--color-surface-default, #fff); color: var(--color-text-primary, #12121a); }
</style>
