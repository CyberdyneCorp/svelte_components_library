import { describe, it, expect } from "vitest";
import { gridKeyAction, isPrintable, moveTarget, tabTarget, type GridKey } from "./gridKeys.js";

const key = (k: string, mods: Partial<GridKey> = {}): GridKey => ({
  key: k,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  ...mods,
});
const size = { rows: 30, cols: 4 };

describe("moveTarget", () => {
  it("moves one cell with the arrows and clamps at the edges", () => {
    expect(moveTarget(key("ArrowRight"), { row: 0, col: 0 }, size)).toEqual({ row: 0, col: 1 });
    expect(moveTarget(key("ArrowDown"), { row: 0, col: 1 }, size)).toEqual({ row: 1, col: 1 });
    expect(moveTarget(key("ArrowUp"), { row: 0, col: 0 }, size)).toEqual({ row: 0, col: 0 });
    expect(moveTarget(key("ArrowLeft"), { row: 0, col: 0 }, size)).toEqual({ row: 0, col: 0 });
    expect(moveTarget(key("ArrowRight"), { row: 0, col: 3 }, size)).toEqual({ row: 0, col: 3 });
    expect(moveTarget(key("ArrowDown"), { row: 29, col: 0 }, size)).toEqual({ row: 29, col: 0 });
  });

  it("jumps to row and grid ends with Home/End and Ctrl", () => {
    const pos = { row: 5, col: 2 };
    expect(moveTarget(key("Home"), pos, size)).toEqual({ row: 5, col: 0 });
    expect(moveTarget(key("End"), pos, size)).toEqual({ row: 5, col: 3 });
    expect(moveTarget(key("Home", { ctrlKey: true }), pos, size)).toEqual({ row: 0, col: 0 });
    expect(moveTarget(key("End", { metaKey: true }), pos, size)).toEqual({ row: 29, col: 3 });
  });

  it("pages ten rows, clamped", () => {
    expect(moveTarget(key("PageDown"), { row: 5, col: 1 }, size)).toEqual({ row: 15, col: 1 });
    expect(moveTarget(key("PageDown"), { row: 25, col: 1 }, size)).toEqual({ row: 29, col: 1 });
    expect(moveTarget(key("PageUp"), { row: 5, col: 1 }, size)).toEqual({ row: 0, col: 1 });
  });

  it("returns null for other keys", () => {
    expect(moveTarget(key("a"), { row: 0, col: 0 }, size)).toBeNull();
  });
});

describe("tabTarget", () => {
  const small = { rows: 2, cols: 2 };
  it("wraps across rows and stops past either end", () => {
    expect(tabTarget({ row: 0, col: 1 }, small, 1)).toEqual({ row: 1, col: 0 });
    expect(tabTarget({ row: 1, col: 0 }, small, -1)).toEqual({ row: 0, col: 1 });
    expect(tabTarget({ row: 1, col: 1 }, small, 1)).toBeNull();
    expect(tabTarget({ row: 0, col: 0 }, small, -1)).toBeNull();
  });
});

describe("isPrintable", () => {
  it("accepts single characters without command modifiers", () => {
    expect(isPrintable(key("b"))).toBe(true);
    expect(isPrintable(key("B", { shiftKey: true }))).toBe(true);
    expect(isPrintable(key("c", { ctrlKey: true }))).toBe(false);
    expect(isPrintable(key("Enter"))).toBe(false);
  });
});

describe("gridKeyAction in navigation mode", () => {
  const pos = { row: 1, col: 1 };
  it("moves before anything else", () => {
    expect(gridKeyAction(key("ArrowUp"), "navigate", pos, size, "editable")).toEqual({
      type: "move",
      to: { row: 0, col: 1 },
    });
  });

  it("starts editing with Enter, F2 or a printable key", () => {
    expect(gridKeyAction(key("Enter"), "navigate", pos, size, "editable")).toEqual({ type: "edit" });
    expect(gridKeyAction(key("F2"), "navigate", pos, size, "editable")).toEqual({ type: "edit" });
    expect(gridKeyAction(key("B"), "navigate", pos, size, "editable")).toEqual({ type: "edit", replace: "B" });
  });

  it("toggles boolean cells with Space or Enter only", () => {
    expect(gridKeyAction(key(" "), "navigate", pos, size, "boolean")).toEqual({ type: "toggle" });
    expect(gridKeyAction(key("Enter"), "navigate", pos, size, "boolean")).toEqual({ type: "toggle" });
    expect(gridKeyAction(key("x"), "navigate", pos, size, "boolean")).toEqual({ type: "none" });
  });

  it("ignores edit keys on read-only cells and leaves Tab to the browser", () => {
    expect(gridKeyAction(key("Enter"), "navigate", pos, size, "readonly")).toEqual({ type: "none" });
    expect(gridKeyAction(key("a"), "navigate", pos, size, "readonly")).toEqual({ type: "none" });
    expect(gridKeyAction(key("Tab"), "navigate", pos, size, "editable")).toEqual({ type: "none" });
  });
});

describe("gridKeyAction in edit mode", () => {
  const small = { rows: 2, cols: 2 };
  it("commits with Enter and moves down, staying on the last row", () => {
    expect(gridKeyAction(key("Enter"), "edit", { row: 0, col: 1 }, small, "editable")).toEqual({
      type: "commit",
      to: { row: 1, col: 1 },
    });
    expect(gridKeyAction(key("Enter"), "edit", { row: 1, col: 1 }, small, "editable")).toEqual({
      type: "commit",
      to: { row: 1, col: 1 },
    });
    expect(gridKeyAction(key("Enter", { shiftKey: true }), "edit", { row: 1, col: 0 }, small, "editable")).toEqual({
      type: "commit",
      to: { row: 0, col: 0 },
    });
  });

  it("commits with Tab, wrapping, and exits after the last cell", () => {
    expect(gridKeyAction(key("Tab"), "edit", { row: 0, col: 1 }, small, "editable")).toEqual({
      type: "commit",
      to: { row: 1, col: 0 },
    });
    expect(gridKeyAction(key("Tab"), "edit", { row: 1, col: 1 }, small, "editable")).toEqual({
      type: "commit",
      to: "exit",
    });
  });

  it("cancels with Escape and leaves other keys to the editor", () => {
    expect(gridKeyAction(key("Escape"), "edit", { row: 0, col: 0 }, small, "editable")).toEqual({ type: "cancel" });
    expect(gridKeyAction(key("ArrowLeft"), "edit", { row: 0, col: 0 }, small, "editable")).toEqual({ type: "none" });
    expect(gridKeyAction(key("a"), "edit", { row: 0, col: 0 }, small, "editable")).toEqual({ type: "none" });
  });
});
