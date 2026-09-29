import { describe, expect, it } from "vitest";
import { assigned, callsOf, createRecordingContext, textsOf } from "../../../_testdata/canvas.js";
import type { Candle } from "../../types.js";
import { drawMarkers, drawPriceLines, markerCentre, type PlacedMarker } from "./annotations.js";
import { drawGrid, drawGuides, drawLastPrice, drawPriceAxis, drawPriceLabel, drawTimeAxis, drawTimeLabel } from "./axes.js";
import { bodyWidth, drawCandles, drawOhlcBars, isUp } from "./candles.js";
import { drawCrosshair, drawLegend } from "./crosshair.js";
import { drawArea, drawBand, drawHistogram, drawLine, finiteRuns } from "./series.js";
import { dashFor, fontOf, type BarGeometry } from "./types.js";

const candles: Candle[] = [
  { time: 0, open: 10, high: 12, low: 9, close: 11 },
  { time: 1, open: 11, high: 11.5, low: 8, close: 9 },
  { time: 2, open: 9, high: 13, low: 9, close: 12 },
  { time: 3, open: 12, high: 12, low: 12, close: 12 },
];
const bars = (first = 0, last = 3, spacing = 10): BarGeometry => ({ first, last, x: (i) => 5 + i * spacing, spacing, dpr: 1 });
const y = (v: number) => 100 - v;
const colors = { up: "green", down: "red" };

describe("candle renderers", () => {
  it("classifies up bars and sizes bodies to odd device pixels", () => {
    expect(isUp(candles[0])).toBe(true);
    expect(isUp(candles[1])).toBe(false);
    expect(isUp(candles[3])).toBe(true);
    expect(bodyWidth(10, 1)).toBe(7);
    expect(bodyWidth(10, 2)).toBe(13 / 2);
    expect(bodyWidth(0.5, 1)).toBe(1);
  });

  it("draws candles in two colour passes with four draw calls", () => {
    const ctx = createRecordingContext();
    drawCandles(ctx, candles, bars(), y, colors);
    expect(callsOf(ctx, "stroke")).toHaveLength(2);
    expect(callsOf(ctx, "fill")).toHaveLength(2);
    expect(callsOf(ctx, "rect")).toHaveLength(4);
    expect(assigned(ctx, "fillStyle")).toEqual(["green", "red"]);
    // Two wick segments per bar.
    expect(callsOf(ctx, "moveTo")).toHaveLength(8);
  });

  it("gives flat bodies at least one device pixel", () => {
    const ctx = createRecordingContext();
    drawCandles(ctx, candles, bars(3, 3), y, colors);
    const [, , , height] = callsOf(ctx, "rect")[0].args as number[];
    expect(height).toBe(1);
  });

  it("only draws the requested range", () => {
    const ctx = createRecordingContext();
    drawCandles(ctx, candles, bars(1, 2), y, colors);
    expect(callsOf(ctx, "rect")).toHaveLength(2);
  });

  it("strokes up bodies for hollow candles", () => {
    const ctx = createRecordingContext();
    drawCandles(ctx, candles, bars(), y, colors, true);
    expect(callsOf(ctx, "stroke")).toHaveLength(3);
    expect(callsOf(ctx, "fill")).toHaveLength(1);
  });

  it("draws OHLC bars with open and close ticks", () => {
    const ctx = createRecordingContext();
    drawOhlcBars(ctx, candles, bars(), y, colors);
    expect(callsOf(ctx, "stroke")).toHaveLength(2);
    expect(callsOf(ctx, "moveTo")).toHaveLength(12);
    expect(assigned(ctx, "strokeStyle")).toEqual(["green", "red"]);
  });
});

