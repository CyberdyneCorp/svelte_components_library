<svelte:options runes={true} />

<script lang="ts">
  type ToggleOption = {
    value: string;
    label: string;
    icon?: string;
  };

  let {
    options = [],
    value = $bindable(""),
    size = "md",
    disabled = false,
    onchange,
  }: {
    options?: ToggleOption[];
    value?: string;
    size?: "sm" | "md";
    disabled?: boolean;
    onchange?: (value: string) => void;
  } = $props();

  function select(optionValue: string) {
    if (disabled) return;
    value = optionValue;
    onchange?.(optionValue);
  }
</script>

<div
  class="cy-toggle-group cy-toggle-group--{size}"
  class:cy-toggle-group--disabled={disabled}
  role="radiogroup"
>
  {#each options as option, i}
    <button
      class="cy-toggle-group__btn"
      class:cy-toggle-group__btn--active={value === option.value}
      class:cy-toggle-group__btn--first={i === 0}
      class:cy-toggle-group__btn--last={i === options.length - 1}
      role="radio"
      aria-checked={value === option.value}
      {disabled}
      onclick={() => select(option.value)}
    >
      {#if option.icon}
        <span class="cy-toggle-group__icon">{option.icon}</span>
      {/if}
      <span class="cy-toggle-group__label">{option.label}</span>
    </button>
  {/each}
</div>

<style>
  .cy-toggle-group {
    display: inline-flex;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 9999px);
    background: var(--color-bg-primary);
    overflow: hidden;
  }

  .cy-toggle-group--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cy-toggle-group__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-family: var(--font-body, system-ui, sans-serif);
    font-weight: var(--font-weight-medium, 500);
    transition: all 0.2s ease;
    position: relative;
    white-space: nowrap;
    outline: none;
  }

  .cy-toggle-group--md .cy-toggle-group__btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    height: 36px;
  }

  .cy-toggle-group--sm .cy-toggle-group__btn {
    padding: 0.25rem 0.75rem;
    font-size: 0.8125rem;
    height: 28px;
  }

  .cy-toggle-group__btn:not(:first-child) {
    border-left: 1px solid var(--color-border-default);
  }

  .cy-toggle-group__btn:hover:not(:disabled):not(.cy-toggle-group__btn--active) {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
  }

  .cy-toggle-group__btn--active {
    background: var(--color-action-brand-default);
    color: var(--color-bg-primary);
    border-left-color: transparent !important;
  }

  .cy-toggle-group__btn--active + .cy-toggle-group__btn {
    border-left-color: transparent !important;
  }

  .cy-toggle-group__btn:focus-visible {
    outline: 2px solid var(--color-action-brand-default);
    outline-offset: -2px;
    z-index: 1;
  }

  .cy-toggle-group__btn--first {
    border-radius: var(--radius-lg, 9999px) 0 0 var(--radius-lg, 9999px);
  }

  .cy-toggle-group__btn--last {
    border-radius: 0 var(--radius-lg, 9999px) var(--radius-lg, 9999px) 0;
  }

  .cy-toggle-group__icon {
    font-size: 1em;
    line-height: 1;
  }
</style>
