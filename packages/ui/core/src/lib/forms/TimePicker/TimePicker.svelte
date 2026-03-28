<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    label = "",
    format = "24h",
    minuteStep = 5,
    disabled = false,
    error = "",
    onchange,
  }: {
    value?: string;
    label?: string;
    format?: "12h" | "24h";
    minuteStep?: number;
    disabled?: boolean;
    error?: string;
    onchange?: (value: string) => void;
  } = $props();

  let open = $state(false);
  let inputId = `cy-tp-${Math.random().toString(36).slice(2, 9)}`;
  let period = $state<"AM" | "PM">("AM");

  let hours = $derived.by(() => {
    const max = format === "12h" ? 12 : 23;
    const min = format === "12h" ? 1 : 0;
    const list: number[] = [];
    for (let i = min; i <= max; i++) list.push(i);
    return list;
  });

  let minutes = $derived.by(() => {
    const list: number[] = [];
    for (let i = 0; i < 60; i += minuteStep) list.push(i);
    return list;
  });

  let selectedHour = $state(-1);
  let selectedMinute = $state(-1);

  $effect(() => {
    if (value) {
      const parts = value.split(":");
      let h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (format === "12h") {
        period = h >= 12 ? "PM" : "AM";
        if (h === 0) h = 12;
        else if (h > 12) h -= 12;
      }
      selectedHour = h;
      selectedMinute = m;
    }
  });

  let displayValue = $derived.by(() => {
    if (!value) return "";
    if (format === "12h" && value) {
      const parts = value.split(":");
      let h = parseInt(parts[0], 10);
      const m = parts[1];
      const p = h >= 12 ? "PM" : "AM";
      if (h === 0) h = 12;
      else if (h > 12) h -= 12;
      return `${String(h).padStart(2, "0")}:${m} ${p}`;
    }
    return value;
  });

  function selectHour(h: number) {
    selectedHour = h;
    updateValue();
  }

  function selectMinute(m: number) {
    selectedMinute = m;
    updateValue();
  }

  function togglePeriod(p: "AM" | "PM") {
    period = p;
    updateValue();
  }

  function updateValue() {
    if (selectedHour < 0 || selectedMinute < 0) return;
    let h = selectedHour;
    if (format === "12h") {
      if (period === "AM" && h === 12) h = 0;
      else if (period === "PM" && h !== 12) h += 12;
    }
    const newVal = `${String(h).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;
    value = newVal;
    onchange?.(newVal);
  }

  function toggleOpen() {
    if (!disabled) open = !open;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") open = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="cy-tp" class:cy-tp--error={!!error} class:cy-tp--disabled={disabled}>
  {#if label}
    <label class="cy-tp__label" for={inputId}>{label}</label>
  {/if}

  <button
    class="cy-tp__trigger"
    id={inputId}
    type="button"
    {disabled}
    onclick={toggleOpen}
    aria-expanded={open}
    aria-haspopup="dialog"
  >
    <svg class="cy-tp__icon" viewBox="0 0 20 20" fill="none" width="16" height="16">
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
      <path d="M10 5v5l3.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="cy-tp__value" class:cy-tp__value--placeholder={!value}>
      {displayValue || "Select time"}
    </span>
  </button>

  {#if open}
    <div class="cy-tp__dropdown" role="dialog" aria-label="Time picker">
      <div class="cy-tp__columns">
        <div class="cy-tp__column">
          <span class="cy-tp__col-header">Hr</span>
          <div class="cy-tp__scroll">
            {#each hours as h}
              <button
                class="cy-tp__cell"
                class:cy-tp__cell--selected={h === selectedHour}
                type="button"
                onclick={() => selectHour(h)}
              >
                {String(h).padStart(2, "0")}
              </button>
            {/each}
          </div>
        </div>

        <div class="cy-tp__column">
          <span class="cy-tp__col-header">Min</span>
          <div class="cy-tp__scroll">
            {#each minutes as m}
              <button
                class="cy-tp__cell"
                class:cy-tp__cell--selected={m === selectedMinute}
                type="button"
                onclick={() => selectMinute(m)}
              >
                {String(m).padStart(2, "0")}
              </button>
            {/each}
          </div>
        </div>

        {#if format === "12h"}
          <div class="cy-tp__column cy-tp__column--period">
            <span class="cy-tp__col-header">--</span>
            <div class="cy-tp__scroll">
              <button
                class="cy-tp__cell"
                class:cy-tp__cell--selected={period === "AM"}
                type="button"
                onclick={() => togglePeriod("AM")}
              >
                AM
              </button>
              <button
                class="cy-tp__cell"
                class:cy-tp__cell--selected={period === "PM"}
                type="button"
                onclick={() => togglePeriod("PM")}
              >
                PM
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if error}
    <p class="cy-tp__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-tp {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    position: relative;
  }

  .cy-tp__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-tp__trigger {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    height: 40px;
    width: 100%;
    cursor: pointer;
    transition: all var(--transition-default);
    text-align: left;
  }

  .cy-tp__trigger:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-tp__trigger:focus {
    outline: none;
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-tp--error .cy-tp__trigger {
    border-color: var(--input-border-error);
  }

  .cy-tp--disabled .cy-tp__trigger {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-tp__icon {
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .cy-tp__value--placeholder {
    color: var(--input-placeholder);
  }

  .cy-tp__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 50;
    margin-top: var(--space-1);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-2);
    box-shadow: var(--shadow-lg);
  }

  .cy-tp__columns {
    display: flex;
    gap: var(--space-1);
  }

  .cy-tp__column {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 54px;
  }

  .cy-tp__col-header {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: var(--space-1);
    border-bottom: 1px solid var(--color-border-subtle);
    width: 100%;
    text-align: center;
    margin-bottom: var(--space-1);
  }

  .cy-tp__scroll {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 180px;
    overflow-y: auto;
    padding: 2px;
    scrollbar-width: thin;
    scrollbar-color: var(--color-border-subtle) transparent;
  }

  .cy-tp__cell {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    cursor: pointer;
    transition: all var(--transition-default);
    text-align: center;
    min-width: 44px;
  }

  .cy-tp__cell:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .cy-tp__cell--selected {
    background: var(--color-action-brand-default);
    color: var(--color-bg-primary);
    font-weight: var(--font-weight-semibold);
  }

  .cy-tp__cell--selected:hover {
    background: var(--color-action-brand-default);
    color: var(--color-bg-primary);
  }

  .cy-tp__column--period .cy-tp__scroll {
    max-height: none;
  }

  .cy-tp__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
