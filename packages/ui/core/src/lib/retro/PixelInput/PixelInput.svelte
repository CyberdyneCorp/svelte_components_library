<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    label = "",
    placeholder = "",
    type = "text",
    disabled = false,
    readonly = false,
    required = false,
    error = "",
    name,
    id,
    ariaLabel,
    onInput,
    onChange,
  }: {
    value?: string;
    label?: string;
    placeholder?: string;
    type?: "text" | "email" | "password" | "number" | "url" | "search";
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    error?: string;
    name?: string;
    id?: string;
    ariaLabel?: string;
    onInput?: (value: string) => void;
    onChange?: (value: string) => void;
  } = $props();

  const autoId = `cy-pinput-${Math.random().toString(36).slice(2, 9)}`;
  const inputId = $derived(id ?? autoId);

  function handleInput(e: Event) {
    value = (e.target as HTMLInputElement).value;
    onInput?.(value);
  }

  function handleChange(e: Event) {
    onChange?.((e.target as HTMLInputElement).value);
  }
</script>

<div class="cy-pinput" class:cy-pinput--err={!!error}>
  {#if label}
    <label class="cy-pinput__label" for={inputId}>
      {label}{#if required}<span class="cy-pinput__req" aria-hidden="true"> *</span>{/if}
    </label>
  {/if}
  <input
    id={inputId}
    class="cy-pinput__field"
    {type}
    {value}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    {name}
    aria-label={ariaLabel}
    aria-invalid={!!error}
    aria-describedby={error ? `${inputId}-err` : undefined}
    oninput={handleInput}
    onchange={handleChange}
  />
  {#if error}
    <span class="cy-pinput__err-msg" id="{inputId}-err">{error}</span>
  {/if}
</div>

<style>
  .cy-pinput { display: flex; flex-direction: column; gap: 4px; font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); }
  .cy-pinput__label { font-size: 0.8rem; font-weight: 700; }
  .cy-pinput__req { color: var(--color-state-error, #ff4444); }
  .cy-pinput__field { padding: 6px 10px; border: 2px solid var(--color-text-primary, #12121a); background: var(--color-surface-default, #fff); color: inherit; font: inherit; font-size: 0.85rem; outline: none; }
  .cy-pinput__field:focus { outline: 2px solid var(--color-border-focus, #00d4ff); outline-offset: -2px; }
  .cy-pinput__field:disabled { background: var(--color-surface-raised, #f5f5fa); cursor: not-allowed; }
  .cy-pinput--err .cy-pinput__field { border-color: var(--color-state-error, #ff4444); }
  .cy-pinput__err-msg { font-size: 0.7rem; color: var(--color-state-error, #ff4444); }
</style>
