<svelte:options runes={true} />

<script lang="ts">
  type CalendarEvent = {
    date: string;
    label: string;
    color?: string;
  };

  let {
    selectedDate = $bindable(""),
    month = new Date().getMonth(),
    year = new Date().getFullYear(),
    events = [],
    minDate = "",
    maxDate = "",
    onselect,
    onmonthchange,
  }: {
    selectedDate?: string;
    month?: number;
    year?: number;
    events?: CalendarEvent[];
    minDate?: string;
    maxDate?: string;
    onselect?: (date: string) => void;
    onmonthchange?: (month: number, year: number) => void;
  } = $props();

  let currentMonth = $state(month);
  let currentYear = $state(year);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function toISO(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function isDisabled(iso: string): boolean {
    if (minDate && iso < minDate) return true;
    if (maxDate && iso > maxDate) return true;
    return false;
  }

  function getEventsForDate(iso: string): CalendarEvent[] {
    return events.filter((e) => e.date === iso);
  }

  let calendarDays = $derived.by(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday=0 ... Sunday=6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: Array<{
      date: number;
      iso: string;
      currentMonth: boolean;
      disabled: boolean;
      isToday: boolean;
      isSelected: boolean;
      events: CalendarEvent[];
    }> = [];

    // Previous month days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const iso = toISO(prevYear, prevMonth, d);
      days.push({
        date: d,
        iso,
        currentMonth: false,
        disabled: true,
        isToday: iso === todayISO,
        isSelected: iso === selectedDate,
        events: getEventsForDate(iso),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISO(currentYear, currentMonth, d);
      days.push({
        date: d,
        iso,
        currentMonth: true,
        disabled: isDisabled(iso),
        isToday: iso === todayISO,
        isSelected: iso === selectedDate,
        events: getEventsForDate(iso),
      });
    }

    // Next month days to fill 6 rows
    const remaining = 42 - days.length;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    for (let d = 1; d <= remaining; d++) {
      const iso = toISO(nextYear, nextMonth, d);
      days.push({
        date: d,
        iso,
        currentMonth: false,
        disabled: true,
        isToday: iso === todayISO,
        isSelected: iso === selectedDate,
        events: getEventsForDate(iso),
      });
    }

    return days;
  });

  function prevMonth() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    onmonthchange?.(currentMonth, currentYear);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    onmonthchange?.(currentMonth, currentYear);
  }

  function selectDate(day: (typeof calendarDays)[0]) {
    if (day.disabled || !day.currentMonth) return;
    selectedDate = day.iso;
    onselect?.(day.iso);
  }
</script>

<div class="cy-calendar">
  <div class="cy-calendar__header">
    <button class="cy-calendar__nav-btn" onclick={prevMonth} aria-label="Previous month">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <span class="cy-calendar__title">{monthNames[currentMonth]} {currentYear}</span>
    <button class="cy-calendar__nav-btn" onclick={nextMonth} aria-label="Next month">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>

  <div class="cy-calendar__grid">
    {#each dayLabels as label}
      <div class="cy-calendar__day-label">{label}</div>
    {/each}

    {#each calendarDays as day}
      <button
        class="cy-calendar__day"
        class:cy-calendar__day--outside={!day.currentMonth}
        class:cy-calendar__day--disabled={day.disabled && day.currentMonth}
        class:cy-calendar__day--today={day.isToday}
        class:cy-calendar__day--selected={day.isSelected}
        disabled={day.disabled || !day.currentMonth}
        onclick={() => selectDate(day)}
      >
        <span class="cy-calendar__day-number">{day.date}</span>
        {#if day.events.length > 0}
          <div class="cy-calendar__events">
            {#each day.events.slice(0, 3) as evt}
              <span
                class="cy-calendar__event-dot"
                style:--dot-color={evt.color || "var(--cy-neon-green)"}
                title={evt.label}
              ></span>
            {/each}
          </div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .cy-calendar {
    --cy-bg: var(--calendar-bg, #12121a);
    --cy-bg-deep: var(--calendar-bg-deep, #0a0a0f);
    --cy-neon-green: var(--calendar-accent, #00ff41);
    --cy-cyan: var(--calendar-cyan, #00d4ff);
    --cy-border: var(--calendar-border, #1e1e2e);
    --cy-text: var(--calendar-text, #e0e0e0);
    --cy-text-dim: var(--calendar-text-dim, #555570);
    --cy-text-secondary: var(--calendar-text-secondary, #8888a0);

    background: var(--cy-bg);
    border: 1px solid var(--cy-border);
    border-radius: 12px;
    padding: 20px;
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
    width: 340px;
    user-select: none;
  }

  .cy-calendar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .cy-calendar__title {
    color: var(--cy-text);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .cy-calendar__nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid var(--cy-border);
    border-radius: 8px;
    color: var(--cy-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .cy-calendar__nav-btn:hover {
    background: var(--cy-bg-deep);
    color: var(--cy-neon-green);
    border-color: var(--cy-neon-green);
  }

  .cy-calendar__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .cy-calendar__day-label {
    text-align: center;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--cy-text-dim);
    padding: 4px 0 8px;
  }

  .cy-calendar__day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 42px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    padding: 2px;
    position: relative;
  }

  .cy-calendar__day:not(:disabled):hover {
    background: rgba(0, 255, 65, 0.06);
    border-color: rgba(0, 255, 65, 0.2);
  }

  .cy-calendar__day--outside {
    opacity: 0.25;
    pointer-events: none;
  }

  .cy-calendar__day--disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cy-calendar__day--today .cy-calendar__day-number {
    box-shadow: 0 0 0 2px var(--cy-neon-green);
    border-radius: 50%;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cy-calendar__day--selected {
    background: var(--cy-neon-green) !important;
    border-color: var(--cy-neon-green) !important;
  }

  .cy-calendar__day--selected .cy-calendar__day-number {
    color: #0a0a0f !important;
    font-weight: 700;
    box-shadow: none;
  }

  .cy-calendar__day-number {
    font-size: 0.8rem;
    color: var(--cy-text);
    font-weight: 500;
    line-height: 1;
  }

  .cy-calendar__events {
    display: flex;
    gap: 2px;
    margin-top: 2px;
    position: absolute;
    bottom: 3px;
  }

  .cy-calendar__event-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--dot-color);
  }
</style>
