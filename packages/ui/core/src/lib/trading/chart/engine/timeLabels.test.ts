import { describe, expect, it } from "vitest";
import {
  boundaryLevel,
  bucketOf,
  inferInterval,
  intervalName,
  pickUnit,
  spaceTicks,
  TimeFormatter,
  timeTicks,
  TIME_UNITS,
  ZoneClock,
} from "./timeLabels.js";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("time labels", () => {
  it("infers the bar interval from the median spacing", () => {
    const times = [0, HOUR, 2 * HOUR, 3 * HOUR, 3 * HOUR + 3 * DAY, 4 * HOUR + 3 * DAY];
    expect(inferInterval((i) => times[i], times.length)).toBe(HOUR);
    expect(inferInterval(() => 0, 1)).toBe(MIN);
  });

  it("picks a unit that keeps labels apart", () => {
    // 1h bars at 8px: 90px needs ≥ 11.25 bars → 12h.
    expect(pickUnit(HOUR, 8, 90).ms).toBe(12 * HOUR);
    expect(pickUnit(HOUR, 60, 90).ms).toBe(2 * HOUR);
    expect(pickUnit(DAY, 2, 90).kind).toBe("month");
    expect(pickUnit(DAY, 0.01, 90)).toBe(TIME_UNITS[TIME_UNITS.length - 1]);
    expect(pickUnit(5 * MIN, 100, 90).ms).toBe(5 * MIN);
  });

  it("converts instants to local parts in a time zone", () => {
    const t = Date.UTC(2026, 2, 12, 3, 30);
    expect(new ZoneClock("UTC").parts(t)).toMatchObject({ year: 2026, month: 2, day: 12, wall: t });
    // New York is UTC−4 on 12 March 2026 (DST started 8 March).
    const ny = new ZoneClock("America/New_York").parts(t);
    expect(ny).toMatchObject({ day: 11, wall: t - 4 * HOUR });
    const winter = new ZoneClock("America/New_York").parts(Date.UTC(2026, 0, 12, 12));
    expect(winter.wall).toBe(Date.UTC(2026, 0, 12, 7));
  });

  it("buckets by fixed durations, weeks, months and years", () => {
    const parts = new ZoneClock("UTC").parts(Date.UTC(2026, 4, 20, 13, 45));
    const unit = (i: number) => TIME_UNITS[i];
    expect(bucketOf(parts, unit(4))).toBe(Math.floor(parts.wall / HOUR));
    const monday = new ZoneClock("UTC").parts(Date.UTC(2026, 4, 18));
    const sunday = new ZoneClock("UTC").parts(Date.UTC(2026, 4, 17));
    const week = TIME_UNITS.find((u) => u.kind === "week")!;
    expect(bucketOf(monday, week)).toBe(bucketOf(parts, week));
    expect(bucketOf(sunday, week)).toBe(bucketOf(parts, week) - 1);
    const quarter = TIME_UNITS.find((u) => u.kind === "month" && u.step === 3)!;
    expect(bucketOf(parts, quarter)).toBe(Math.floor((2026 * 12 + 4) / 3));
    const year = TIME_UNITS.find((u) => u.kind === "year")!;
    expect(bucketOf(parts, year)).toBe(2026);
  });

  it("labels the coarsest boundary crossed", () => {
    const clock = new ZoneClock("UTC");
    const p = (y: number, m: number, d: number, h = 0) => clock.parts(Date.UTC(y, m, d, h));
    expect(boundaryLevel(null, p(2026, 0, 1))).toBe("year");
    expect(boundaryLevel(p(2025, 11, 31), p(2026, 0, 1))).toBe("year");
    expect(boundaryLevel(p(2026, 0, 31), p(2026, 1, 1))).toBe("month");
    expect(boundaryLevel(p(2026, 1, 1), p(2026, 1, 2))).toBe("day");
    expect(boundaryLevel(p(2026, 1, 2, 1), p(2026, 1, 2, 2))).toBe("time");
  });

  it("places ticks where the bucket changes", () => {
    const start = Date.UTC(2026, 0, 1, 20);
    const times = (i: number) => start + i * HOUR;
    const sixHours = TIME_UNITS.find((u) => u.ms === 6 * HOUR)!;
    const ticks = timeTicks(times, 1, 12, sixHours, new ZoneClock("UTC"));
    // Buckets change at 00:00 (index 4, a new day) and 06:00 (index 10).
    expect(ticks).toEqual([
      { index: 4, level: "day" },
      { index: 10, level: "time" },
    ]);
    expect(timeTicks(times, 5, 4, sixHours, new ZoneClock("UTC"))).toEqual([]);
    expect(timeTicks(times, 0, 0, sixHours, new ZoneClock("UTC"))[0].level).toBe("year");
  });

  it("drops labels that would overlap", () => {
    expect(spaceTicks([{ x: 0 }, { x: 30 }, { x: 60 }, { x: 70 }, { x: 130 }], 50)).toEqual([
      { x: 0 },
      { x: 60 },
      { x: 130 },
    ]);
  });

  it("formats labels in the chart's time zone", () => {
    const t = Date.UTC(2026, 2, 12, 3, 30);
    const utc = new TimeFormatter("UTC", "en-GB");
    expect(utc.tickLabel(t, "time")).toBe("03:30");
    expect(utc.tickLabel(t, "day")).toBe("12 Mar");
    expect(utc.tickLabel(t, "month")).toBe("Mar");
    expect(utc.tickLabel(t, "year")).toBe("2026");
    const tokyo = new TimeFormatter("Asia/Tokyo", "en-GB");
    expect(tokyo.tickLabel(t, "time")).toBe("12:30");
    expect(utc.crosshairLabel(t, HOUR)).toContain("03:30");
    expect(utc.crosshairLabel(t, DAY)).not.toContain("03:30");
  });

  it("names intervals", () => {
    expect(intervalName(MIN)).toBe("1m");
    expect(intervalName(15 * MIN)).toBe("15m");
    expect(intervalName(4 * HOUR)).toBe("4h");
    expect(intervalName(DAY)).toBe("1D");
    expect(intervalName(7 * DAY)).toBe("1W");
    expect(intervalName(30 * DAY)).toBe("1M");
    expect(intervalName(90_000)).toBe("2m");
  });
});
