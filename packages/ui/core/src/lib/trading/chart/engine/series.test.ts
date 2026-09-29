import { describe, expect, it } from "vitest";
import { makeCandles } from "../../../_testdata/canvas.js";
import { classifyChange, indexAtTime, snapshotOf } from "./series.js";

const HOUR = 3_600_000;

describe("series changes", () => {
  const base = makeCandles(10);
  const snap = snapshotOf(base);

  it("snapshots length and first / last time", () => {
    expect(snap).toEqual({ length: 10, firstTime: base[0].time, lastTime: base[9].time });
    expect(snapshotOf([])).toBeNull();
  });

  it("detects a replaced last bar", () => {
    const next = [...base.slice(0, 9), { ...base[9], close: 1 }];
    expect(classifyChange(snap, next)).toEqual({ kind: "update" });
  });

  it("detects appended bars", () => {
    const more = makeCandles(12);
    expect(classifyChange(snap, more)).toEqual({ kind: "append", count: 2 });
  });

  it("treats anything else as a reset", () => {
    expect(classifyChange(null, base)).toEqual({ kind: "reset" });
    expect(classifyChange(snap, base.slice(0, 5))).toEqual({ kind: "reset" });
    expect(classifyChange(snap, makeCandles(10, Date.UTC(2020, 0, 1)))).toEqual({ kind: "reset" });
    const shifted = [...base.slice(0, 9), { ...base[9], time: base[9].time + HOUR }];
    expect(classifyChange(snap, shifted)).toEqual({ kind: "reset" });
    const inserted = [...base.slice(0, 9), { ...base[9], time: base[9].time - 1 }, base[9]];
    expect(classifyChange(snap, inserted)).toEqual({ kind: "reset" });
  });

  it("finds the bar containing a time", () => {
    expect(indexAtTime(base, base[3].time)).toBe(3);
    expect(indexAtTime(base, base[3].time + HOUR / 2)).toBe(3);
    expect(indexAtTime(base, base[0].time - 1)).toBe(-1);
    expect(indexAtTime(base, base[9].time + 10 * HOUR)).toBe(9);
    expect(indexAtTime([], 0)).toBe(-1);
  });
});