describe("series renderers", () => {
  const values = [1, 2, NaN, 4, 5];
  const at = (i: number) => values[i];
  const b = bars(0, 4);

  it("splits lines at gaps", () => {
    const ctx = createRecordingContext();
    drawLine(ctx, b, at, y, "blue");
    expect(callsOf(ctx, "moveTo")).toHaveLength(2);
    expect(callsOf(ctx, "lineTo")).toHaveLength(2);
    expect(assigned(ctx, "strokeStyle")).toEqual(["blue"]);
  });

  it("finds runs where every series is finite", () => {
    expect(finiteRuns(b, at)).toEqual([
      [0, 1],
      [3, 4],
    ]);
    expect(finiteRuns(b, at, (i) => (i === 4 ? NaN : 0))).toEqual([
      [0, 1],
      [3, 3],
    ]);
    expect(finiteRuns(bars(2, 2), at)).toEqual([]);
  });

  it("fills an area down to the base and strokes its line", () => {
    const ctx = createRecordingContext();
    drawArea(ctx, b, at, y, 200, "blue");
    expect(callsOf(ctx, "closePath")).toHaveLength(2);
    expect(callsOf(ctx, "fill")).toHaveLength(1);
    expect(callsOf(ctx, "stroke")).toHaveLength(1);
    expect(assigned(ctx, "globalAlpha")).toEqual([0.18]);
  });

  it("fills a band between two series per run", () => {
    const ctx = createRecordingContext();
    drawBand(ctx, b, (i) => values[i] + 1, (i) => values[i] - 1, y, "violet");
    expect(callsOf(ctx, "closePath")).toHaveLength(2);
    expect(callsOf(ctx, "fill")).toHaveLength(1);
  });

  it("draws histogram columns in two colours from the base", () => {
    const ctx = createRecordingContext();
    const signed = [3, -2, NaN, 1];
    drawHistogram(ctx, bars(0, 3), (i) => signed[i], y, 0, ["green", "red"], (i) => (signed[i] >= 0 ? 0 : 1), 0.5);
    const rects = callsOf(ctx, "rect").map((c) => c.args as number[]);
    expect(rects).toHaveLength(3);
    expect(assigned(ctx, "fillStyle")).toEqual(["green", "red"]);
    // The negative column starts at the base (y = 100) and goes down.
    const negative = rects[2];
    expect(negative[1]).toBe(100);
    expect(negative[3]).toBe(2);
  });
});

describe("axes", () => {
  const box = { left: 0, top: 0, width: 100, height: 50 };

  it("draws grid lines on pixel centres", () => {
    const ctx = createRecordingContext();
    drawGrid(ctx, box, [10], [20], "grey", 1);
    expect(callsOf(ctx, "moveTo").map((c) => c.args)).toEqual([
      [0, 10.5],
      [20.5, 0],
    ]);
  });

  it("draws dashed guides and restores the dash", () => {
    const ctx = createRecordingContext();
    drawGuides(ctx, box, [30, 70], "grey", 1);
    expect(callsOf(ctx, "setLineDash")[0].args[0]).toEqual([6, 4]);
    expect(callsOf(ctx, "restore")).toHaveLength(1);
    expect(dashFor("dotted")).toEqual([1, 3]);
    expect(dashFor(undefined)).toEqual([]);
  });

  it("writes axis labels", () => {
    const ctx = createRecordingContext();
    const text = { color: "white", font: "mono" };
    drawPriceAxis(ctx, { left: 100, top: 0, width: 50, height: 50 }, [{ at: 10, text: "64,000" }], text, "grey", 1);
    drawTimeAxis(ctx, { left: 0, top: 50, width: 100, height: 20 }, [{ at: 30, text: "12:00" }], text, "grey", 1);
    expect(textsOf(ctx)).toEqual(["64,000", "12:00"]);
    expect(assigned(ctx, "font")).toContain(fontOf("mono"));
  });

  it("clamps label boxes inside the axis", () => {
    const ctx = createRecordingContext();
    const axis = { left: 100, top: 0, width: 50, height: 100 };
    drawPriceLabel(ctx, axis, -50, { text: "1", background: "b", color: "c", font: "f" });
    expect(callsOf(ctx, "fillRect")[0].args[1]).toBe(0);
    drawTimeLabel(ctx, { left: 0, top: 100, width: 100, height: 20 }, 99, { text: "Mon", background: "b", color: "c", font: "f" });
    const [left, , width] = callsOf(ctx, "fillRect")[1].args as number[];
    expect(left + width).toBe(100);
  });

  it("draws the last price as a dotted line with an axis label", () => {
    const ctx = createRecordingContext();
    drawLastPrice(ctx, box, { left: 100, top: 0, width: 50, height: 50 }, 20, { text: "11.00", background: "green", color: "black", font: "f" }, 1);
    expect(callsOf(ctx, "setLineDash")[0].args[0]).toEqual([1, 3]);
    expect(textsOf(ctx)).toEqual(["11.00"]);
  });
});

