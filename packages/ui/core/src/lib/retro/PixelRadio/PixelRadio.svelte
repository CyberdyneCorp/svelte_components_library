<svelte:options runes={true} />

<script lang="ts">
  import type { PixelRadioOption } from "./types.js";

  let {
    name,
    options = [],
    value = $bindable(""),
    legend,
    onChange,
  }: {
    name: string;
    options: PixelRadioOption[];
    value?: string;
    legend?: string;
    onChange?: (value: string) => void;
  } = $props();

  function select(v: string, disabled?: boolean) {
    if (disabled) return;
    value = v;
    onChange?.(v);
  }
</script>

<fieldset class="cy-pradio">
  {#if legend}<legend class="cy-pradio__legend">{legend}</legend>{/if}
  {#each options as opt (opt.value)}
    <label class="cy-pradio__item" class:cy-pradio__item--disabled={opt.disabled}>
      <input
        type="radio"
        class="cy-pradio__input"
        {name}
        value={opt.value}
        checked={value === opt.value}
        disabled={opt.disabled}
        onchange={() => select(opt.value, opt.disabled)}
      />
      <span class="cy-pradio__box" aria-hidden="true">
        {#if value === opt.value}<span class="cy-pradio__dot"></span>{/if}
      </span>
      <span class="cy-pradio__label">{opt.label}</span>
    </label>
  {/each}
</fieldset>

<style>
  .cy-pradio { border: 0; padding: 0; margin: 0; font-family: var(--font-body, monospace); color: var(--color-text-primary, #12121a); display: flex; flex-direction: column; gap: 6px; }
  .cy-pradio__legend { font-weight: 700; margin-bottom: 4px; font-size: 0.85rem; }
  .cy-pradio__item { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem; }
  .cy-pradio__item--disabled { opacity: 0.5; cursor: not-allowed; }
  .cy-pradio__input { position: absolute; opacity: 0; pointer-events: none; }
  .cy-pradio__box { display: inline-flex; width: 18px; height: 18px; border: 2px solid var(--color-text-primary, #12121a); background: var(--color-surface-default, #fff); align-items: center; justify-content: center; }
  .cy-pradio__dot { width: 8px; height: 8px; background: var(--color-action-brand-default, #00b32d); }
  .cy-pradio__input:focus-visible + .cy-pradio__box { outline: 2px solid var(--color-border-focus, #00d4ff); }
</style>
