<svelte:options runes={true} />

<script lang="ts">
  /** `data-*` attributes forwarded to the native `<select>`. */
  type DataAttributes = { [key: `data-${string}`]: string | number | boolean | null | undefined };

  let {
    value = $bindable(""),
    label = "",
    options = [],
    /**
     * Hidden prompt option shown while `value` is `""`. Pass `null` (or `""`)
     * to render only `options`; `value` should then match one of them. It is
     * also skipped when `options` contains its own `""` option.
     */
    placeholder = "Select an option...",
    error = "",
    disabled = false,
    /** Forwarded to the native `<select id>`; auto-generated when omitted. */
    id = "",
    /** Accessible name when no visible `label` is rendered (e.g. list rows). */
    ariaLabel = "",
    onchange,
    /** `data-*` attributes forwarded to the native `<select>`. */
    ...rest
  }: {
    value?: string;
    label?: string;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string | null;
    error?: string;
    disabled?: boolean;
    id?: string;
    ariaLabel?: string;
    onchange?: (e: Event) => void;
  } & DataAttributes = $props();

  const fallbackId = `cy-select-${Math.random().toString(36).slice(2, 9)}`;
  let inputId = $derived(id || fallbackId);

  // An explicit `""` option already represents the empty value; a second,
  // hidden placeholder with the same value would be the one shown as checked.
  let showPlaceholder = $derived(!!placeholder && !options.some((opt) => opt.value === ""));
</script>

<div class="cy-select" class:cy-select--error={!!error} class:cy-select--disabled={disabled}>
  {#if label}
    <label class="cy-select__label" for={inputId}>{label}</label>
  {/if}

  <div class="cy-select__wrapper">
    <select
      {...rest}
      class="cy-select__field"
      id={inputId}
      bind:value
      {disabled}
      {onchange}
      aria-label={!label && ariaLabel ? ariaLabel : undefined}
      aria-invalid={!!error}
      aria-describedby={error ? `${inputId}-error` : undefined}
    >
      {#if showPlaceholder}
        <option value="" disabled hidden>{placeholder}</option>
      {/if}
      {#each options as opt (opt.value)}
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
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    font-weight: var(--input-label-weight);
    color: var(--input-label);
    letter-spacing: var(--input-label-letter-spacing);
    text-transform: var(--input-label-transform);
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
    border: var(--border-width) var(--border-style) var(--input-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-inset);
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
    box-shadow: var(--shadow-inset), var(--shadow-glow-cyan);
  }

  .cy-select--error .cy-select__field {
    border-color: var(--input-border-error);
  }

  .cy-select--error .cy-select__field:focus {
    border-color: var(--input-border-error);
    box-shadow: var(--shadow-inset), var(--shadow-glow-red);
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
