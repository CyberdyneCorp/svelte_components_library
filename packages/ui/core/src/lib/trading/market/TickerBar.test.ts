import { render, screen, within } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import type { Ticker } from "../types.js";
import TickerBar from "./TickerBar.svelte";

const market = { symbol: "BTC-PERP", baseAsset: "BTC", quoteAsset: "USDT", tickSize: "0.1" };
const NOW = Date.UTC(2026, 8, 29, 7, 58, 30);

const full: Ticker = {
  market: "BTC-PERP",
  last: "64123.4",
  mark: "64120.1",
  index: "64118.7",
  change24h: "1203.5",
  changePct24h: "1.9127",
  high24h: "64500",
  low24h: "62800.2",
  volume24h: "12345.678",
  quoteVolume24h: "790000000",
  openInterest: "8123.4",
  fundingRate: "0.0001",
  nextFundingTime: NOW + 90_000,
};

function value(label: string) {
  const term = screen.getByText(label, { selector: "dt" });
  return term.nextElementSibling as HTMLElement;
}

describe("TickerBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("shows every field of a full ticker", () => {
    render(TickerBar, { props: { ticker: full, market, locale: "en-US" } });
    expect(screen.getByRole("region", { name: "BTC-PERP Market summary" })).toBeInTheDocument();
    expect(value("Last price").textContent).toContain("64,123.4");
    expect(value("Mark").textContent).toBe("64,120.1");
    expect(value("Index").textContent).toBe("64,118.7");
    expect(value("24h change").textContent).toBe("+1,203.5 +1.91%");
    expect(value("24h high").textContent).toBe("64,500.0");
    expect(value("24h low").textContent).toBe("62,800.2");
    expect(value("24h volume (BTC)").textContent).toBe("12.35K");
    expect(value("24h turnover (USDT)").textContent).toBe("790M");
    expect(value("Open interest (BTC)").textContent).toBe("8.12K");
    expect(value("Funding").textContent).toContain("+0.0100%");
    expect(value("Funding").textContent).toContain("Next funding in");
  });

  it("omits absent fields", () => {
    render(TickerBar, { props: { ticker: { market: "BTC-PERP", last: "100" }, market, locale: "en-US" } });
    expect(screen.getAllByRole("term").map((dt) => dt.textContent)).toEqual(["Last price"]);
    expect(value("Last price").textContent?.trim()).toBe("100.0");
  });

  it("marks direction with a glyph as well as colour", () => {
    const { rerender } = render(TickerBar, { props: { ticker: full, market } });
    const last = value("Last price");
    expect(last).toHaveClass("cy-tb__value--up");
    expect(within(last).getByRole("img", { name: "Up" }).textContent).toBe("▲");
    return rerender({ ticker: { ...full, change24h: "-5", changePct24h: "-0.01" } }).then(async () => {
      vi.advanceTimersToNextFrame();
      await tick();
      const down = value("Last price");
      expect(down).toHaveClass("cy-tb__value--down");
      expect(within(down).getByRole("img", { name: "Down" }).textContent).toBe("▼");
      expect(value("24h change").textContent).toBe("-5.0 -0.01%");
    });
  });

  it("falls back to the percent change for direction and has no glyph when flat", () => {
    render(TickerBar, { props: { ticker: { market: "X", last: "1", changePct24h: "0" }, market } });
    expect(value("Last price")).toHaveClass("cy-tb__value--flat");
    expect(within(value("Last price")).queryByRole("img")).toBeNull();
  });

  it("counts down to the next funding time (spec scenario)", async () => {
    const { container } = render(TickerBar, { props: { ticker: full, market } });
    const countdown = () => container.querySelector(".cy-tb__countdown time")?.textContent?.trim();
    expect(countdown()).toBe("00:01:30");
    await vi.advanceTimersByTimeAsync(30_000);
    expect(countdown()).toBe("00:01:00");
    await vi.advanceTimersByTimeAsync(120_000);
    expect(countdown()).toBe("00:00:00");
  });

  it("stops the countdown timer on unmount", () => {
    const { unmount } = render(TickerBar, { props: { ticker: full, market } });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows only the countdown when the rate is absent", () => {
    render(TickerBar, { props: { ticker: { market: "X", last: "1", nextFundingTime: NOW + 3_600_000 }, market } });
    expect(value("Funding").textContent).toContain("01:00:00");
    expect(value("Funding").textContent).not.toContain("%");
  });

  it("coalesces a burst of ticker updates into one frame", async () => {
    const { rerender } = render(TickerBar, { props: { ticker: full, market, locale: "en-US" } });
    for (let i = 1; i <= 20; i++) await rerender({ ticker: { ...full, last: String(64000 + i) } });
    expect(value("Last price").textContent).toContain("64,123.4");
    vi.advanceTimersToNextFrame();
    await tick();
    expect(value("Last price").textContent).toContain("64,020.0");
  });

  it("localizes labels and works without a symbol", () => {
    const { symbol: _symbol, ...noSymbol } = market;
    render(TickerBar, { props: { ticker: full, market: noSymbol, labels: { title: "Resumo", mark: "Marca" } } });
    expect(screen.getByRole("region", { name: "Resumo" })).toBeInTheDocument();
    expect(screen.getByText("Marca")).toBeInTheDocument();
  });
});
