<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(""),
    label = "",
    placeholder = "Select date",
    minDate = "",
    maxDate = "",
    disabled = false,
    error = "",
    onchange,
  }: {
    value?: string;
    label?: string;
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
    disabled?: boolean;
    error?: string;
    onchange?: (value: string) => void;
  } = $props();

  let open = $state(false);
  let inputId = `cy-dp-${Math.random().toString(36).slice(2, 9)}`;

  let today = $derived(new Date());
  let todayStr = $derived(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  let viewDate = $state(new Date());

  $effect(() => {
    if (value) {
      const parts = value.split("-");
      viewDate = new Date(+parts[0], +parts[1] - 1, 1);
    } else {
      viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
  });

  let viewYear = $derived(viewDate.getFullYear());
  let viewMonth = $derived(viewDate.getMonth());

  let monthName = $derived(
    viewDate.toLocaleString("default", { month: "long" })
  );

  let daysInMonth = $derived(new Date(viewYear, viewMonth + 1, 0).getDate());
  let firstDayOfWeek = $derived(new Date(viewYear, viewMonth, 1).getDay());

  let calendarDays = $derived.by(() => {
    const days: Array<{ day: number; dateStr: string; disabled: boolean }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      let isDisabled = false;
      if (minDate && dateStr < minDate) isDisabled = true;
      if (maxDate && dateStr > maxDate) isDisabled = true;
      days.push({ day: d, dateStr, disabled: isDisabled });
    }
    return days;
  });

  let blanks = $derived(Array(firstDayOfWeek).fill(null));
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function selectDate(dateStr: string) {
    value = dateStr;
    onchange?.(dateStr);
    open = false;
  }

  function prevMonth() {
    viewDate = new Date(viewYear, viewMonth - 1, 1);
  }

  function nextMonth() {
    viewDate = new Date(viewYear, viewMonth + 1, 1);
  }

  function goToday() {
    selectDate(todayStr);
  }

  function clear() {
    value = "";
    onchange?.("");
    open = false;
  }

  function toggleOpen() {
    if (!disabled) open = !open;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") open = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="cy-dp" class:cy-dp--error={!!error} class:cy-dp--disabled={disabled}>
  {#if label}
    <label class="cy-dp__label" for={inputId}>{label}</label>
  {/if}

  <button
    class="cy-dp__trigger"
    id={inputId}
    type="button"
    {disabled}
    onclick={toggleOpen}
    aria-expanded={open}
    aria-haspopup="dialog"
  >
    <svg class="cy-dp__icon" viewBox="0 0 20 20" fill="none" width="16" height="16">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
      <path d="M2 8h16" stroke="currentColor" stroke-width="1.5" />
      <path d="M6 2v4M14 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <span class="cy-dp__value" class:cy-dp__value--placeholder={!value}>
      {value || placeholder}
    </span>
  </button>

  {#if open}
    <div class="cy-dp__dropdown" role="dialog" aria-label="Date picker">
      <div class="cy-dp__nav">
        <button class="cy-dp__nav-btn" type="button" onclick={prevMonth} aria-label="Previous month">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="cy-dp__nav-title">{monthName} {viewYear}</span>
        <button class="cy-dp__nav-btn" type="button" onclick={nextMonth} aria-label="Next month">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="cy-dp__weekdays">
        {#each weekdays as wd}
          <span class="cy-dp__weekday">{wd}</span>
        {/each}
      </div>

      <div class="cy-dp__grid">
        {#each blanks as _}
          <span class="cy-dp__blank"></span>
        {/each}
        {#each calendarDays as { day, dateStr, disabled: dayDisabled }}
          <button
            class="cy-dp__day"
            class:cy-dp__day--selected={dateStr === value}
            class:cy-dp__day--today={dateStr === todayStr}
            class:cy-dp__day--disabled={dayDisabled}
            type="button"
            disabled={dayDisabled}
            onclick={() => selectDate(dateStr)}
          >
            {day}
          </button>
        {/each}
      </div>

      <div class="cy-dp__footer">
        <button class="cy-dp__footer-btn" type="button" onclick={goToday}>Today</button>
        <button class="cy-dp__footer-btn" type="button" onclick={clear}>Clear</button>
      </div>
    </div>
  {/if}

  {#if error}
    <p class="cy-dp__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-dp {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    position: relative;
  }

  .cy-dp__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-dp__trigger {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-body);
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

  .cy-dp__trigger:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-dp__trigger:focus {
    outline: none;
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-dp--error .cy-dp__trigger {
    border-color: var(--input-border-error);
  }

  .cy-dp--disabled .cy-dp__trigger {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-dp__icon {
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .cy-dp__value--placeholder {
    color: var(--input-placeholder);
  }

  .cy-dp__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 50;
    margin-top: var(--space-1);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
    box-shadow: var(--shadow-lg);
    min-width: 280px;
  }

  .cy-dp__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2);
  }

  .cy-dp__nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-dp__nav-btn:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .cy-dp__nav-title {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .cy-dp__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: var(--space-1);
  }

  .cy-dp__weekday {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-align: center;
    padding: var(--space-1) 0;
    text-transform: uppercase;
  }

  .cy-dp__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .cy-dp__blank {
    aspect-ratio: 1;
  }

  .cy-dp__day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-dp__day:hover:not(:disabled) {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .cy-dp__day--today {
    border-color: var(--color-action-brand-default);
  }

  .cy-dp__day--selected {
    background: var(--color-action-brand-default);
    color: var(--color-bg-primary);
    font-weight: var(--font-weight-semibold);
  }

  .cy-dp__day--selected:hover:not(:disabled) {
    background: var(--color-action-brand-default);
    color: var(--color-bg-primary);
  }

  .cy-dp__day--disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cy-dp__footer {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-border-subtle);
  }

  .cy-dp__footer-btn {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-action-secondary-default);
    background: transparent;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    padding: var(--space-1) var(--space-2);
    cursor: pointer;
    transition: all var(--transition-default);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-dp__footer-btn:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .cy-dp__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
