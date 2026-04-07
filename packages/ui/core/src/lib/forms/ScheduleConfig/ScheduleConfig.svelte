<svelte:options runes={true} />

<script lang="ts">
  export type ScheduleMode = "interval" | "daily" | "weekly" | "monthly" | "cron";

  export type ScheduleValue = {
    mode: ScheduleMode;
    intervalMinutes: number;
    time: string;
    days: number[];
    monthDays: number[];
    cron: string;
    timezone: string;
  };

  const WEEKDAYS = [
    { value: 0, label: "Sun", full: "Sunday" },
    { value: 1, label: "Mon", full: "Monday" },
    { value: 2, label: "Tue", full: "Tuesday" },
    { value: 3, label: "Wed", full: "Wednesday" },
    { value: 4, label: "Thu", full: "Thursday" },
    { value: 5, label: "Fri", full: "Friday" },
    { value: 6, label: "Sat", full: "Saturday" },
  ];

  const INTERVAL_PRESETS = [
    { value: 5, label: "5 min" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hr" },
    { value: 120, label: "2 hr" },
    { value: 360, label: "6 hr" },
    { value: 720, label: "12 hr" },
    { value: 1440, label: "24 hr" },
  ];

  let {
    value = $bindable({
      mode: "interval",
      intervalMinutes: 60,
      time: "09:00",
      days: [1, 2, 3, 4, 5],
      monthDays: [1],
      cron: "0 9 * * *",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    label = "",
    disabled = false,
    error = "",
    showTimezone = true,
    showCron = false,
    onchange,
  }: {
    value?: ScheduleValue;
    label?: string;
    disabled?: boolean;
    error?: string;
    showTimezone?: boolean;
    showCron?: boolean;
    onchange?: (value: ScheduleValue) => void;
  } = $props();

  let componentId = `cy-sched-${Math.random().toString(36).slice(2, 9)}`;

  let modeOptions = $derived([
    { value: "interval" as ScheduleMode, label: "Every N minutes", icon: "⟳" },
    { value: "daily" as ScheduleMode, label: "Daily", icon: "☀" },
    { value: "weekly" as ScheduleMode, label: "Weekly", icon: "▦" },
    { value: "monthly" as ScheduleMode, label: "Monthly", icon: "◫" },
    ...(showCron ? [{ value: "cron" as ScheduleMode, label: "Cron", icon: ">" }] : []),
  ]);

  function setMode(mode: ScheduleMode) {
    if (disabled) return;
    value = { ...value, mode };
    onchange?.(value);
  }

  function toggleDay(day: number) {
    if (disabled) return;
    const idx = value.days.indexOf(day);
    if (idx >= 0) {
      value = { ...value, days: value.days.filter((d) => d !== day) };
    } else {
      value = { ...value, days: [...value.days, day].sort() };
    }
    onchange?.(value);
  }

  function toggleMonthDay(day: number) {
    if (disabled) return;
    const idx = value.monthDays.indexOf(day);
    if (idx >= 0) {
      value = { ...value, monthDays: value.monthDays.filter((d) => d !== day) };
    } else {
      value = { ...value, monthDays: [...value.monthDays, day].sort((a, b) => a - b) };
    }
    onchange?.(value);
  }

  function setInterval(minutes: number) {
    if (disabled) return;
    value = { ...value, intervalMinutes: minutes };
    onchange?.(value);
  }

  function handleTimeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = { ...value, time: target.value };
    onchange?.(value);
  }

  function handleCronChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = { ...value, cron: target.value };
    onchange?.(value);
  }

  function handleTimezoneChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    value = { ...value, timezone: target.value };
    onchange?.(value);
  }

  function handleCustomInterval(e: Event) {
    const target = e.target as HTMLInputElement;
    const parsed = parseInt(target.value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      value = { ...value, intervalMinutes: parsed };
      onchange?.(value);
    }
  }

  function getSummary(): string {
    switch (value.mode) {
      case "interval":
        if (value.intervalMinutes < 60) return `Every ${value.intervalMinutes} minutes`;
        if (value.intervalMinutes === 60) return `Every hour`;
        if (value.intervalMinutes % 60 === 0) return `Every ${value.intervalMinutes / 60} hours`;
        return `Every ${Math.floor(value.intervalMinutes / 60)}h ${value.intervalMinutes % 60}m`;
      case "daily":
        return `Daily at ${value.time}`;
      case "weekly": {
        const dayNames = value.days.map((d) => WEEKDAYS[d].label).join(", ");
        return `${dayNames || "No days"} at ${value.time}`;
      }
      case "monthly": {
        const dayList = value.monthDays.join(", ");
        return `Day ${dayList || "—"} of each month at ${value.time}`;
      }
      case "cron":
        return value.cron;
      default:
        return "";
    }
  }

  const COMMON_TIMEZONES = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Kolkata",
    "Australia/Sydney",
  ];

  const monthDayNumbers = Array.from({ length: 31 }, (_, i) => i + 1);
