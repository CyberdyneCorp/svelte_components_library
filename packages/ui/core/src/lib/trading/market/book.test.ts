import { describe, it, expect } from "vitest";
import {
  bestLevel,
  buildBook,
  computeSpread,
  defaultGroupingOptions,
  groupLevels,
  isLiveLevel,
  resolveGrouping,
  trimZeros,
} from "./book.js";

const bids = [
  { price: "64000.0", size: "1" },
  { price: "63999.5", size: "2" },
  { price: "63999.0", size: "3" },
];

describe("groupLevels", () => {
  it("aggregates bids by grouping (spec scenario)", () => {
    expect(groupLevels(bids, "1", "bid")).toEqual([
      { price: "64000", size: "1" },
      { price: "63999", size: "5" },
    ]);
  });

  it("groups bids down and asks up", () => {
    const asks = [
      { price: "64000.5", size: "0.1" },
      { price: "64001.0", size: "0.2" },
      { price: "64001.5", size: "0.3" },
    ];
    expect(groupLevels(asks, "1", "ask")).toEqual([
      { price: "64001", size: "0.3" },
      { price: "64002", size: "0.3" },
    ]);
    expect(groupLevels(asks, "1", "bid")).toEqual([
      { price: "64001", size: "0.5" },
      { price: "64000", size: "0.1" },
    ]);
  });

  it("sums sizes exactly with mixed precision", () => {
    const levels = [
      { price: "10.1", size: "0.1" },
      { price: "10.2", size: "0.2" },
      { price: "10.3", size: "0.000000001" },
    ];
    expect(groupLevels(levels, "1", "bid")).toEqual([{ price: "10", size: "0.300000001" }]);
  });

  it("drops zero, negative and malformed levels", () => {
    const levels = [
      { price: "10", size: "0" },
      { price: "11", size: "-1" },
      { price: "abc", size: "1" },
      { price: "12", size: "" },
      { price: "13", size: "2" },
    ];
    expect(groupLevels(levels, "1", "ask")).toEqual([{ price: "13", size: "2" }]);
  });

  it("sorts best first whatever the input order", () => {
    const shuffled = [
      { price: "9", size: "1" },
      { price: "11", size: "1" },
      { price: "10", size: "1" },
    ];
    expect(groupLevels(shuffled, "1", "bid").map((l) => l.price)).toEqual(["11", "10", "9"]);
    expect(groupLevels(shuffled, "1", "ask").map((l) => l.price)).toEqual(["9", "10", "11"]);
  });

  it("keeps the grouping's precision in the level price", () => {
    expect(groupLevels([{ price: "1.234", size: "1" }], "0.01", "bid")).toEqual([
      { price: "1.23", size: "1" },
    ]);
  });
});

describe("buildBook", () => {
  const asks = [
    { price: "64000.5", size: "1" },
    { price: "64001.0", size: "1" },
    { price: "64001.5", size: "2" },
  ];

  it("adds cumulative totals and depth relative to the deeper side", () => {
    const book = buildBook({ bids, asks, grouping: "0.5", levels: 10 });
    expect(book.bids.map((row) => row.total)).toEqual(["1", "3", "6"]);
    expect(book.asks.map((row) => row.total)).toEqual(["1", "2", "4"]);
    expect(book.bids.map((row) => row.depth)).toEqual([1 / 6, 3 / 6, 1]);
    expect(book.asks[2].depth).toBeCloseTo(4 / 6);
  });

  it("limits levels per side before totalling", () => {
    const book = buildBook({ bids, asks, grouping: "0.5", levels: 2 });
    expect(book.bids).toHaveLength(2);
    expect(book.asks).toHaveLength(2);
    expect(book.bids.at(-1)?.depth).toBe(1);
  });

  it("computes the spread from the raw best levels", () => {
    const book = buildBook({ bids, asks, grouping: "10", levels: 5 });
    expect(book.spread?.absolute).toBe("0.5");
    expect(book.spread?.crossed).toBe(false);
    expect(book.spread?.percent).toBeCloseTo((0.5 / 64000.25) * 100, 10);
  });

  it("handles an empty book", () => {
    const book = buildBook({ bids: [], asks: [], grouping: "1", levels: 5 });
    expect(book).toEqual({ bids: [], asks: [], spread: null });
  });

  it("handles a one-sided book", () => {
    const book = buildBook({ bids, asks: [], grouping: "1", levels: 5 });
    expect(book.asks).toEqual([]);
    expect(book.spread).toBeNull();
    expect(book.bids[0].depth).toBeCloseTo(1 / 6);
  });

  it("flags a crossed book", () => {
    const book = buildBook({
      bids: [{ price: "101", size: "1" }],
      asks: [{ price: "100", size: "1" }],
      grouping: "1",
      levels: 5,
    });
    expect(book.spread).toMatchObject({ absolute: "-1", crossed: true });
    expect(book.spread?.percent).toBeLessThan(0);
  });

  it("treats a locked book (zero spread) as crossed", () => {
    expect(computeSpread({ price: "100", size: "1" }, { price: "100.0", size: "1" })).toMatchObject({
      absolute: "0.0",
      crossed: true,
      percent: 0,
    });
  });

  it("ignores zero-size levels for the best price", () => {
    expect(bestLevel([{ price: "105", size: "0" }, { price: "100", size: "1" }], "bid")?.price).toBe("100");
  });

  it("treats a non-positive levels count as zero", () => {
    expect(buildBook({ bids, asks, grouping: "1", levels: -3 }).bids).toEqual([]);
  });
});

describe("grouping helpers", () => {
  it("offers tick × 1, 10, 100, 1000", () => {
    expect(defaultGroupingOptions("0.5")).toEqual(["0.5", "5.0", "50.0", "500.0"]);
    expect(defaultGroupingOptions("1")).toEqual(["1", "10", "100", "1000"]);
  });

  it("falls back to the tick size for an invalid grouping", () => {
    expect(resolveGrouping("1", "0.5")).toBe("1");
    expect(resolveGrouping("0.75", "0.5")).toBe("0.5");
    expect(resolveGrouping("0", "0.5")).toBe("0.5");
    expect(resolveGrouping("x", "0.5")).toBe("0.5");
    expect(resolveGrouping(undefined, "0.5")).toBe("0.5");
  });

  it("trims trailing zeros for display", () => {
    expect(trimZeros("5.0")).toBe("5");
    expect(trimZeros("0.10")).toBe("0.1");
    expect(trimZeros("100")).toBe("100");
  });

  it("recognises live levels", () => {
    expect(isLiveLevel({ price: "1", size: "0.001" })).toBe(true);
    expect(isLiveLevel({ price: "1", size: "0.000" })).toBe(false);
    expect(isLiveLevel(null)).toBe(false);
  });
});
