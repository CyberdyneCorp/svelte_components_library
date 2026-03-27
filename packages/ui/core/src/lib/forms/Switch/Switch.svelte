<svelte:options runes={true} />

<script lang="ts">
  let {
    checked = $bindable(false),
    label = "",
    disabled = false,
  }: {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
  } = $props();

  let inputId = `cy-switch-${Math.random().toString(36).slice(2, 9)}`;

  function toggle() {
    if (!disabled) {
      checked = !checked;
    }
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  }
</script>

<div class="cy-switch" class:cy-switch--disabled={disabled}>
  <button
    class="cy-switch__track"
    class:cy-switch__track--on={checked}
    type="button"
    role="switch"
    id={inputId}
    aria-checked={checked}
    aria-label={label || undefined}
    {disabled}
    onclick={toggle}
    {onkeydown}
  >
    <span class="cy-switch__thumb" class:cy-switch__thumb--on={checked}></span>
  </button>

  {#if label}
    <label class="cy-switch__label" for={inputId}>{label}</label>
  {/if}
</div>

<style>
  .cy-switch {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
  }

  .cy-switch--disabled {
    opacity: 0.5;
  }

  .cy-switch__track {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--primitive-grey-40);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-pill);
    cursor: pointer;
    padding: 0;
    transition: all var(--transition-default);
    flex-shrink: 0;
    outline: none;
  }

  .cy-switch__track--on {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
  }

  .cy-switch__track:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-switch__track:hover:not(:disabled) {
    border-color: var(--color-border-strong);
  }

  .cy-switch__track:disabled {
    cursor: not-allowed;
  }

  .cy-switch__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background: var(--color-text-primary);
    border-radius: 50%;
    transition: transform var(--transition-default);
  }

  .cy-switch__thumb--on {
    transform: translateX(20px);
    background: var(--color-action-brand-text);
  }

  .cy-switch__label {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    cursor: pointer;
    user-select: none;
  }

  .cy-switch--disabled .cy-switch__label {
    cursor: not-allowed;
  }
</style>
