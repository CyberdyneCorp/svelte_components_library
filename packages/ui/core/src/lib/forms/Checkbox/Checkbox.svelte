<svelte:options runes={true} />

<script lang="ts">
  let {
    checked = $bindable(false),
    label = "",
    disabled = false,
    error = "",
  }: {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
    error?: string;
  } = $props();

  let inputId = `cy-cb-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="cy-checkbox" class:cy-checkbox--error={!!error} class:cy-checkbox--disabled={disabled}>
  <label class="cy-checkbox__container" for={inputId}>
    <input
      class="cy-checkbox__input"
      type="checkbox"
      id={inputId}
      bind:checked
      {disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${inputId}-error` : undefined}
    />
    <span class="cy-checkbox__box" aria-hidden="true">
      {#if checked}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      {/if}
    </span>
    {#if label}
      <span class="cy-checkbox__label">{label}</span>
    {/if}
  </label>

  {#if error}
    <p class="cy-checkbox__error" id="{inputId}-error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-checkbox {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .cy-checkbox__container {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    user-select: none;
  }

  .cy-checkbox--disabled .cy-checkbox__container {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-checkbox__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .cy-checkbox__box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 1px solid var(--input-border);
    border-radius: var(--radius-xs);
    background: var(--input-bg);
    transition: all var(--transition-default);
    flex-shrink: 0;
  }

  .cy-checkbox__input:checked + .cy-checkbox__box {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    color: var(--color-action-brand-text);
  }

  .cy-checkbox__input:focus-visible + .cy-checkbox__box {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-checkbox__container:hover .cy-checkbox__box {
    border-color: var(--color-border-strong);
  }

  .cy-checkbox--error .cy-checkbox__box {
    border-color: var(--input-border-error);
  }

  .cy-checkbox__label {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .cy-checkbox__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
    padding-left: calc(20px + var(--space-2));
  }
</style>
