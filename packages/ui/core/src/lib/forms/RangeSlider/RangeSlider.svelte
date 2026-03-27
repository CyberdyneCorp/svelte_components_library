<svelte:options runes={true} />

<script lang="ts">
  let {
    min = 0,
    max = 100,
    step = 1,
    low = $bindable(20),
    high = $bindable(80),
    label = "",
    showValues = true,
    disabled = false,
    unit = "",
  }: {
    min?: number;
    max?: number;
    step?: number;
    low?: number;
    high?: number;
    label?: string;
    showValues?: boolean;
    disabled?: boolean;
    unit?: string;
  } = $props();

  let trackEl: HTMLDivElement | undefined = $state(undefined);
  let dragging: "low" | "high" | null = $state(null);

  let lowPercent = $derived(((low - min) / (max - min)) * 100);
  let highPercent = $derived(((high - min) / (max - min)) * 100);

  function snap(val: number): number {
    const snapped = Math.round((val - min) / step) * step + min;
    return Math.min(max, Math.max(min, parseFloat(snapped.toFixed(10))));
  }

  function getValueFromEvent(e: MouseEvent | TouchEvent): number {
    if (!trackEl) return min;
    const rect = trackEl.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snap(min + pct * (max - min));
  }

  function handleTrackClick(e: MouseEvent) {
    if (disabled) return;
    const val = getValueFromEvent(e);
    const distLow = Math.abs(val - low);
    const distHigh = Math.abs(val - high);
    if (distLow <= distHigh) {
      low = Math.min(val, high);
    } else {
      high = Math.max(val, low);
    }
  }

  function startDrag(thumb: "low" | "high") {
    if (disabled) return;
    dragging = thumb;

    function onMove(e: MouseEvent | TouchEvent) {
      const val = getValueFromEvent(e);
      if (dragging === "low") {
        low = Math.min(val, high);
      } else if (dragging === "high") {
        high = Math.max(val, low);
      }
    }

    function onUp() {
      dragging = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onUp);
  }

  function handleKeydown(thumb: "low" | "high", e: KeyboardEvent) {
    if (disabled) return;
    let delta = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
    else return;
    e.preventDefault();
    if (thumb === "low") {
      low = snap(Math.min(low + delta, high));
    } else {
      high = snap(Math.max(high + delta, low));
    }
  }

  function formatVal(v: number): string {
    return unit ? `${v}${unit}` : `${v}`;
  }
</script>

<div class="cy-rs" class:cy-rs--disabled={disabled}>
  {#if label}
    <div class="cy-rs__header">
      <span class="cy-rs__label">{label}</span>
      {#if showValues}
        <span class="cy-rs__range-text">{formatVal(low)} — {formatVal(high)}</span>
      {/if}
    </div>
  {:else if showValues}
    <div class="cy-rs__header">
      <span class="cy-rs__range-text">{formatVal(low)} — {formatVal(high)}</span>
    </div>
  {/if}

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="cy-rs__track-container" bind:this={trackEl} onclick={handleTrackClick}>
    <div class="cy-rs__track"></div>
    <div
      class="cy-rs__fill"
      style="left: {lowPercent}%; width: {highPercent - lowPercent}%"
    ></div>
    <div
      class="cy-rs__thumb"
      style="left: {lowPercent}%"
      role="slider"
      tabindex={disabled ? -1 : 0}
      aria-label="Low value"
      aria-valuemin={min}
      aria-valuemax={high}
      aria-valuenow={low}
      onmousedown={(e) => { e.preventDefault(); startDrag("low"); }}
      ontouchstart={(e) => { e.preventDefault(); startDrag("low"); }}
      onkeydown={(e) => handleKeydown("low", e)}
    >
      {#if showValues}
        <span class="cy-rs__thumb-label">{formatVal(low)}</span>
      {/if}
    </div>
    <div
      class="cy-rs__thumb"
      style="left: {highPercent}%"
      role="slider"
      tabindex={disabled ? -1 : 0}
      aria-label="High value"
      aria-valuemin={low}
      aria-valuemax={max}
      aria-valuenow={high}
      onmousedown={(e) => { e.preventDefault(); startDrag("high"); }}
      ontouchstart={(e) => { e.preventDefault(); startDrag("high"); }}
      onkeydown={(e) => handleKeydown("high", e)}
    >
      {#if showValues}
        <span class="cy-rs__thumb-label">{formatVal(high)}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .cy-rs {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
    padding-top: var(--space-4);
  }

  .cy-rs__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cy-rs__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-rs__range-text {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-accent-green, #00ff41);
  }

  .cy-rs__track-container {
    position: relative;
    height: 32px;
    display: flex;
    align-items: center;
    cursor: pointer;
    touch-action: none;
  }

  .cy-rs--disabled .cy-rs__track-container {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-rs__track {
    position: absolute;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--input-border, rgba(255, 255, 255, 0.1));
    border-radius: 2px;
  }

  .cy-rs__fill {
    position: absolute;
    height: 4px;
    background: var(--color-accent-green, #00ff41);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
  }

  .cy-rs__thumb {
    position: absolute;
    width: 18px;
    height: 18px;
    background: var(--color-bg-elevated, #12121a);
    border: 2px solid var(--color-accent-green, #00ff41);
    border-radius: 50%;
    transform: translateX(-50%);
    cursor: grab;
    z-index: 2;
    transition: box-shadow var(--transition-default);
    outline: none;
  }

  .cy-rs__thumb:hover,
  .cy-rs__thumb:focus {
    box-shadow: 0 0 12px rgba(0, 255, 65, 0.4);
  }

  .cy-rs__thumb:active {
    cursor: grabbing;
  }

  .cy-rs__thumb-label {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--color-accent-green, #00ff41);
    white-space: nowrap;
    pointer-events: none;
  }

  .cy-rs--disabled .cy-rs__thumb {
    cursor: not-allowed;
  }
</style>
