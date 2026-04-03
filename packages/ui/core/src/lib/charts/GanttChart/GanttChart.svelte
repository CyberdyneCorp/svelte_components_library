<svelte:options runes={true} />

<script lang="ts">
  type Task = {
    id: string;
    label: string;
    start: string;
    end: string;
    progress?: number;
    color?: string;
    group?: string;
    dependencies?: string[];
  };

  let {
    tasks = [],
    startDate = "",
    endDate = "",
    height = "400px",
    showToday = true,
    showDependencies = true,
    showProgress = true,
    onTaskClick,
    onTaskMove,
    zoom = "week",
  }: {
    tasks?: Task[];
    startDate?: string;
    endDate?: string;
    height?: string;
    showToday?: boolean;
    showDependencies?: boolean;
    showProgress?: boolean;
    onTaskClick?: (task: Task) => void;
    zoom?: "day" | "week" | "month" | "quarter" | "year";
    onTaskMove?: (task: Task, newStart: string, newEnd: string) => void;
  } = $props();

  const ROW_HEIGHT = 36;
  const HEADER_HEIGHT = 44;
  const LABEL_WIDTH = 200;
  const BAR_HEIGHT = 20;
  const BAR_Y_OFFSET = (ROW_HEIGHT - BAR_HEIGHT) / 2;

  let hoveredTask: Task | null = $state(null);
  let tooltipPos = $state({ x: 0, y: 0 });
  let containerEl: HTMLDivElement | undefined = $state(undefined);
  let collapsedGroups: Set<string> = $state(new Set());

  function toggleGroup(group: string) {
    const next = new Set(collapsedGroups);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    collapsedGroups = next;
  }

  function parseDate(s: string): Date {
    return new Date(s);
  }

  function daysBetween(a: Date, b: Date): number {
    return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
  }

  let viewStart = $derived.by(() => {
    if (startDate) return parseDate(startDate);
    if (!tasks.length) return new Date();
    const dates = tasks.map((t) => parseDate(t.start).getTime());
    const min = new Date(Math.min(...dates));
    min.setDate(min.getDate() - 2);
    return min;
  });

  let viewEnd = $derived.by(() => {
    if (endDate) return parseDate(endDate);
    if (!tasks.length) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d;
    }
    const dates = tasks.map((t) => parseDate(t.end).getTime());
    const max = new Date(Math.max(...dates));
    max.setDate(max.getDate() + 2);
    return max;
  });

  let totalDays = $derived(Math.max(1, daysBetween(viewStart, viewEnd)));

  let dayWidth = $derived.by(() => {
    if (zoom === "day") return 32;
    if (zoom === "week") return 16;
    if (zoom === "month") return 6;
    if (zoom === "quarter") return 2;
    return 0.8; // year
  });

  let timelineWidth = $derived(totalDays * dayWidth);

  // Build grouped/ordered row list
  type RowItem = { type: "group"; group: string } | { type: "task"; task: Task };

  let rows = $derived.by((): RowItem[] => {
    const groups: string[] = [];
    const groupMap = new Map<string, Task[]>();
    const ungrouped: Task[] = [];

    for (const t of tasks) {
      if (t.group) {
        if (!groupMap.has(t.group)) {
          groups.push(t.group);
          groupMap.set(t.group, []);
        }
        groupMap.get(t.group)!.push(t);
      } else {
        ungrouped.push(t);
      }
    }

    const result: RowItem[] = [];
    for (const g of groups) {
      result.push({ type: "group", group: g });
      if (!collapsedGroups.has(g)) {
        for (const t of groupMap.get(g)!) {
          result.push({ type: "task", task: t });
        }
      }
    }
    for (const t of ungrouped) {
      result.push({ type: "task", task: t });
    }
    return result;
  });

  let svgHeight = $derived(HEADER_HEIGHT + rows.length * ROW_HEIGHT);

  function taskX(task: Task): number {
    return daysBetween(viewStart, parseDate(task.start)) * dayWidth;
  }

  function taskW(task: Task): number {
    return Math.max(dayWidth, daysBetween(parseDate(task.start), parseDate(task.end)) * dayWidth);
  }

  function taskRowIndex(task: Task): number {
    return rows.findIndex((r) => r.type === "task" && r.task.id === task.id);
  }

  function taskY(task: Task): number {
    const idx = taskRowIndex(task);
    return HEADER_HEIGHT + idx * ROW_HEIGHT + BAR_Y_OFFSET;
  }

  function taskColor(task: Task): string {
    return task.color || "var(--color-action-brand-default)";
  }

  // Time header ticks
  type Tick = { label: string; x: number };

  let headerTicks = $derived.by((): Tick[] => {
    const ticks: Tick[] = [];
    const cursor = new Date(viewStart);

    if (zoom === "day") {
      while (cursor <= viewEnd) {
        const x = daysBetween(viewStart, cursor) * dayWidth;
        ticks.push({ label: `${cursor.getDate()}`, x });
        cursor.setDate(cursor.getDate() + 1);
      }
    } else if (zoom === "week") {
      // Advance to next Monday
      const dayOfWeek = cursor.getDay();
      const daysUntilMon = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
      cursor.setDate(cursor.getDate() + daysUntilMon);
      while (cursor <= viewEnd) {
        const x = daysBetween(viewStart, cursor) * dayWidth;
        const month = cursor.toLocaleDateString("en-US", { month: "short" });
        ticks.push({ label: `${month} ${cursor.getDate()}`, x });
        cursor.setDate(cursor.getDate() + 7);
      }
    } else if (zoom === "month") {
      cursor.setDate(1);
      if (cursor < viewStart) cursor.setMonth(cursor.getMonth() + 1);
      while (cursor <= viewEnd) {
        const x = daysBetween(viewStart, cursor) * dayWidth;
        const month = cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        ticks.push({ label: month, x });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else if (zoom === "quarter") {
      // Show quarter labels: Q1 2026, Q2 2026, etc.
      cursor.setDate(1);
      cursor.setMonth(Math.floor(cursor.getMonth() / 3) * 3);
      if (cursor < viewStart) cursor.setMonth(cursor.getMonth() + 3);
      while (cursor <= viewEnd) {
        const x = daysBetween(viewStart, cursor) * dayWidth;
        const q = Math.floor(cursor.getMonth() / 3) + 1;
        ticks.push({ label: `Q${q} ${cursor.getFullYear()}`, x });
        cursor.setMonth(cursor.getMonth() + 3);
      }
    } else {
      // year
      cursor.setDate(1);
      cursor.setMonth(0);
      if (cursor < viewStart) cursor.setFullYear(cursor.getFullYear() + 1);
      while (cursor <= viewEnd) {
        const x = daysBetween(viewStart, cursor) * dayWidth;
        ticks.push({ label: `${cursor.getFullYear()}`, x });
        cursor.setFullYear(cursor.getFullYear() + 1);
      }
    }
    return ticks;
  });

  // Today marker
  let todayX = $derived.by(() => {
    const today = new Date();
    return daysBetween(viewStart, today) * dayWidth;
  });

  // Dependencies as arrow paths
  type DepLine = { x1: number; y1: number; x2: number; y2: number };

  let depLines = $derived.by((): DepLine[] => {
    if (!showDependencies) return [];
    const lines: DepLine[] = [];
    for (const task of tasks) {
      if (!task.dependencies?.length) continue;
      const targetIdx = taskRowIndex(task);
      if (targetIdx < 0) continue;
      const tx = taskX(task);
      const ty = HEADER_HEIGHT + targetIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

      for (const depId of task.dependencies) {
        const src = tasks.find((t) => t.id === depId);
        if (!src) continue;
        const srcIdx = taskRowIndex(src);
        if (srcIdx < 0) continue;
        const sx = taskX(src) + taskW(src);
        const sy = HEADER_HEIGHT + srcIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
        lines.push({ x1: sx, y1: sy, x2: tx, y2: ty });
      }
    }
    return lines;
  });

  function depPath(d: DepLine): string {
    const midX = d.x1 + (d.x2 - d.x1) / 2;
    return `M${d.x1},${d.y1} C${midX},${d.y1} ${midX},${d.y2} ${d.x2},${d.y2}`;
  }

  function onBarMouseMove(e: MouseEvent, task: Task) {
    hoveredTask = task;
    if (containerEl) {
      const bounds = containerEl.getBoundingClientRect();
      tooltipPos = { x: e.clientX - bounds.left + 12, y: e.clientY - bounds.top - 8 };
    }
  }

  function onBarMouseLeave() {
    hoveredTask = null;
  }

  function formatDate(s: string): string {
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  // --- Drag to move ---
  let dragging: { task: Task; startMouseX: number; origTaskX: number; duration: number } | null = $state(null);

  function onBarDragStart(e: MouseEvent, task: Task) {
    if (!onTaskMove) return;
    e.preventDefault();
    const duration = daysBetween(parseDate(task.start), parseDate(task.end));
    const scrollLeft = containerEl?.querySelector('.cy-gantt__timeline')?.scrollLeft ?? 0;
    dragging = {
      task,
      startMouseX: e.clientX,
      origTaskX: taskX(task),
      duration,
    };

    function onMouseMove(ev: MouseEvent) {
      if (!dragging) return;
      const dx = ev.clientX - dragging.startMouseX;
      const newX = dragging.origTaskX + dx;
      const dayOffset = newX / dayWidth;
      const newStartDate = new Date(viewStart);
      newStartDate.setDate(newStartDate.getDate() + Math.round(dayOffset));
      // Update visual position via CSS transform on the dragged bars
      const bars = containerEl?.querySelectorAll(`[data-task-id="${dragging.task.id}"]`);
      bars?.forEach(el => {
        (el as SVGElement).setAttribute('transform', `translate(${dx}, 0)`);
      });
    }

    function onMouseUp(ev: MouseEvent) {
      if (!dragging) return;
      const dx = ev.clientX - dragging.startMouseX;
      const dayShift = Math.round(dx / dayWidth);
      if (dayShift !== 0) {
        const oldStart = parseDate(dragging.task.start);
        const newStart = new Date(oldStart);
        newStart.setDate(newStart.getDate() + dayShift);
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + dragging.duration);
        const fmt = (d: Date) => d.toISOString().split('T')[0];
        onTaskMove?.(dragging.task, fmt(newStart), fmt(newEnd));
      }
      // Reset transforms
      const bars = containerEl?.querySelectorAll(`[data-task-id="${dragging.task.id}"]`);
      bars?.forEach(el => {
        (el as SVGElement).removeAttribute('transform');
      });
      dragging = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
</script>

<div class="cy-gantt" style="height: {height};" bind:this={containerEl}>
  <div class="cy-gantt__labels" style="width: {LABEL_WIDTH}px;">
    <div class="cy-gantt__labels-header" style="height: {HEADER_HEIGHT}px;">Tasks</div>
    {#each rows as row}
      {#if row.type === "group"}
        <button
          class="cy-gantt__group-row"
          style="height: {ROW_HEIGHT}px;"
          onclick={() => toggleGroup(row.group)}
        >
          <span class="cy-gantt__group-chevron" class:cy-gantt__group-chevron--collapsed={collapsedGroups.has(row.group)}>&#9660;</span>
          {row.group}
        </button>
      {:else}
        <div class="cy-gantt__task-label" style="height: {ROW_HEIGHT}px;">
          {row.task.label}
        </div>
      {/if}
    {/each}
  </div>

  <div class="cy-gantt__timeline">
    <svg
      width={timelineWidth}
      height={svgHeight}
      class="cy-gantt__svg"
      role="img"
      aria-label="Gantt chart"
    >
      <!-- Grid lines -->
      {#each headerTicks as tick}
        <line
          x1={tick.x}
          y1={HEADER_HEIGHT}
          x2={tick.x}
          y2={svgHeight}
          class="cy-gantt__grid-line"
        />
      {/each}

      <!-- Header ticks -->
      {#each headerTicks as tick}
        <text
          x={tick.x + 4}
          y={HEADER_HEIGHT - 10}
          class="cy-gantt__header-text"
        >{tick.label}</text>
      {/each}

      <!-- Header bottom line -->
      <line x1="0" y1={HEADER_HEIGHT} x2={timelineWidth} y2={HEADER_HEIGHT} class="cy-gantt__header-line" />

      <!-- Group rows background -->
      {#each rows as row, i}
        {#if row.type === "group"}
          <rect
            x="0"
            y={HEADER_HEIGHT + i * ROW_HEIGHT}
            width={timelineWidth}
            height={ROW_HEIGHT}
            class="cy-gantt__group-bg"
          />
        {/if}
      {/each}

      <!-- Row separator lines -->
      {#each rows as _, i}
        <line
          x1="0"
          y1={HEADER_HEIGHT + (i + 1) * ROW_HEIGHT}
          x2={timelineWidth}
          y2={HEADER_HEIGHT + (i + 1) * ROW_HEIGHT}
          class="cy-gantt__row-line"
        />
      {/each}

      <!-- Dependency arrows -->
      {#each depLines as dep}
        <path
          d={depPath(dep)}
          class="cy-gantt__dep-line"
          marker-end="url(#arrowhead)"
        />
      {/each}

      <!-- Arrow marker -->
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" class="cy-gantt__arrow" />
        </marker>
      </defs>

      <!-- Task bars -->
      {#each rows as row, i}
        {#if row.type === "task"}
          {@const t = row.task}
          {@const x = taskX(t)}
          {@const w = taskW(t)}
          {@const y = HEADER_HEIGHT + i * ROW_HEIGHT + BAR_Y_OFFSET}
          <!-- Bar background -->
          <rect
            {x}
            {y}
            width={w}
            height={BAR_HEIGHT}
            rx="4"
            ry="4"
            fill={taskColor(t)}
            opacity="0.35"
            class="cy-gantt__bar"
            class:cy-gantt__bar--draggable={!!onTaskMove}
            data-task-id={t.id}
            onmouseenter={(e) => onBarMouseMove(e, t)}
            onmousemove={(e) => onBarMouseMove(e, t)}
            onmouseleave={onBarMouseLeave}
            onmousedown={(e) => onBarDragStart(e, t)}
            ondblclick={() => onTaskClick?.(t)}
            role="button"
            tabindex="0"
          />
          <!-- Progress fill -->
          {#if showProgress && (t.progress ?? 0) > 0}
            <rect
              {x}
              {y}
              width={w * ((t.progress ?? 0) / 100)}
              height={BAR_HEIGHT}
              rx="4"
              ry="4"
              fill={taskColor(t)}
              opacity="0.85"
              class="cy-gantt__bar-progress"
              data-task-id={t.id}
              pointer-events="none"
            />
          {/if}
          <!-- Bar label inside if it fits -->
          {#if w > 60}
            <text
              x={x + 8}
              y={y + BAR_HEIGHT / 2 + 1}
              class="cy-gantt__bar-text"
              dominant-baseline="central"
              data-task-id={t.id}
              pointer-events="none"
            >{t.label}</text>
          {/if}
        {/if}
      {/each}

      <!-- Today marker -->
      {#if showToday && todayX >= 0 && todayX <= timelineWidth}
        <line
          x1={todayX}
          y1={HEADER_HEIGHT}
          x2={todayX}
          y2={svgHeight}
          class="cy-gantt__today-line"
        />
      {/if}
    </svg>
  </div>

  <!-- Tooltip -->
  {#if hoveredTask}
    <div class="cy-gantt__tooltip" style="left: {tooltipPos.x + LABEL_WIDTH}px; top: {tooltipPos.y}px;">
      <span class="cy-gantt__tooltip-label">{hoveredTask.label}</span>
      <span class="cy-gantt__tooltip-dates">{formatDate(hoveredTask.start)} - {formatDate(hoveredTask.end)}</span>
      {#if showProgress && hoveredTask.progress != null}
        <span class="cy-gantt__tooltip-progress">{hoveredTask.progress}%</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cy-gantt {
    position: relative;
    display: flex;
    font-family: var(--font-body);
    overflow: hidden;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    background: var(--color-surface-default);
  }

  .cy-gantt__labels {
    flex-shrink: 0;
    border-right: 1px solid var(--color-border-subtle);
    overflow: hidden;
    background: var(--color-surface-default);
    z-index: 2;
  }

  .cy-gantt__labels-header {
    display: flex;
    align-items: center;
    padding: 0 12px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    background: var(--color-surface-raised);
  }

  .cy-gantt__group-row {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 12px;
    gap: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    background: var(--color-surface-raised);
    border: none;
    border-bottom: 1px solid var(--color-border-subtle);
    cursor: pointer;
    font-family: var(--font-body);
    text-align: left;
  }

  .cy-gantt__group-row:hover {
    background: var(--color-surface-hover);
  }

  .cy-gantt__group-chevron {
    font-size: 0.55rem;
    transition: transform 150ms ease;
    color: var(--color-text-tertiary);
  }

  .cy-gantt__group-chevron--collapsed {
    transform: rotate(-90deg);
  }

  .cy-gantt__task-label {
    display: flex;
    align-items: center;
    padding: 0 12px 0 24px;
    font-size: 0.7rem;
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cy-gantt__timeline {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .cy-gantt__svg {
    display: block;
  }

  .cy-gantt__grid-line {
    stroke: var(--color-border-subtle);
    stroke-width: 0.5;
  }

  .cy-gantt__header-text {
    font-size: 9px;
    fill: var(--color-text-tertiary);
    font-family: var(--font-mono);
  }

  .cy-gantt__header-line {
    stroke: var(--color-border-subtle);
    stroke-width: 1;
  }

  .cy-gantt__group-bg {
    fill: var(--color-surface-raised);
    opacity: 0.6;
  }

  .cy-gantt__row-line {
    stroke: var(--color-border-subtle);
    stroke-width: 0.5;
    opacity: 0.5;
  }

  .cy-gantt__bar {
    cursor: pointer;
    transition: opacity 150ms ease;
  }

  .cy-gantt__bar--draggable {
    cursor: grab;
  }

  .cy-gantt__bar--draggable:active {
    cursor: grabbing;
  }

  .cy-gantt__bar:hover {
    opacity: 0.55;
  }

  .cy-gantt__bar-progress {
    pointer-events: none;
  }

  .cy-gantt__bar-text {
    font-size: 9px;
    fill: var(--color-text-primary);
    font-family: var(--font-body);
    font-weight: 500;
  }

  .cy-gantt__dep-line {
    fill: none;
    stroke: var(--color-text-tertiary);
    stroke-width: 1.5;
    stroke-dasharray: 4 2;
    opacity: 0.6;
  }

  .cy-gantt__arrow {
    fill: var(--color-text-tertiary);
    opacity: 0.6;
  }

  .cy-gantt__today-line {
    stroke: var(--color-state-error);
    stroke-width: 1.5;
    stroke-dasharray: 6 3;
    opacity: 0.8;
  }

  .cy-gantt__tooltip {
    position: absolute;
    background: var(--color-surface-overlay);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 0.7rem;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cy-gantt__tooltip-label {
    color: var(--color-text-primary);
    font-weight: 600;
    font-family: var(--font-body);
  }

  .cy-gantt__tooltip-dates {
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.65rem;
  }

  .cy-gantt__tooltip-progress {
    color: var(--color-action-brand-default);
    font-family: var(--font-mono);
    font-size: 0.65rem;
  }
</style>
