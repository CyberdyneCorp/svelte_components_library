<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    label = "",
    placeholder = "",
    hint = "",
    error = "",
    disabled = false,
    required = false,
    type = "text",
    id = "",
  }: {
    value?: string;
    label?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    type?: "text" | "email" | "url" | "number";
    id?: string;
  } = $props();

  let inputId = $derived(id || `cy-input-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="cy-text-input" class:cy-text-input--error={!!error} class:cy-text-input--disabled={disabled}>
  {#if label}
    <label class="cy-text-input__label" for={inputId}>
      {label}
      {#if required}<span class="cy-text-input__required" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <input
    class="cy-text-input__field"
    {type}
    id={inputId}
    bind:value
    {placeholder}
    {disabled}
    {required}
    aria-invalid={!!error}
    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
  />

  {#if error}
    <p class="cy-text-input__error" id="{inputId}-error" role="alert">{error}</p>
  {:else if hint}
    <p class="cy-text-input__hint" id="{inputId}-hint">{hint}</p>
  {/if}
</div>

<style>
  .cy-text-input {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-text-input__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-text-input__required {
    color: var(--color-state-error);
    margin-left: 2px;
  }

  .cy-text-input__field {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    height: 40px;
    width: 100%;
    outline: none;
    transition: all var(--transition-default);
  }

  .cy-text-input__field::placeholder {
    color: var(--input-placeholder);
  }

  .cy-text-input__field:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-text-input__field:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-text-input--error .cy-text-input__field {
    border-color: var(--input-border-error);
  }

  .cy-text-input--error .cy-text-input__field:focus {
    border-color: var(--input-border-error);
    box-shadow: var(--shadow-glow-red);
  }

  .cy-text-input__field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-text-input__hint {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .cy-text-input__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
