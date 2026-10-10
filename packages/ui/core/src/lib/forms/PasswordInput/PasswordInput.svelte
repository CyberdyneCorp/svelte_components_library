<svelte:options runes={true} />

<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import Button from "../../primitives/Button/Button.svelte";

  let {
    value = $bindable(""),
    label = "",
    error = "",
    disabled = false,
    placeholder = "",
    id,
    name,
    autocomplete,
    showLabel = "Show password",
    hideLabel = "Hide password",
    generateLabel = "Generate",
    ongenerate,
  }: {
    /** Current password text; bindable. */
    value?: string;
    /** Visible label rendered above the field. */
    label?: string;
    /** Error message rendered below the field and announced via `role="alert"`. */
    error?: string;
    /** Disables the field, the visibility toggle and the generate button. */
    disabled?: boolean;
    /** Native placeholder. */
    placeholder?: string;
    /** Native `id` of the input; falls back to a generated one. */
    id?: string;
    /** Native `name` submitted with the form. */
    name?: string;
    /** Native `autocomplete`, e.g. `"current-password"` or `"new-password"`. */
    autocomplete?: HTMLInputAttributes["autocomplete"];
    /** Accessible name of the visibility toggle while the password is hidden (i18n). */
    showLabel?: string;
    /** Accessible name of the visibility toggle while the password is shown (i18n). */
    hideLabel?: string;
    /** Visible label of the generate button (i18n). */
    generateLabel?: string;
    /**
     * Application-supplied generator. When set, a generate button appears next
     * to the visibility toggle and clicking it sets `value` to the returned
     * string. The component never generates passwords itself.
     */
    ongenerate?: () => string;
  } = $props();

  let showPassword = $state(false);
  const generatedId = `cy-pw-${Math.random().toString(36).slice(2, 9)}`;
  let inputId = $derived(id || generatedId);

  function generate() {
    if (!ongenerate) return;
    value = ongenerate();
  }
</script>

<div class="cy-password" class:cy-password--error={!!error} class:cy-password--disabled={disabled}>
  {#if label}
    <label class="cy-password__label" for={inputId}>{label}</label>
  {/if}

  <div class="cy-password__wrapper">
    <div class="cy-password__control">
      <input
        class="cy-password__field"
        type={showPassword ? "text" : "password"}
        id={inputId}
        {name}
        {autocomplete}
        bind:value
        {placeholder}
        {disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      <button
        class="cy-password__toggle"
        type="button"
        tabindex="-1"
        aria-label={showPassword ? hideLabel : showLabel}
        onclick={() => (showPassword = !showPassword)}
        {disabled}
      >
        {#if showPassword}
          <!-- Eye-off icon -->
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
            />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        {:else}
          <!-- Eye icon -->
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        {/if}
      </button>
    </div>
    {#if ongenerate}
      <Button variant="ghost" size="sm" {disabled} onclick={generate}>
        {generateLabel}
      </Button>
    {/if}
  </div>

  {#if error}
    <p class="cy-password__error" id="{inputId}-error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-password {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-password__label {
    font-family: var(--input-label-font);
    font-size: var(--input-label-size);
    font-weight: var(--input-label-weight);
    color: var(--input-label);
    letter-spacing: var(--input-label-letter-spacing);
    text-transform: var(--input-label-transform);
  }

  .cy-password__wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .cy-password__control {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
  }

  .cy-password__field {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    padding-right: 2.75rem;
    height: 40px;
    width: 100%;
    outline: none;
    transition: all var(--transition-default);
  }

  .cy-password__field::placeholder {
    color: var(--input-placeholder);
  }

  .cy-password__field:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-password__field:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-password--error .cy-password__field {
    border-color: var(--input-border-error);
  }

  .cy-password--error .cy-password__field:focus {
    border-color: var(--input-border-error);
    box-shadow: var(--shadow-glow-red);
  }

  .cy-password__field:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-password__toggle {
    position: absolute;
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text-tertiary);
    cursor: pointer;
    padding: var(--space-1);
    border-radius: var(--radius-sm);
    transition: color var(--transition-default);
  }

  .cy-password__toggle:hover:not(:disabled) {
    color: var(--color-text-primary);
  }

  .cy-password__toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-password__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
