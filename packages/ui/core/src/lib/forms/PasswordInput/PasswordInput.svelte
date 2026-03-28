<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    label = "",
    error = "",
    disabled = false,
    placeholder = "",
  }: {
    value?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
  } = $props();

  let showPassword = $state(false);
  let inputId = `cy-pw-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="cy-password" class:cy-password--error={!!error} class:cy-password--disabled={disabled}>
  {#if label}
    <label class="cy-password__label" for={inputId}>{label}</label>
  {/if}

  <div class="cy-password__wrapper">
    <input
      class="cy-password__field"
      type={showPassword ? "text" : "password"}
      id={inputId}
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
      aria-label={showPassword ? "Hide password" : "Show password"}
      onclick={() => (showPassword = !showPassword)}
      {disabled}
    >
      {#if showPassword}
        <!-- Eye-off icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      {:else}
        <!-- Eye icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      {/if}
    </button>
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
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-password__wrapper {
    position: relative;
    display: flex;
    align-items: center;
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
