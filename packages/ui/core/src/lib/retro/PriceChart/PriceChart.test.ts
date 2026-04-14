import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PriceChart from "./PriceChart.svelte";

const candles = [
  { t: 1, open: 100, high: 120, low: 90, close: 110 },
  { t: 2, open: 110, high: 115, low: 95, close: 98 },
  { t: 3, open: 98, high: 130, low: 95, close: 125 },
];

describe("PriceChart", () => {
  it("renders SVG with aria-label", () => {
    render(PriceChart, { props: { candles } });
    expect(screen.getByRole("img", { name: "Price chart" })).toBeInTheDocument();
  });
  it("renders one body per candle", () => {
    const { container } = render(PriceChart, { props: { candles } });
    for (let i = 0; i < candles.length; i++) {
      expect(container.querySelector(`[data-testid='cy-pricech-body-${i}']`)).toBeInTheDocument();
    }
  });
  it("renders one wick per candle", () => {
    const { container } = render(PriceChart, { props: { candles } });
    for (let i = 0; i < candles.length; i++) {
      expect(container.querySelector(`[data-testid='cy-pricech-wick-${i}']`)).toBeInTheDocument();
    }
  });
  it("shows 'No data' for empty", () => {
    render(PriceChart, { props: { candles: [] } });
    expect(screen.getByText("No data")).toBeInTheDocument();
  });
  it("applies width and height to viewBox", () => {
    render(PriceChart, { props: { candles, width: 320, height: 160 } });
    expect(screen.getByTestId("cy-pricech")).toHaveAttribute("viewBox", "0 0 320 160");
  });
  it("uses custom aria-label", () => {
    render(PriceChart, { props: { candles, ariaLabel: "BTC" } });
    expect(screen.getByRole("img", { name: "BTC" })).toBeInTheDocument();
  });
  it("uses up color for bullish candle", () => {
    const bull = [{ t: 1, open: 100, high: 120, low: 90, close: 110 }];
    const { container } = render(PriceChart, { props: { candles: bull, upColor: "#00ff00", downColor: "#ff0000" } });
    const body = container.querySelector("[data-testid='cy-pricech-body-0']");
    expect(body?.getAttribute("fill")).toBe("#00ff00");
  });
  it("uses down color for bearish candle", () => {
    const bear = [{ t: 1, open: 110, high: 120, low: 90, close: 100 }];
    const { container } = render(PriceChart, { props: { candles: bear, upColor: "#00ff00", downColor: "#ff0000" } });
    const body = container.querySelector("[data-testid='cy-pricech-body-0']");
    expect(body?.getAttribute("fill")).toBe("#ff0000");
  });
  it("handles identical high/low by avoiding div-by-zero", () => {
    const flat = [{ t: 1, open: 100, high: 100, low: 100, close: 100 }];
    expect(() => render(PriceChart, { props: { candles: flat } })).not.toThrow();
  });
});
