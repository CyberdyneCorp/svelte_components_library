<svelte:options runes={true} />

<script lang="ts">
  let {
    checked = $bindable(false),
    label = "",
    disabled = false,
    onLabel = "ON",
    offLabel = "OFF",
    onChange,
    ariaLabel,
  }: {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
    onLabel?: string;
    offLabel?: string;
    onChange?: (checked: boolean) => void;
    ariaLabel?: string;
  } = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onChange?.(checked);
  }
</script>

<label class="cy-ptog" class:cy-ptog--disabled={disabled}>
  <button
    type="button"
    class="cy-ptog__switch"
    class:cy-ptog__switch--on={checked}
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel ?? label}
    {disabled}
    onclick={toggle}
  >
    <span class="cy-ptog__knob"></span>
    <span class="cy-ptog__state">{checked ? onLabel : offLabel}</span>
  </button>
  {#if label}<span class="cy-ptog__label">{label}</span>{/if}
</label>

<style>
  .cy-ptog { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); font-size: 0.85rem; }
  .cy-ptog--disabled { opacity: 0.5; }
  .cy-ptog__switch { position: relative; width: 60px; height: 24px; background: var(--color-surface-raised, #f5f5fa); border: 2px solid var(--color-text-primary, #12121a); cursor: pointer; padding: 0; display: flex; align-items: center; font: inherit; }
  .cy-ptog__switch:disabled { cursor: not-allowed; }
  .cy-ptog__knob { position: absolute; left: 2px; top: 1px; width: 16px; height: 16px; background: var(--color-text-primary, #12121a); transition: left 120ms ease; }
  .cy-ptog__switch--on .cy-ptog__knob { left: 38px; background: var(--color-action-brand-default, #00b32d); }
  .cy-ptog__state { margin-left: 22px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; }
</style>