</script>

<div
  class="cy-sched"
  class:cy-sched--error={!!error}
  class:cy-sched--disabled={disabled}
  role="group"
  aria-label={label || "Schedule configuration"}
>
  {#if label}
    <span class="cy-sched__label" id="{componentId}-label">{label}</span>
  {/if}

  <!-- Mode selector -->
  <div class="cy-sched__modes" role="radiogroup" aria-label="Schedule type">
    {#each modeOptions as opt}
      <button
        class="cy-sched__mode-btn"
        class:cy-sched__mode-btn--active={value.mode === opt.value}
        type="button"
        role="radio"
        aria-checked={value.mode === opt.value}
        {disabled}
        onclick={() => setMode(opt.value)}
      >
        <span class="cy-sched__mode-icon">{opt.icon}</span>
        <span class="cy-sched__mode-label">{opt.label}</span>
      </button>
    {/each}
  </div>

  <!-- Interval config -->
  {#if value.mode === "interval"}
    <div class="cy-sched__section">
      <div class="cy-sched__presets">
        {#each INTERVAL_PRESETS as preset}
          <button
            class="cy-sched__preset-btn"
            class:cy-sched__preset-btn--active={value.intervalMinutes === preset.value}
            type="button"
            {disabled}
            onclick={() => setInterval(preset.value)}
          >
            {preset.label}
          </button>
        {/each}
      </div>
      <div class="cy-sched__custom-interval">
        <label class="cy-sched__field-label" for="{componentId}-interval">Custom (min)</label>
        <input
          class="cy-sched__input"
          id="{componentId}-interval"
          type="number"
          min="1"
          value={value.intervalMinutes}
          {disabled}
          oninput={handleCustomInterval}
        />
      </div>
    </div>
  {/if}

  <!-- Daily config -->
  {#if value.mode === "daily"}
    <div class="cy-sched__section">
      <div class="cy-sched__time-row">
        <label class="cy-sched__field-label" for="{componentId}-time">Run at</label>
        <input
          class="cy-sched__input cy-sched__input--time"
          id="{componentId}-time"
          type="time"
          value={value.time}
          {disabled}
          onchange={handleTimeChange}
        />
      </div>
    </div>
  {/if}

  <!-- Weekly config -->
  {#if value.mode === "weekly"}
    <div class="cy-sched__section">
      <span class="cy-sched__field-label">Days</span>
      <div class="cy-sched__days">
        {#each WEEKDAYS as day}
          <button
            class="cy-sched__day-btn"
            class:cy-sched__day-btn--active={value.days.includes(day.value)}
            type="button"
            {disabled}
            aria-pressed={value.days.includes(day.value)}
            aria-label={day.full}
            onclick={() => toggleDay(day.value)}
          >
            {day.label}
          </button>
        {/each}
      </div>
      <div class="cy-sched__time-row">
        <label class="cy-sched__field-label" for="{componentId}-wtime">Run at</label>
        <input
          class="cy-sched__input cy-sched__input--time"
          id="{componentId}-wtime"
          type="time"
          value={value.time}
          {disabled}
          onchange={handleTimeChange}
        />
      </div>
    </div>
  {/if}

  <!-- Monthly config -->
  {#if value.mode === "monthly"}
    <div class="cy-sched__section">
      <span class="cy-sched__field-label">Days of month</span>
      <div class="cy-sched__month-days">
        {#each monthDayNumbers as day}
          <button
            class="cy-sched__mday-btn"
            class:cy-sched__mday-btn--active={value.monthDays.includes(day)}
            type="button"
            {disabled}
            aria-pressed={value.monthDays.includes(day)}
            onclick={() => toggleMonthDay(day)}
          >
            {day}
          </button>
        {/each}
      </div>
      <div class="cy-sched__time-row">
        <label class="cy-sched__field-label" for="{componentId}-mtime">Run at</label>
        <input
          class="cy-sched__input cy-sched__input--time"
          id="{componentId}-mtime"
          type="time"
          value={value.time}
          {disabled}
          onchange={handleTimeChange}
        />
      </div>
    </div>
  {/if}

  <!-- Cron config -->
  {#if value.mode === "cron"}
    <div class="cy-sched__section">
      <label class="cy-sched__field-label" for="{componentId}-cron">Cron expression</label>
      <input
        class="cy-sched__input cy-sched__input--cron"
        id="{componentId}-cron"
        type="text"
        value={value.cron}
        placeholder="0 9 * * 1-5"
        {disabled}
        oninput={handleCronChange}
      />
      <span class="cy-sched__hint">min hour day month weekday</span>
    </div>
  {/if}

  <!-- Timezone -->
  {#if showTimezone && value.mode !== "interval"}
    <div class="cy-sched__section cy-sched__tz-row">
      <label class="cy-sched__field-label" for="{componentId}-tz">Timezone</label>
      <select
        class="cy-sched__select"
        id="{componentId}-tz"
        {disabled}
        onchange={handleTimezoneChange}
      >
        {#each COMMON_TIMEZONES as tz}
          <option value={tz} selected={value.timezone === tz}>{tz.replace(/_/g, " ")}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Summary -->
  <div class="cy-sched__summary">
    <span class="cy-sched__summary-icon">⏱</span>
    <span class="cy-sched__summary-text">{getSummary()}</span>
  </div>

  {#if error}
    <p class="cy-sched__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-sched {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
  }

  .cy-sched--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cy-sched__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Mode selector */
  .cy-sched__modes {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  .cy-sched__mode-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-family: var(--font-body);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-sched__mode-btn:hover:not(:disabled) {
    background: var(--input-bg-hover);
    border-color: var(--color-border-strong);
  }

  .cy-sched__mode-btn--active {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    color: var(--color-action-brand-text);
  }

  .cy-sched__mode-btn--active:hover:not(:disabled) {
    background: var(--color-action-brand-hover);
    border-color: var(--color-action-brand-hover);
  }

  .cy-sched__mode-icon {
    font-size: 0.875rem;
    line-height: 1;
  }

  .cy-sched__mode-label {
    white-space: nowrap;
  }

  /* Sections */
  .cy-sched__section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .cy-sched__field-label {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Interval presets */
  .cy-sched__presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .cy-sched__preset-btn {
    padding: var(--space-1) var(--space-2);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-sched__preset-btn:hover:not(:disabled) {
    background: var(--input-bg-hover);
    border-color: var(--color-border-strong);
  }

  .cy-sched__preset-btn--active {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    color: var(--color-action-brand-text);
  }

  /* Custom interval */
  .cy-sched__custom-interval {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  /* Weekday buttons */
  .cy-sched__days {
    display: flex;
    gap: var(--space-1);
  }

  .cy-sched__day-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 36px;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-sched__day-btn:hover:not(:disabled) {
    background: var(--input-bg-hover);
    border-color: var(--color-border-strong);
  }

  .cy-sched__day-btn--active {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    color: var(--color-action-brand-text);
  }

  /* Month day grid */
  .cy-sched__month-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--space-1);
  }

  .cy-sched__mday-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-xs);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-sched__mday-btn:hover:not(:disabled) {
    background: var(--input-bg-hover);
    border-color: var(--color-border-strong);
  }

  .cy-sched__mday-btn--active {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    color: var(--color-action-brand-text);
  }

  /* Time row */
  .cy-sched__time-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  /* Timezone */
  .cy-sched__tz-row {
    flex-direction: row;
    align-items: center;
  }

  /* Inputs */
  .cy-sched__input {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    height: 36px;
    outline: none;
    transition: all var(--transition-default);
  }

  .cy-sched__input:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-sched__input--time {
    width: 120px;
  }

  .cy-sched__input--cron {
    width: 100%;
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
  }

  .cy-sched__input[type="number"] {
    width: 100px;
    text-align: center;
  }

  /* Select */
  .cy-sched__select {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-1) var(--space-3);
    height: 36px;
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    transition: all var(--transition-default);
  }

  .cy-sched__select:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-sched__select option {
    background: var(--color-bg-elevated);
    color: var(--input-text);
  }

  /* Hint */
  .cy-sched__hint {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    letter-spacing: 0.08em;
  }

  /* Summary */
  .cy-sched__summary {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
  }

  .cy-sched__summary-icon {
    font-size: 0.875rem;
    line-height: 1;
  }

  .cy-sched__summary-text {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-text-primary);
  }

  /* Error */
  .cy-sched__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }

  .cy-sched--error .cy-sched__summary {
    border-color: var(--input-border-error);
  }
</style>
