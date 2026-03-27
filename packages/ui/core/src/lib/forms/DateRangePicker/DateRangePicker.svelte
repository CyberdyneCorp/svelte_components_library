<svelte:options runes={true} />

<script lang="ts">
  type Preset = { label: string; days: number };

  let {
    startDate = $bindable(""),
    endDate = $bindable(""),
    label = "",
    presets = [
      { label: "Last 7 days", days: 7 },
      { label: "Last 30 days", days: 30 },
      { label: "Last 90 days", days: 90 },
      { label: "Last year", days: 365 },
    ] as Preset[],
    disabled = false,
    error = "",
    onchange,
  }: {
    startDate?: string;
    endDate?: string;
    label?: string;
    presets?: Preset[];
    disabled?: boolean;
    error?: string;
    onchange?: (start: string, end: string) => void;
  } = $props();

  let open = $state(false);
  let selecting: "start" | "end" = $state("start");
  let leftMonth = $state(new Date().getMonth());
  let leftYear = $state(new Date().getFullYear());
  let hoverDate = $state("");
  let containerEl: HTMLDivElement | undefined = $state(undefined);

  let inputId = `cy-drp-${Math.random().toString(36).slice(2, 9)}`;

  let rightMonth = $derived(leftMonth === 11 ? 0 : leftMonth + 1);
  let rightYear = $derived(leftMonth === 11 ? leftYear + 1 : leftYear);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function toISO(d: Date): string {
    return d.toISOString().split("T")[0];
  }

  function todayISO(): string {
    return toISO(new Date());
  }

  function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function firstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }

  function calendarDays(year: number, month: number): string[] {
    const total = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);
    const days: string[] = [];
    for (let i = 0; i < offset; i++) days.push("");
    for (let d = 1; d <= total; d++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      days.push(`${year}-${mm}-${dd}`);
    }
    return days;
  }

  function prevMonth() {
    if (leftMonth === 0) {
      leftMonth = 11;
      leftYear--;
    } else {
      leftMonth--;
    }
  }

  function nextMonth() {
    if (leftMonth === 11) {
      leftMonth = 0;
      leftYear++;
    } else {
      leftMonth++;
    }
  }

  function selectDay(day: string) {
    if (!day) return;
    if (selecting === "start") {
      startDate = day;
      endDate = "";
      selecting = "end";
    } else {
      if (day < startDate) {
        startDate = day;
        selecting = "end";
      } else {
        endDate = day;
        selecting = "start";
        open = false;
        onchange?.(startDate, endDate);
      }
    }
  }

  function applyPreset(preset: Preset) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - preset.days);
    startDate = toISO(start);
    endDate = toISO(end);
    open = false;
    onchange?.(startDate, endDate);
  }

  function isInRange(day: string): boolean {
    if (!day || !startDate) return false;
    const end = endDate || hoverDate;
    if (!end) return false;
    return day > startDate && day < end;
  }

  function isStart(day: string): boolean {
    return day === startDate;
  }

  function isEnd(day: string): boolean {
    return day === endDate;
  }

  function isToday(day: string): boolean {
    return day === todayISO();
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerEl && !containerEl.contains(e.target as Node)) {
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

<div class="cy-drp" class:cy-drp--error={!!error} class:cy-drp--disabled={disabled} bind:this={containerEl}>
  {#if label}
    <label class="cy-drp__label" for={inputId}>{label}</label>
  {/if}

  <button
    class="cy-drp__trigger"
    id={inputId}
    type="button"
    {disabled}
    onclick={() => { if (!disabled) open = !open; }}
    aria-expanded={open}
  >
    <svg class="cy-drp__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
    <span class="cy-drp__value">
      {#if startDate && endDate}
        {startDate} — {endDate}
      {:else if startDate}
        {startDate} — ...
      {:else}
        Select date range
      {/if}
    </span>
  </button>

  {#if open}
    <div class="cy-drp__dropdown">
      {#if presets.length > 0}
        <div class="cy-drp__presets">
          {#each presets as preset}
            <button class="cy-drp__preset-btn" type="button" onclick={() => applyPreset(preset)}>{preset.label}</button>
          {/each}
        </div>
      {/if}

      <div class="cy-drp__calendars">
        {#each [{ month: leftMonth, year: leftYear }, { month: rightMonth, year: rightYear }] as cal, ci}
          <div class="cy-drp__cal">
            <div class="cy-drp__cal-header">
              {#if ci === 0}
                <button class="cy-drp__nav-btn" type="button" onclick={prevMonth} aria-label="Previous month">&larr;</button>
              {:else}
                <span></span>
              {/if}
              <span class="cy-drp__cal-title">{MONTHS[cal.month]} {cal.year}</span>
              {#if ci === 1}
                <button class="cy-drp__nav-btn" type="button" onclick={nextMonth} aria-label="Next month">&rarr;</button>
              {:else}
                <span></span>
              {/if}
            </div>
            <div class="cy-drp__weekdays">
              {#each DAYS as d}
                <span class="cy-drp__weekday">{d}</span>
              {/each}
            </div>
            <div class="cy-drp__days">
              {#each calendarDays(cal.year, cal.month) as day}
                {#if day === ""}
                  <span class="cy-drp__day cy-drp__day--empty"></span>
                {:else}
                  <button
                    class="cy-drp__day"
                    class:cy-drp__day--start={isStart(day)}
                    class:cy-drp__day--end={isEnd(day)}
                    class:cy-drp__day--in-range={isInRange(day)}
                    class:cy-drp__day--today={isToday(day)}
                    type="button"
                    onclick={() => selectDay(day)}
                    onmouseenter={() => { if (selecting === "end") hoverDate = day; }}
                  >
                    {parseInt(day.split("-")[2])}
                  </button>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if error}
    <p class="cy-drp__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-drp {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    position: relative;
  }

  .cy-drp__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-drp__trigger {
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
    outline: none;
    transition: all var(--transition-default);
    text-align: left;
  }

  .cy-drp__trigger:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-drp__trigger:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-drp--error .cy-drp__trigger {
    border-color: var(--input-border-error);
  }

  .cy-drp__trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-drp__icon {
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .cy-drp__value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cy-drp__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 50;
    margin-top: var(--space-1);
    background: var(--color-bg-elevated, #12121a);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
    box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.5));
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .cy-drp__presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--input-border);
  }

  .cy-drp__preset-btn {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-accent-cyan, #00d4ff);
    background: transparent;
    border: 1px solid var(--color-accent-cyan, #00d4ff);
    border-radius: var(--radius-sm);
    padding: 2px 8px;
    cursor: pointer;
    transition: all var(--transition-default);
    white-space: nowrap;
  }

  .cy-drp__preset-btn:hover {
    background: rgba(0, 212, 255, 0.1);
  }

  .cy-drp__calendars {
    display: flex;
    gap: var(--space-4);
  }

  .cy-drp__cal {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 210px;
  }

  .cy-drp__cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-1);
  }

  .cy-drp__cal-title {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-text-primary, #e0e0e0);
    font-weight: var(--font-weight-medium);
  }

  .cy-drp__nav-btn {
    background: transparent;
    border: 1px solid var(--input-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary, #a0a0a0);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all var(--transition-default);
  }

  .cy-drp__nav-btn:hover {
    border-color: var(--color-accent-cyan, #00d4ff);
    color: var(--color-accent-cyan, #00d4ff);
  }

  .cy-drp__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }

  .cy-drp__weekday {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    color: var(--color-text-tertiary);
    text-align: center;
    padding: 2px 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cy-drp__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }

  .cy-drp__day {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-secondary, #a0a0a0);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    width: 30px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-drp__day--empty {
    cursor: default;
  }

  .cy-drp__day:not(.cy-drp__day--empty):hover {
    background: rgba(0, 255, 65, 0.1);
    color: var(--color-accent-green, #00ff41);
  }

  .cy-drp__day--today {
    border: 1px solid var(--color-accent-cyan, #00d4ff);
  }

  .cy-drp__day--start,
  .cy-drp__day--end {
    background: var(--color-accent-green, #00ff41) !important;
    color: #0a0a0f !important;
    font-weight: var(--font-weight-bold);
  }

  .cy-drp__day--in-range {
    background: rgba(0, 255, 65, 0.15);
    color: var(--color-accent-green, #00ff41);
  }

  .cy-drp__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
