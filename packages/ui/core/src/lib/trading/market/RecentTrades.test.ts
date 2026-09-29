import { render, screen, fireEvent, within } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, it, expect, vi } from "vitest";
import type { Trade } from "../types.js";
import RecentTrades from "./RecentTrades.svelte";

const market = { baseAsset: "BTC", quoteAsset: "USDT", tickSize: "0.5", stepSize: "0.001" };
const T0 = Date.UTC(2026, 8, 29, 12, 0, 0);

function makeTrades(count: number, start = 0): Trade[] {
  return Array.from({ length: count }, (_, i) => {
    const n = start + count - 1 - i; // newest first
    return {
      id: `t${n}`,
      price: String(64000 + n * 0.5),
      size: "0.25",
      side: n % 2 === 0 ? "buy" : "sell",
      time: T0 + n * 1000,
    };
  });
}

function items() {
  return within(screen.getByRole("region", { name: "Recent trades" })).getAllByRole("listitem");
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches })));
}

describe("RecentTrades", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("marks a sell with the short colour and an accessible ▼ Sell glyph (spec scenario)", () => {
    const sell: Trade = { id: "s", price: "64000", size: "1", side: "sell", time: T0 };
    render(RecentTrades, { props: { trades: [sell], market, locale: "en-US", timeZone: "UTC" } });
    const [row] = items();
    expect(row).toHaveClass("cy-rt__row--sell");
    const glyph = within(row).getByRole("img", { name: "Sell" });
    expect(glyph.textContent).toBe("▼");
    const price = glyph.parentElement as HTMLElement;
    expect(price).toHaveClass("cy-rt__price");
    expect(price.firstElementChild).toBe(glyph);
    expect(price.textContent).toContain("64,000.0");
  });

  it("marks a buy with ▲ Buy", () => {
    const buy: Trade = { id: "b", price: "1", size: "1", side: "buy", time: T0 };
    render(RecentTrades, { props: { trades: [buy], market } });
    expect(within(items()[0]).getByRole("img", { name: "Buy" }).textContent).toBe("▲");
    expect(items()[0]).toHaveClass("cy-rt__row--buy");
  });

  it("shows size and time in the given time zone", () => {
    render(RecentTrades, { props: { trades: makeTrades(1), market, locale: "en-US", timeZone: "UTC" } });
    const row = items()[0];
    expect(row.textContent).toContain("0.250");
    const time = row.querySelector("time") as HTMLTimeElement;
    expect(time.textContent?.trim()).toBe("12:00:00");
    expect(time.dateTime).toBe("2026-09-29T12:00:00.000Z");
  });

  it("lists trades newest first whatever the input order", () => {
    const trades = makeTrades(3).reverse();
    render(RecentTrades, { props: { trades, market, timeZone: "UTC", locale: "en-US" } });
    expect(items().map((row) => row.querySelector("time")?.textContent?.trim())).toEqual([
      "12:00:02",
      "12:00:01",
      "12:00:00",
    ]);
  });

  it("renders only a window of a long list", () => {
    render(RecentTrades, { props: { trades: makeTrades(5000), market, height: 240, rowHeight: 24, overscan: 5 } });
    const rows = items();
    expect(rows).toHaveLength(15);
    expect(rows[0]).toHaveAttribute("aria-setsize", "5000");
    expect(rows[0]).toHaveAttribute("aria-posinset", "1");
  });

  it("moves the window on scroll", async () => {
    render(RecentTrades, { props: { trades: makeTrades(5000), market, height: 240, rowHeight: 24, overscan: 5 } });
    const region = screen.getByRole("region", { name: "Recent trades" });
    region.scrollTop = 2400;
    await fireEvent.scroll(region);
    const rows = items();
    expect(rows[0]).toHaveAttribute("aria-posinset", "96");
    const list = region.querySelector("ol") as HTMLElement;
    expect(list.style.paddingTop).toBe(`${95 * 24}px`);
  });

  it("makes the scroll region keyboard focusable", () => {
    render(RecentTrades, { props: { trades: makeTrades(2), market } });
    expect(screen.getByRole("region", { name: "Recent trades" })).toHaveAttribute("tabindex", "0");
  });

  it("shows an empty state", () => {
    render(RecentTrades, { props: { market } });
    expect(screen.getByText("No trades yet")).toBeInTheDocument();
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("highlights newly arrived trades only", async () => {
    stubReducedMotion(false);
    vi.useFakeTimers();
    const { rerender } = render(RecentTrades, { props: { trades: makeTrades(3), market } });
    await tick();
    expect(document.querySelectorAll(".cy-rt__row--new")).toHaveLength(0);
    await rerender({ trades: makeTrades(5) });
    vi.advanceTimersToNextFrame();
    await tick();
    const fresh = [...document.querySelectorAll(".cy-rt__row--new")].map((row) =>
      row.querySelector("time")?.getAttribute("datetime"),
    );
    expect(fresh).toEqual([new Date(T0 + 4000).toISOString(), new Date(T0 + 3000).toISOString()]);
  });

  it("does not highlight under prefers-reduced-motion", async () => {
    stubReducedMotion(true);
    vi.useFakeTimers();
    const { rerender } = render(RecentTrades, { props: { trades: makeTrades(3), market } });
    await tick();
    await rerender({ trades: makeTrades(5) });
    vi.advanceTimersToNextFrame();
    await tick();
    expect(items()).toHaveLength(5);
    expect(document.querySelectorAll(".cy-rt__row--new")).toHaveLength(0);
  });

  it("coalesces a burst of trade updates into one frame", async () => {
    vi.useFakeTimers();
    const { rerender } = render(RecentTrades, { props: { trades: makeTrades(1), market } });
    for (let n = 2; n <= 20; n++) await rerender({ trades: makeTrades(n) });
    expect(items()).toHaveLength(1);
    vi.advanceTimersToNextFrame();
    await tick();
    expect(items()).toHaveLength(20);
  });

  it("localizes labels", () => {
    render(RecentTrades, {
      props: { trades: makeTrades(1), market, labels: { title: "Negócios", buy: "Compra" } },
    });
    const region = screen.getByRole("region", { name: "Negócios" });
    expect(within(region).getByRole("img", { name: "Compra" })).toBeInTheDocument();
  });
});
