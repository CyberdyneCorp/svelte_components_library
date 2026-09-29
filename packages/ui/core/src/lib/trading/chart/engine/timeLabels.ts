/**
 * Time-axis labels (design D3). A label unit is picked so labels stay about
 * `minSpacing` px apart at the current zoom; a bar gets a label when it is
 * the first bar of a new unit bucket in the chart's time zone. The label
 * shows the coarsest calendar boundary it crosses (year, month, day, time).
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type UnitKind = "fixed" | "week" | "month" | "year";

export interface TimeUnit {
  kind: UnitKind;
  /** Approximate duration, used to pick the unit. */
  ms: number;
  /** Multiple of months (month kind) or years (year kind). */
  step: number;
}

const fixed = (ms: number): TimeUnit => ({ kind: "fixed", ms, step: 1 });

export const TIME_UNITS: readonly TimeUnit[] = [
  fixed(MINUTE),
  fixed(5 * MINUTE),
  fixed(15 * MINUTE),
  fixed(30 * MINUTE),
  fixed(HOUR),
  fixed(2 * HOUR),
  fixed(4 * HOUR),
  fixed(6 * HOUR),
  fixed(12 * HOUR),
  fixed(DAY),
  { kind: "week", ms: 7 * DAY, step: 1 },
  { kind: "month", ms: 30 * DAY, step: 1 },
  { kind: "month", ms: 91 * DAY, step: 3 },
  { kind: "month", ms: 182 * DAY, step: 6 },
  { kind: "year", ms: 365 * DAY, step: 1 },
  { kind: "year", ms: 5 * 365 * DAY, step: 5 },
];

/** Median spacing of the last bars; 1 minute when unknown. */
export function inferInterval(times: (i: number) => number, count: number): number {
  const diffs: number[] = [];
  for (let i = Math.max(1, count - 50); i < count; i++) {
    const d = times(i) - times(i - 1);
    if (d > 0) diffs.push(d);
  }
  if (diffs.length === 0) return MINUTE;
  diffs.sort((a, b) => a - b);
  return diffs[Math.floor(diffs.length / 2)];
}

/** Smallest unit whose labels land at least `minSpacing` px apart (and not finer than a bar). */
export function pickUnit(interval: number, barSpacing: number, minSpacing: number): TimeUnit {
  const units = TIME_UNITS.filter((unit) => unit.ms >= interval);
  return (
    units.find((unit) => (unit.ms / interval) * barSpacing >= minSpacing) ??
    TIME_UNITS[TIME_UNITS.length - 1]
  );
}

/** Local calendar fields of an instant in the chart's time zone. */
export interface LocalParts {
  year: number;
  month: number;
  day: number;
  /** Local wall-clock ms since the Unix epoch (for fixed-duration buckets). */
  wall: number;
}

/** Converts instants to local parts in `timeZone`, caching the zone offset per quarter hour. */
export class ZoneClock {
  private readonly offsets = new Map<number, number>();
  private readonly partsFormat: Intl.DateTimeFormat;

  constructor(readonly timeZone: string) {
    this.partsFormat = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  }

  parts(time: number): LocalParts {
    const wall = time + this.offset(time);
    const date = new Date(wall);
    return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate(), wall };
  }

  private offset(time: number): number {
    const key = Math.floor(time / (15 * MINUTE));
    let offset = this.offsets.get(key);
    if (offset === undefined) {
      offset = this.computeOffset(time);
      this.offsets.set(key, offset);
    }
    return offset;
  }

  private computeOffset(time: number): number {
    const values: Record<string, number> = {};
    for (const part of this.partsFormat.formatToParts(time)) {
      if (part.type !== "literal") values[part.type] = Number(part.value);
    }
    const wall = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second);
    return wall - (time - (((time % 1000) + 1000) % 1000));
  }
}

