/** Units used for relative time, smallest first. */
export type RelativeTimeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

/** A signed whole amount of one unit: `{ value: -3, unit: "minute" }` is "3 minutes ago". */
export interface RelativeTimeParts {
  value: number;
  unit: RelativeTimeUnit;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Unit sizes in ms, largest first. Months and years use average lengths. */
const UNITS: [RelativeTimeUnit, number][] = [
  ["year", 365.25 * DAY],
  ["month", 30.4375 * DAY],
  ["week", 7 * DAY],
  ["day", DAY],
  ["hour", HOUR],
  ["minute", MINUTE],
];

/**
 * The largest whole unit between `date` and `now`, signed: negative for the
 * past, positive for the future. Below one minute the unit is seconds.
 */
export function relativeParts(date: Date, now: Date): RelativeTimeParts {
  const diff = date.getTime() - now.getTime();
  const match = UNITS.find(([, size]) => Math.abs(diff) >= size);
  const [unit, size] = match ?? ["second", SECOND];
  // `|| 0` turns -0 into 0 so Intl reads "now" rather than "0 seconds ago".
  return { value: Math.trunc(diff / size) || 0, unit };
}

/** How often a live relative label needs re-rendering, by distance from `now`. */
export function refreshInterval(date: Date, now: Date): number {
  const distance = Math.abs(date.getTime() - now.getTime());
  if (distance < MINUTE) return 10 * SECOND;
  if (distance < HOUR) return MINUTE;
  return HOUR;
}

/** Parses a Date, ISO string or epoch ms; `null` when the result is not a valid date. */
export function toDate(value: Date | string | number): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
