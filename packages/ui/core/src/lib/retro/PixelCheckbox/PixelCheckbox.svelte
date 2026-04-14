<svelte:options runes={true} />

<script lang="ts">
  let {
    checked = $bindable(false),
    label = "",
    disabled = false,
    name,
    value,
    onChange,
  }: {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
    name?: string;
    value?: string;
    onChange?: (checked: boolean) => void;
  } = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onChange?.(checked);
  }
</script>

<label class="cy-pchk" class:cy-pchk--disabled={disabled}>
  <input
    type="checkbox"
    class="cy-pchk__input"
    checked={checked}
    {disabled}
    {name}
    {value}
    onchange={toggle}
  />
  <span class="cy-pchk__box" aria-hidden="true">{checked ? "✓" : ""}</span>
  {#if label}<span class="cy-pchk__label">{label}</span>{/if}
</label>

<style>
  .cy-pchk { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); font-size: 0.85rem; user-select: none; }
  .cy-pchk--disabled { opacity: 0.5; cursor: not-allowed; }
  .cy-pchk__input { position: absolute; opacity: 0; pointer-events: none; }
  .cy-pchk__box { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: 2px solid var(--color-text-primary, #12121a); background: var(--color-surface-default, #fff); font-weight: 700; line-height: 1; color: var(--color-action-brand-default, #00b32d); }
  .cy-pchk__input:focus-visible + .cy-pchk__box { outline: 2px solid var(--color-border-focus, #00d4ff); }
</style>