/** Bucket id of an instant for `unit`; a label goes where the bucket changes. */
export function bucketOf(parts: LocalParts, unit: TimeUnit): number {
  switch (unit.kind) {
    case "fixed":
      return Math.floor(parts.wall / unit.ms);
    case "week":
      // Epoch day 0 was a Thursday; +3 makes weeks start on Monday.
      return Math.floor((Math.floor(parts.wall / DAY) + 3) / 7);
    case "month":
      return Math.floor((parts.year * 12 + parts.month) / unit.step);
    case "year":
      return Math.floor(parts.year / unit.step);
  }
}

export type LabelLevel = "year" | "month" | "day" | "time";

/** Coarsest calendar boundary between two consecutive bars. */
export function boundaryLevel(prev: LocalParts | null, next: LocalParts): LabelLevel {
  if (!prev || prev.year !== next.year) return "year";
  if (prev.month !== next.month) return "month";
  if (prev.day !== next.day) return "day";
  return "time";
}

export interface TimeTick {
  index: number;
  level: LabelLevel;
}

/**
 * Indices in [first, last] that start a new `unit` bucket. The first
 * visible bar is only labelled if it starts a bucket too.
 */
export function timeTicks(
  times: (i: number) => number,
  first: number,
  last: number,
  unit: TimeUnit,
  clock: ZoneClock,
): TimeTick[] {
  const ticks: TimeTick[] = [];
  if (last < first) return ticks;
  let prev = first > 0 ? clock.parts(times(first - 1)) : null;
  for (let i = first; i <= last; i++) {
    const parts = clock.parts(times(i));
    if (!prev || bucketOf(prev, unit) !== bucketOf(parts, unit)) {
      ticks.push({ index: i, level: boundaryLevel(prev, parts) });
    }
    prev = parts;
  }
  return ticks;
}

/** Drops ticks closer than `minGap` px to the previously kept one. */
export function spaceTicks<T extends { x: number }>(ticks: T[], minGap: number): T[] {
  const kept: T[] = [];
  for (const tick of ticks) {
    if (kept.length === 0 || tick.x - kept[kept.length - 1].x >= minGap) kept.push(tick);
  }
  return kept;
}

type FormatKind = LabelLevel | "crosshair" | "crosshairDate" | "full";

const FORMATS: Record<FormatKind, Intl.DateTimeFormatOptions> = {
  year: { year: "numeric" },
  month: { month: "short" },
  day: { day: "numeric", month: "short" },
  time: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
  crosshair: {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  },
  crosshairDate: { weekday: "short", day: "numeric", month: "short", year: "numeric" },
  full: { dateStyle: "medium", timeStyle: "short", hourCycle: "h23" } as Intl.DateTimeFormatOptions,
};

/** Cached Intl date formatters for one locale and time zone. */
export class TimeFormatter {
  private readonly cache = new Map<FormatKind, Intl.DateTimeFormat>();

  constructor(
    readonly timeZone: string,
    readonly locale?: string,
  ) {}

  format(time: number, kind: FormatKind): string {
    let formatter = this.cache.get(kind);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(this.locale, { ...FORMATS[kind], timeZone: this.timeZone });
      this.cache.set(kind, formatter);
    }
    return formatter.format(time);
  }

  /** Axis label for the coarsest boundary a tick crosses ("2026", "Mar", "12 Mar", "08:00"). */
  tickLabel(time: number, level: LabelLevel): string {
    return this.format(time, level);
  }

  /** Crosshair label; the time of day is omitted for daily and longer bars. */
  crosshairLabel(time: number, interval: number): string {
    return this.format(time, interval >= DAY ? "crosshairDate" : "crosshair");
  }
}

/** Short interval name such as "1m", "4h", "1D", "1W", "1M". */
export function intervalName(ms: number): string {
  const units: [number, string][] = [
    [30 * DAY, "M"],
    [7 * DAY, "W"],
    [DAY, "D"],
    [HOUR, "h"],
    [MINUTE, "m"],
  ];
  for (const [size, suffix] of units) {
    if (ms >= size && ms % size === 0) return `${ms / size}${suffix}`;
  }
  const minutes = Math.max(1, Math.round(ms / MINUTE));
  return `${minutes}m`;
}
