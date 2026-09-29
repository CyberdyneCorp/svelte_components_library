import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callsOf, installCanvasEnvironment, makeCandles } from "../../_testdata/canvas.js";
import type { MarketSpec } from "../types.js";
import TradingChart from "./TradingChart.svelte";

const market: MarketSpec = {
  symbol: "BTC-PERP",
  baseAsset: "BTC",
  quoteAsset: "USD",
  tickSize: "0.5",
  stepSize: "0.001",
  minSize: "0.001",
  maxLeverage: 50,
};

let env: ReturnType<typeof installCanvasEnvironment>;

beforeEach(() => {
  env = installCanvasEnvironment();
});

afterEach(() => {
  env.uninstall();
  document.documentElement.removeAttribute("data-theme");
  vi.restoreAllMocks();
});

const chart = () => screen.getByRole("img");
const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

describe("TradingChart", () => {
  it("renders a named, focusable image summarising the visible range", async () => {
    render(TradingChart, { props: { candles: makeCandles(300), market, locale: "en-US" } });
    await waitFor(() => expect(chart().getAttribute("aria-label")).toMatch(/^Price chart: BTC-PERP 1h, /));
    expect(chart()).toHaveAttribute("tabindex", "0");
    expect(chart().getAttribute("aria-label")).toMatch(/Last close [\d,.]+ \([+-]?\d/);
    const description = document.getElementById(chart().getAttribute("aria-describedby")!);
    expect(description).toHaveTextContent(/Arrow keys move the crosshair/);
  });

  it("draws on two canvas layers sized to the container", async () => {
    const { container } = render(TradingChart, { props: { candles: makeCandles(50), height: 300 } });
    const canvases = container.querySelectorAll("canvas");
    expect(canvases).toHaveLength(2);
    expect(canvases[0].width).toBe(Math.round(800 * window.devicePixelRatio));
    const main = env.contexts.get(canvases[0])!;
    expect(callsOf(main, "fill").length).toBeGreaterThan(0);
    expect(chart()).toHaveStyle({ height: "300px" });
  });

  it("shows a data table with OHLCV and indicator columns", async () => {
    render(TradingChart, {
      props: {
        candles: makeCandles(80),
        market,
        indicators: [
          { type: "ema", period: 21 },
          { type: "rsi", period: 14, pane: "rsi" },
        ],
      },
    });
    const toggle = screen.getByRole("button", { name: "Show data" });
    await fireEvent.click(toggle);
    const table = screen.getByRole("table");
    const headers = within(table).getAllByRole("columnheader").map((th) => th.textContent);
    expect(headers).toEqual(["Time", "Open", "High", "Low", "Close", "Volume", "EMA 21", "RSI 14"]);
    expect(within(table).getAllByRole("row")).toHaveLength(51);
    expect(screen.getByText("Latest 50 bars")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide data" })).toHaveAttribute("aria-expanded", "true");
  });

  it("moves the keyboard crosshair and announces the bar politely", async () => {
    const oncrosshairmove = vi.fn();
    const candles = makeCandles(100);
    render(TradingChart, { props: { candles, market, locale: "en-US", oncrosshairmove } });
    const live = document.querySelector("[aria-live='polite']")!;
    chart().focus();
    await fireEvent.keyDown(chart(), { key: "Home" });
    for (let i = 0; i < 3; i++) await fireEvent.keyDown(chart(), { key: "ArrowRight" });
    expect(oncrosshairmove).toHaveBeenLastCalledWith(expect.objectContaining({ index: 3, source: "keyboard" }));
    await waitFor(() => expect(live.textContent).toMatch(/^Jan 1, 2026, 03:00: open [\d.]+, high [\d.]+, low [\d.]+, close [\d.]+/), {
      timeout: 1000,
    });
    await fireEvent.blur(chart());
    expect(oncrosshairmove).toHaveBeenLastCalledWith(null);
  });

  it("pans, zooms and reports the visible range", async () => {
    const onrangechange = vi.fn();
    render(TradingChart, { props: { candles: makeCandles(500), onrangechange } });
    await waitFor(() => expect(onrangechange).toHaveBeenCalled());
    const before = onrangechange.mock.calls.at(-1)![0];
    expect(before.to).toBe(499);
    await fireEvent.keyDown(chart(), { key: "ArrowLeft", shiftKey: true });
    await frame();
    const panned = onrangechange.mock.calls.at(-1)![0];
    expect(panned.to).toBeLessThan(499);
    await fireEvent.keyDown(chart(), { key: "-" });
    await frame();
    const zoomed = onrangechange.mock.calls.at(-1)![0];
    expect(zoomed.to - zoomed.from).toBeGreaterThan(panned.to - panned.from);
    await fireEvent.keyDown(chart(), { key: "End" });
    await frame();
    expect(onrangechange.mock.calls.at(-1)![0].to).toBe(499);
  });

  it("follows live updates at the right edge and refreshes the table", async () => {
    const all = makeCandles(201);
    const { rerender } = render(TradingChart, { props: { candles: all.slice(0, 200), market, locale: "en-US" } });
    await rerender({ candles: all });
    await frame();
    await fireEvent.click(screen.getByRole("button", { name: "Show data" }));
    const firstRow = within(screen.getByRole("table")).getAllByRole("row")[1];
    expect(firstRow).toHaveTextContent("Jan 9, 2026, 08:00");
  });

  it("repaints when the theme changes without remounting", async () => {
    const { container } = render(TradingChart, { props: { candles: makeCandles(50) } });
    const canvas = container.querySelector("canvas")!;
    const main = env.contexts.get(canvas)!;
    await frame();
    const clears = callsOf(main, "clearRect").length;
    document.documentElement.setAttribute("data-theme", "light");
    await waitFor(() => expect(callsOf(main, "clearRect").length).toBeGreaterThan(clears));
    expect(container.querySelector("canvas")).toBe(canvas);
  });

  it("localizes every string through labels", async () => {
    render(TradingChart, {
      props: {
        candles: makeCandles(20),
        market,
        labels: {
          chart: "Gráfico de preço",
          showData: "Mostrar dados",
          hideData: "Ocultar dados",
          tableCaption: "Últimas {count} barras",
          columns: { time: "Hora", close: "Fechamento" },
          keyboardHint: "Use as setas",
        },
      },
    });
    await waitFor(() => expect(chart().getAttribute("aria-label")).toMatch(/^Gráfico de preço: BTC-PERP/));
    await fireEvent.click(screen.getByRole("button", { name: "Mostrar dados" }));
    const headers = within(screen.getByRole("table")).getAllByRole("columnheader").map((th) => th.textContent);
    expect(headers.slice(0, 5)).toEqual(["Hora", "Open", "High", "Low", "Fechamento"]);
    expect(screen.getByText("Últimas 20 barras")).toBeInTheDocument();
    expect(screen.getByText("Use as setas")).toBeInTheDocument();
  });

  it("describes an empty chart", () => {
    render(TradingChart, { props: { candles: [] } });
    expect(chart()).toHaveAttribute("aria-label", "Price chart: no data");
    expect(screen.queryByRole("button", { name: "Show data" })).toBeInTheDocument();
  });

  it("reports indicator errors instead of crashing", async () => {
    const onindicatorerror = vi.fn();
    render(TradingChart, {
      props: { candles: makeCandles(30), indicators: [{ type: "ema", period: 0 }], onindicatorerror },
    });
    await waitFor(() => expect(onindicatorerror).toHaveBeenCalledTimes(1));
    expect(onindicatorerror.mock.calls[0][1]).toBeInstanceOf(RangeError);
    expect(chart()).toBeInTheDocument();
  });

  it("reports a dragged price line snapped to the tick", async () => {
    const onpricelinechange = vi.fn();
    const candles = makeCandles(100).map((c) => ({ ...c, open: c.open + 64000, high: c.high + 64000, low: c.low + 64000, close: c.close + 64000 }));
    render(TradingChart, {
      props: {
        candles,
        market,
        priceLines: [{ id: "sl", price: Math.round(candles[99].close), kind: "stop-loss", draggable: true }],
        indicators: [{ type: "rsi" }],
        onpricelinechange,
      },
    });
    await frame();
    const surface = chart();
    // Find the line by probing the hit area from top to bottom.
    let y = 0;
    for (; y < 300; y++) {
      await fireEvent.pointerMove(surface, { clientX: 100, clientY: y });
      if (surface.style.cursor === "ns-resize") break;
    }
    expect(y).toBeLessThan(300);
    await fireEvent.pointerDown(surface, { clientX: 100, clientY: y, button: 0, pointerId: 1, pointerType: "mouse" });
    await fireEvent.pointerMove(surface, { clientX: 100, clientY: y + 40, pointerId: 1, pointerType: "mouse" });
    await fireEvent.pointerUp(surface, { clientX: 100, clientY: y + 40, pointerId: 1, pointerType: "mouse" });
    expect(onpricelinechange).toHaveBeenCalledTimes(1);
    const [id, price] = onpricelinechange.mock.calls[0];
    expect(id).toBe("sl");
    expect(price).toBeLessThan(Math.round(candles[99].close));
    expect((price * 2) % 1).toBe(0);
  });
});
