import { describe, it, expect } from "vitest";
import { createWindowManager } from "./windowManager.svelte.js";

describe("createWindowManager", () => {
  it("starts with no windows", () => {
    const wm = createWindowManager();
    expect(wm.windows).toHaveLength(0);
  });
  it("opens a window with defaults", () => {
    const wm = createWindowManager();
    const w = wm.open({ id: "a", title: "A" });
    expect(wm.windows).toHaveLength(1);
    expect(w.width).toBeGreaterThan(0);
    expect(w.zIndex).toBeGreaterThan(0);
  });
  it("refocuses existing id instead of duplicating", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    const before = wm.windows[0].zIndex;
    wm.open({ id: "a", title: "A again" });
    expect(wm.windows).toHaveLength(1);
    expect(wm.windows[0].zIndex).toBeGreaterThan(before);
  });
  it("closes by id", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.close("a");
    expect(wm.windows).toHaveLength(0);
  });
  it("focus raises zIndex above others", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.open({ id: "b", title: "B" });
    wm.focus("a");
    const a = wm.windows.find((w) => w.id === "a")!;
    const b = wm.windows.find((w) => w.id === "b")!;
    expect(a.zIndex).toBeGreaterThan(b.zIndex);
  });
  it("minimize flags the window", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.minimize("a");
    expect(wm.windows[0].minimized).toBe(true);
  });
  it("restore unsets minimized and raises z", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.open({ id: "b", title: "B" });
    wm.minimize("a");
    wm.restore("a");
    const a = wm.windows.find((w) => w.id === "a")!;
    const b = wm.windows.find((w) => w.id === "b")!;
    expect(a.minimized).toBe(false);
    expect(a.zIndex).toBeGreaterThan(b.zIndex);
  });
  it("toggleMinimize flips state", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.toggleMinimize("a");
    expect(wm.windows[0].minimized).toBe(true);
    wm.toggleMinimize("a");
    expect(wm.windows[0].minimized).toBe(false);
  });
  it("toggleMaximize flips state", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.toggleMaximize("a");
    expect(wm.windows[0].maximized).toBe(true);
    wm.toggleMaximize("a");
    expect(wm.windows[0].maximized).toBe(false);
  });
  it("update patches fields", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.update("a", { x: 500, title: "Renamed" });
    expect(wm.windows[0].x).toBe(500);
    expect(wm.windows[0].title).toBe("Renamed");
  });
  it("opening again focuses and restores minimized window", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.minimize("a");
    wm.open({ id: "a", title: "A" });
    expect(wm.windows[0].minimized).toBe(false);
  });
  it("activeId is the topmost visible window", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.open({ id: "b", title: "B" });
    expect(wm.activeId).toBe("b");
    wm.focus("a");
    expect(wm.activeId).toBe("a");
  });
  it("activeId skips minimized windows", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.open({ id: "b", title: "B" });
    wm.minimize("b");
    expect(wm.activeId).toBe("a");
  });
  it("activeId is undefined when all minimized or none open", () => {
    const wm = createWindowManager();
    expect(wm.activeId).toBeUndefined();
    wm.open({ id: "a", title: "A" });
    wm.minimize("a");
    expect(wm.activeId).toBeUndefined();
  });
  it("closeAll wipes the list", () => {
    const wm = createWindowManager();
    wm.open({ id: "a", title: "A" });
    wm.open({ id: "b", title: "B" });
    wm.closeAll();
    expect(wm.windows).toHaveLength(0);
  });
  it("ignores focus/minimize/restore for unknown id", () => {
    const wm = createWindowManager();
    wm.focus("nope");
    wm.minimize("nope");
    wm.restore("nope");
    wm.toggleMinimize("nope");
    expect(wm.windows).toHaveLength(0);
  });
  it("cascades positions for subsequent windows", () => {
    const wm = createWindowManager({ cascadeOffset: 10 });
    const a = wm.open({ id: "a", title: "A" });
    const b = wm.open({ id: "b", title: "B" });
    expect(b.x).toBe(a.x + 10);
    expect(b.y).toBe(a.y + 10);
  });
});
