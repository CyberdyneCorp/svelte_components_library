import { afterEach, describe, expect, it, vi } from "vitest";
import { callsOf, createRecordingContext, FakeResizeObserver } from "../../../_testdata/canvas.js";
import { autoDigits, fixedFormatter, percentFormatter, priceDigits, volumeFormatter } from "./numberFormat.js";
import { beginFrame, crisp, currentDpr, observeSize, sizeCanvas, snap } from "./surface.js";
import { PALETTE_SIZE, prefersReducedMotion, readTheme, resolveColor, THEME_PROPERTIES, watchTheme } from "./theme.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-theme");
});

describe("surface", () => {
  it("scales the backing store by the device pixel ratio", () => {
    const canvas = document.createElement("canvas");
    expect(sizeCanvas(canvas, { width: 300, height: 150 }, 2)).toBe(true);
    expect([canvas.width, canvas.height]).toEqual([600, 300]);
    expect(canvas.style.width).toBe("300px");
    expect(sizeCanvas(canvas, { width: 300, height: 150 }, 2)).toBe(false);
    sizeCanvas(canvas, { width: 0, height: 0 }, 1);
    expect(canvas.width).toBe(1);
  });

  it("clears and sets a CSS-pixel transform", () => {
    const ctx = createRecordingContext();
    beginFrame(ctx, 2);
    expect(callsOf(ctx, "setTransform").map((c) => c.args)).toEqual([
      [1, 0, 0, 1, 0, 0],
      [2, 0, 0, 2, 0, 0],
    ]);
    expect(callsOf(ctx, "clearRect")).toHaveLength(1);
  });

  it("aligns to device pixels", () => {
    expect(crisp(10.2, 1)).toBe(10.5);
    expect(crisp(10.2, 2)).toBe(10.25);
    expect(snap(10.3, 2)).toBe(10.5);
    expect(currentDpr()).toBeGreaterThan(0);
  });

  it("reports the size now, on resize and on DPR change, until disposed", () => {
    const original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    const listeners: (() => void)[] = [];
    vi.spyOn(window, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: (_: string, cb: () => void) => listeners.push(cb),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    const element = document.createElement("div");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({ width: 320, height: 200 } as DOMRect);
    const onResize = vi.fn();
    const stop = observeSize(element, onResize);
    expect(onResize).toHaveBeenCalledWith({ width: 320, height: 200 }, currentDpr());
    FakeResizeObserver.trigger();
    listeners[0]();
    expect(onResize).toHaveBeenCalledTimes(3);
    stop();
    FakeResizeObserver.trigger();
    expect(onResize).toHaveBeenCalledTimes(3);
    globalThis.ResizeObserver = original;
  });
});

describe("theme", () => {
  it("reads every token property, falling back to the text colour", () => {
    const element = document.createElement("div");
    element.style.color = "rgb(1, 2, 3)";
    element.style.setProperty("--cy-trading-chart-up", "#00ff41");
    element.style.setProperty("--cy-trading-chart-series-2", "violet");
    element.style.setProperty("--cy-trading-chart-font", "JetBrains Mono");
    document.body.appendChild(element);
    const theme = readTheme(element);
    expect(theme.up).toBe("#00ff41");
    expect(theme.down).toBe("rgb(1, 2, 3)");
    expect(theme.palette).toHaveLength(PALETTE_SIZE);
    expect(theme.palette[1]).toBe("violet");
    expect(theme.font).toBe("JetBrains Mono");
    expect(Object.keys(THEME_PROPERTIES)).toContain("liquidation");
    element.remove();
  });

  it("resolves var() colours through the element and passes plain colours through", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    expect(resolveColor(element, "red", "x")).toBe("red");
    expect(resolveColor(element, undefined, "x")).toBe("x");
    expect(typeof resolveColor(element, "var(--nope)", "x")).toBe("string");
    expect(element.children).toHaveLength(0);
    element.remove();
  });

  it("calls back when data-theme changes on <html> and stops when disposed", async () => {
    const onChange = vi.fn();
    const stop = watchTheme(onChange);
    document.documentElement.setAttribute("data-theme", "light");
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(onChange).toHaveBeenCalled();
    stop();
    onChange.mockClear();
    document.documentElement.setAttribute("data-theme", "dark");
    await new Promise((r) => setTimeout(r, 0));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("calls back when the colour scheme changes", () => {
    let listener: (() => void) | undefined;
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      addEventListener: (_: string, cb: () => void) => (listener = cb),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    const onChange = vi.fn();
    const stop = watchTheme(onChange);
    listener?.();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(prefersReducedMotion()).toBe(true);
    stop();
  });
});

describe("number formats", () => {
  it("formats with fixed digits and blanks non-finite values", () => {
    const f = fixedFormatter(2, "en-US");
    expect(f(1234.5)).toBe("1,234.50");
    expect(f(NaN)).toBe("");
    expect(f.digits).toBe(2);
  });

  it("derives digits from the magnitude or the market", () => {
    expect(autoDigits(64000)).toBe(2);
    expect(autoDigits(12.3)).toBe(3);
    expect(autoDigits(0.00123)).toBe(7);
    expect(autoDigits(1e-12)).toBe(8);
    expect(autoDigits(0)).toBe(2);
    expect(autoDigits(NaN)).toBe(2);
    expect(priceDigits({ tickSize: "0.5" } as never, 1)).toBe(1);
    expect(priceDigits(undefined, 64000)).toBe(2);
  });

  it("formats volume compactly and percentages with a sign", () => {
    expect(volumeFormatter("en-US")(1_234_000)).toBe("1.23M");
    expect(volumeFormatter("en-US")(NaN)).toBe("");
    expect(percentFormatter("en-US")(0.0123)).toBe("+1.23%");
    expect(percentFormatter("en-US")(-0.05)).toBe("-5.00%");
    expect(percentFormatter("en-US")(Infinity)).toBe("");
  });
});
