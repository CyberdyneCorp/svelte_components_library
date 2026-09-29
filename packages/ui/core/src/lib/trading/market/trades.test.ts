import { describe, it, expect } from "vitest";
import type { Trade } from "../types.js";
import { freshTradeIds, listWindow, newestFirst } from "./trades.js";

const trade = (id: string, time: number): Trade => ({ id, time, price: "1", size: "1", side: "buy" });

describe("newestFirst", () => {
  it("returns an ordered list untouched", () => {
    const list = [trade("b", 2), trade("a", 1)];
    expect(newestFirst(list)).toBe(list);
  });

  it("sorts an unordered list without mutating it", () => {
    const list = [trade("a", 1), trade("c", 3), trade("b", 2)];
    expect(newestFirst(list).map((t) => t.id)).toEqual(["c", "b", "a"]);
    expect(list[0].id).toBe("a");
  });
});

describe("freshTradeIds", () => {
  it("collects ids above the first known trade", () => {
    const previous = new Set(["b", "a"]);
    expect([...freshTradeIds(previous, [trade("d", 4), trade("c", 3), trade("b", 2), trade("a", 1)])]).toEqual([
      "d",
      "c",
    ]);
  });

  it("is empty when nothing is new", () => {
    expect(freshTradeIds(new Set(["a"]), [trade("a", 1)]).size).toBe(0);
  });
});

describe("listWindow", () => {
  it("renders the viewport plus overscan", () => {
    expect(listWindow(1000, 0, 240, 24, 5)).toEqual({ start: 0, end: 15, padTop: 0, padBottom: 985 * 24 });
    expect(listWindow(1000, 2400, 240, 24, 5)).toEqual({
      start: 95,
      end: 115,
      padTop: 95 * 24,
      padBottom: 885 * 24,
    });
  });

  it("clamps to the list", () => {
    expect(listWindow(3, 0, 240, 24, 5)).toEqual({ start: 0, end: 3, padTop: 0, padBottom: 0 });
    expect(listWindow(0, 100, 240, 24, 5)).toEqual({ start: 0, end: 0, padTop: 0, padBottom: 0 });
  });
});
