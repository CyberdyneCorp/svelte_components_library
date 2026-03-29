<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable("#00ff41"),
    label = "",
    presets = ["#00ff41", "#00d4ff", "#a855f7", "#ff4444", "#ffb800", "#00cc99", "#ff6b9d", "#f0f0ff"],
    disabled = false,
    showInput = true,
    onchange,
  }: {
    value?: string;
    label?: string;
    presets?: string[];
    disabled?: boolean;
    showInput?: boolean;
    onchange?: (color: string) => void;
  } = $props();

  let open = $state(false);
  let dropdownEl: HTMLDivElement;
  let nativeInput = $state<HTMLInputElement | null>(null);

  function toggle() {
    if (disabled) return;
    open = !open;
  }

  function selectColor(color: string) {
    value = color;
    onchange?.(color);
    open = false;
  }

  function handleHexInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let v = input.value.trim();
    if (!v.startsWith("#")) v = "#" + v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      value = v;
      onchange?.(v);
    }
  }

  function handleNativeChange(e: Event) {
    const input = e.target as HTMLInputElement;
    value = input.value;
    onchange?.(input.value);
  }

  function openNativePicker() {
    nativeInput?.click();
  }

  function handleClickOutside(e: MouseEvent) {
    if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
      open = false;
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  });
</script>

<div class="cy-color-picker" class:cy-color-picker--disabled={disabled} bind:this={dropdownEl}>
  {#if label}
    <label class="cy-color-picker__label" for="cy-color-picker-input">{label}</label>
  {/if}

  <div class="cy-color-picker__trigger-row">
    <button
      class="cy-color-picker__swatch"
      style="--swatch-color: {value};"
      onclick={toggle}
      {disabled}
      type="button"
      aria-label="Pick color"
    >
      <span class="cy-color-picker__swatch-circle"></span>
    </button>

    {#if showInput}
      <input
        class="cy-color-picker__hex-display"
        id="cy-color-picker-input"
        type="text"
        value={value}
        oninput={handleHexInput}
        {disabled}
        maxlength="7"
        spellcheck="false"
      />
    {/if}
  </div>

  {#if open}
    <div class="cy-color-picker__dropdown">
      <div class="cy-color-picker__presets">
        {#each presets as color}
          <button
            class="cy-color-picker__preset"
            class:cy-color-picker__preset--active={color.toLowerCase() === value.toLowerCase()}
            style="--preset-color: {color};"
            onclick={() => selectColor(color)}
            type="button"
            aria-label="Select {color}"
          ></button>
        {/each}
      </div>

      {#if showInput}
        <div class="cy-color-picker__custom-row">
          <input
            class="cy-color-picker__hex-input"
            type="text"
            value={value}
            oninput={handleHexInput}
            maxlength="7"
            placeholder="#000000"
            spellcheck="false"
          />
          <button class="cy-color-picker__custom-btn" onclick={openNativePicker} type="button">
            Custom
          </button>
        </div>
      {/if}

      <input
        bind:this={nativeInput}
        type="color"
        class="cy-color-picker__native"
        value={value}
        oninput={handleNativeChange}
      />
    </div>
  {/if}
</div>

<style>
  .cy-color-picker {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    gap: var(--space-1, 4px);
  }

  .cy-color-picker--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cy-color-picker__label {
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-color-picker__trigger-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cy-color-picker__swatch {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--color-border-default);
    background: var(--color-surface-default);
    cursor: pointer;
    padding: 3px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cy-color-picker__swatch:hover {
    border-color: var(--color-action-brand-default);
    box-shadow: 0 0 10px var(--color-state-success-bg);
  }

  .cy-color-picker__swatch-circle {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--swatch-color);
    box-shadow: 0 0 8px var(--swatch-color);
  }

  .cy-color-picker__hex-display {
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.875rem;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md, 6px);
    padding: 6px 10px;
    width: 100px;
    outline: none;
    transition: border-color 0.15s ease;
    text-transform: uppercase;
  }

  .cy-color-picker__hex-display:focus {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 8px var(--color-state-info-bg);
  }

  .cy-color-picker__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    z-index: 100;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: 8px;
    padding: 12px;
    min-width: 220px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  }

  .cy-color-picker__presets {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .cy-color-picker__preset {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: var(--preset-color);
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    padding: 0;
    box-shadow: 0 0 6px color-mix(in srgb, var(--preset-color) 40%, transparent);
  }

  .cy-color-picker__preset:hover {
    transform: scale(1.15);
    border-color: var(--color-border-default);
  }

  .cy-color-picker__preset--active {
    border-color: var(--color-text-primary);
    box-shadow: 0 0 12px var(--preset-color);
  }

  .cy-color-picker__custom-row {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid var(--color-border-subtle);
  }

  .cy-color-picker__hex-input {
    flex: 1;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.8125rem;
    color: var(--color-text-primary);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    padding: 6px 8px;
    outline: none;
    text-transform: uppercase;
  }

  .cy-color-picker__hex-input:focus {
    border-color: var(--color-action-secondary-default);
  }

  .cy-color-picker__custom-btn {
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.75rem;
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
    border: 1px solid var(--color-border-subtle);
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-color-picker__custom-btn:hover {
    background: var(--color-state-success-bg);
    border-color: var(--color-action-brand-default);
  }

  .cy-color-picker__native {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }
</style>
