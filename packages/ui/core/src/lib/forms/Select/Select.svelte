<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    label = "",
    options = [],
    placeholder = "Select an option...",
    error = "",
    disabled = false,
  }: {
    value?: string;
    label?: string;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
  } = $props();

  let inputId = `cy-select-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="cy-select" class:cy-select--error={!!error} class:cy-select--disabled={disabled}>
  {#if label}
    <label class="cy-select__label" for={inputId}>{label}</label>
  {/if}

  <div class="cy-select__wrapper">
    <select
      class="cy-select__field"
      id={inputId}
      bind:value
      {disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${inputId}-error` : undefined}
    >
      {#if placeholder}
        <option value="" disabled selected hidden>{placeholder}</option>
      {/if}
      {#each options as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>

    <svg class="cy-select__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>

  {#if error}
    <p class="cy-select__error" id="{inputId}-error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-select {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-select__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-select__wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .cy-select__field {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    padding-right: 2.5rem;
    height: 40px;
    width: 100%;
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    transition: all var(--transition-default);
  }

  .cy-select__field:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-select__field:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-select--error .cy-select__field {
    border-color: var(--input-border-error);
  }

  .cy-select--error .cy-select__field:focus {
    border-color: var(--input-border-error);
    box-shadow: 0 0 12px rgba(255, 68, 68, 0.3);
  }

  .cy-select__field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-select__chevron {
    position: absolute;
    right: var(--space-3);
    color: var(--color-text-tertiary);
    pointer-events: none;
  }

  .cy-select__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }

  /* Style select options for dark theme */
  .cy-select__field option {
    background: var(--color-bg-elevated);
    color: var(--input-text);
  }
</style>
