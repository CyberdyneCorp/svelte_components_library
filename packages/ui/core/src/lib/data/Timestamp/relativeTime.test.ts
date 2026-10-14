import { describe, it, expect } from "vitest";
import { refreshInterval, relativeParts, toDate } from "./relativeTime.js";

const now = new Date("2026-10-14T12:00:00Z");
const offset = (ms: number) => new Date(now.getTime() + ms);
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("relativeParts", () => {
  it.each([
    [-30_000, { value: -30, unit: "second" }],
    [0, { value: 0, unit: "second" }],
    [-500, { value: 0, unit: "second" }],
    [-3 * MIN, { value: -3, unit: "minute" }],
    [2 * HOUR, { value: 2, unit: "hour" }],
    [-DAY, { value: -1, unit: "day" }],
    [-8 * DAY, { value: -1, unit: "week" }],
    [-45 * DAY, { value: -1, unit: "month" }],
    [3 * 366 * DAY, { value: 3, unit: "year" }],
  ])("maps a %d ms offset to %o", (ms, expected) => {
    expect(relativeParts(offset(ms), now)).toEqual(expected);
  });

  it("never returns negative zero", () => {
    expect(Object.is(relativeParts(offset(-500), now).value, -0)).toBe(false);
  });
});

describe("refreshInterval", () => {
  it("refreshes faster the closer the date is", () => {
    expect(refreshInterval(offset(-30_000), now)).toBe(10_000);
    expect(refreshInterval(offset(-10 * MIN), now)).toBe(MIN);
    expect(refreshInterval(offset(-3 * HOUR), now)).toBe(HOUR);
  });
});

describe("toDate", () => {
  it("accepts dates, ISO strings and epoch ms, and rejects junk", () => {
    expect(toDate(now)).toBe(now);
    expect(toDate("2026-10-14T12:00:00Z")?.getTime()).toBe(now.getTime());
    expect(toDate(now.getTime())?.getTime()).toBe(now.getTime());
    expect(toDate("not a date")).toBeNull();
  });
});