describe("crosshair and legend", () => {
  it("draws the vertical line, and the horizontal one only with a y", () => {
    const ctx = createRecordingContext();
    drawCrosshair(ctx, { left: 0, top: 0, width: 100, height: 50 }, 40, null, "grey", 1);
    expect(callsOf(ctx, "moveTo")).toHaveLength(1);
    drawCrosshair(ctx, { left: 0, top: 0, width: 100, height: 50 }, 40, 20, "grey", 1);
    expect(callsOf(ctx, "moveTo")).toHaveLength(3);
  });

  it("lays out coloured legend segments left to right, one row per line", () => {
    const ctx = createRecordingContext();
    drawLegend(
      ctx,
      [
        [
          { text: "O", color: "grey" },
          { text: "10", color: "green" },
        ],
        [{ text: "EMA 9", color: "cyan" }],
      ],
      8,
      4,
      "mono",
    );
    const texts = callsOf(ctx, "fillText").map((c) => c.args);
    expect(texts[0]).toEqual(["O", 8, 4]);
    expect(texts[1]).toEqual(["10", 8 + 6 + 6, 4]);
    expect(texts[2][2]).toBeGreaterThan(4);
    expect(assigned(ctx, "fillStyle")).toEqual(["grey", "green", "cyan"]);
  });
});

describe("annotations", () => {
  const marker = (m: Partial<PlacedMarker>): PlacedMarker => ({
    x: 10,
    y: 50,
    shape: "arrow-up",
    position: "below",
    color: "green",
    ...m,
  });

  it("offsets markers from their anchor", () => {
    expect(markerCentre(marker({ position: "below" }))).toBeGreaterThan(50);
    expect(markerCentre(marker({ position: "above" }))).toBeLessThan(50);
    expect(markerCentre(marker({ position: "at" }))).toBe(50);
  });

  it("draws every shape and the marker text", () => {
    const ctx = createRecordingContext();
    drawMarkers(
      ctx,
      [
        marker({ shape: "arrow-up", text: "Buy" }),
        marker({ shape: "arrow-down", position: "above", text: "Sell" }),
        marker({ shape: "circle", position: "at" }),
        marker({ shape: "square", position: "at" }),
      ],
      "mono",
    );
    expect(callsOf(ctx, "fill")).toHaveLength(4);
    expect(callsOf(ctx, "arc")).toHaveLength(1);
    expect(callsOf(ctx, "rect")).toHaveLength(1);
    expect(textsOf(ctx)).toEqual(["Buy", "Sell"]);
    expect(assigned(ctx, "textBaseline")).toEqual(["top", "bottom"]);
  });

  it("draws price lines inside the plot with their tag and axis label", () => {
    const ctx = createRecordingContext();
    const plot = { left: 0, top: 0, width: 100, height: 100 };
    const axis = { left: 100, top: 0, width: 50, height: 100 };
    drawPriceLines(
      ctx,
      [
        { y: 40, color: "red", style: "dashed", label: "SL", priceText: "63,990.5", active: true },
        { y: 60, color: "blue", style: "solid", label: "", priceText: "64,100.0" },
        { y: 400, color: "orange", style: "dotted", label: "Liq.", priceText: "1" },
      ],
      plot,
      axis,
      "black",
      "mono",
      1,
    );
    expect(textsOf(ctx)).toEqual(["SL", "63,990.5", "64,100.0"]);
    expect(assigned(ctx, "lineWidth")).toEqual([2, 1]);
  });
});
