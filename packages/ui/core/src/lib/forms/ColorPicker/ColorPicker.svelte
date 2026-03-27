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
  let nativeInput: HTMLInputElement;

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
    <label class="cy-color-picker__label">{label}</label>
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
    color: var(--input-label, rgba(240, 240, 255, 0.7));
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
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: #12121a;
    cursor: pointer;
    padding: 3px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cy-color-picker__swatch:hover {
    border-color: rgba(0, 255, 65, 0.4);
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.15);
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
    color: var(--input-text, rgba(240, 240, 255, 0.9));
    background: var(--input-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--input-border, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-md, 6px);
    padding: 6px 10px;
    width: 100px;
    outline: none;
    transition: border-color 0.15s ease;
    text-transform: uppercase;
  }

  .cy-color-picker__hex-display:focus {
    border-color: var(--input-border-focus, rgba(0, 212, 255, 0.5));
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.15);
  }

  .cy-color-picker__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    z-index: 100;
    background: #12121a;
    border: 1px solid rgba(255, 255, 255, 0.1);
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
    border-color: rgba(255, 255, 255, 0.4);
  }

  .cy-color-picker__preset--active {
    border-color: #ffffff;
    box-shadow: 0 0 12px var(--preset-color);
  }

  .cy-color-picker__custom-row {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .cy-color-picker__hex-input {
    flex: 1;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.8125rem;
    color: rgba(240, 240, 255, 0.9);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 6px 8px;
    outline: none;
    text-transform: uppercase;
  }

  .cy-color-picker__hex-input:focus {
    border-color: rgba(0, 212, 255, 0.5);
  }

  .cy-color-picker__custom-btn {
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.75rem;
    color: #00ff41;
    background: rgba(0, 255, 65, 0.08);
    border: 1px solid rgba(0, 255, 65, 0.2);
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-color-picker__custom-btn:hover {
    background: rgba(0, 255, 65, 0.15);
    border-color: rgba(0, 255, 65, 0.4);
  }

  .cy-color-picker__native {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }
</style>
