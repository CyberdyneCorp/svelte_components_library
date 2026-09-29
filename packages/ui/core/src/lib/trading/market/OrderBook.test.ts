import { render, screen, fireEvent, within } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, describe, it, expect, vi } from "vitest";
import type { BookLevel } from "../types.js";
import OrderBook from "./OrderBook.svelte";

const market = {
  symbol: "BTC-PERP",
  baseAsset: "BTC",
  quoteAsset: "USDT",
  tickSize: "0.5",
  stepSize: "0.001",
};

const bids: BookLevel[] = [
  { price: "64000.0", size: "1" },
  { price: "63999.5", size: "2" },
  { price: "63999.0", size: "3" },
];

const asks: BookLevel[] = [
  { price: "64000.5", size: "0.5" },
  { price: "64001.0", size: "1.5" },
];

function rows(side: "Bids" | "Asks") {
  return within(screen.getByRole("list", { name: side })).getAllByRole("listitem");
}

function srText(item: HTMLElement) {
  return item.querySelector(".cy-ob__sr")?.textContent;
}

describe("OrderBook", () => {
  afterEach(() => vi.useRealTimers());

  it("aggregates levels by grouping (spec scenario)", () => {
    render(OrderBook, { props: { bids, asks, market, grouping: "1", locale: "en-US" } });
    expect(rows("Bids").map(srText)).toEqual([
      "Bid 64,000.0, Size 1.000, Total 1.000",
      "Bid 63,999.0, Size 5.000, Total 6.000",
    ]);
  });

  it("shows asks worst-to-best above the spread in the both layout", () => {
    render(OrderBook, { props: { bids, asks, market, locale: "en-US" } });
    expect(rows("Asks").map(srText)).toEqual([
      "Ask 64,001.0, Size 1.500, Total 2.000",
      "Ask 64,000.5, Size 0.500, Total 0.500",
    ]);
  });

  it("sizes depth bars by cumulative size", () => {
    const { container } = render(OrderBook, { props: { bids, asks, market } });
    const widths = [...container.querySelectorAll<HTMLElement>(".cy-ob__side--bid .cy-ob__bar")].map(
      (bar) => bar.style.width,
    );
    expect(widths).toEqual([`${(1 / 6) * 100}%`, "50%", "100%"]);
  });

  it("shows the spread absolute and in percent", () => {
    const { container } = render(OrderBook, { props: { bids, asks, market, locale: "en-US" } });
    const spread = container.querySelector(".cy-ob__spread") as HTMLElement;
    expect(spread.textContent).toContain("Spread");
    expect(spread.textContent).toContain("0.5");
    expect(spread.textContent).toContain("(0.001%)");
    expect(spread.dataset.crossed).toBeUndefined();
  });

  it("marks a crossed book", () => {
    const { container } = render(OrderBook, {
      props: { bids: [{ price: "101", size: "1" }], asks: [{ price: "100", size: "1" }], market },
    });
    const spread = container.querySelector(".cy-ob__spread") as HTMLElement;
    expect(spread.dataset.crossed).toBe("true");
    expect(spread.textContent).toContain("Crossed");
  });

  it("renders an empty book", () => {
    const { container } = render(OrderBook, { props: { market } });
    expect(screen.getByText("Bids: No orders")).toBeInTheDocument();
    expect(screen.getByText("Asks: No orders")).toBeInTheDocument();
    expect(container.querySelector(".cy-ob__spread")?.textContent).toContain("—");
  });

  it("ignores zero-size levels", () => {
    render(OrderBook, {
      props: { bids: [{ price: "10", size: "0" }, { price: "9.5", size: "1" }], asks: [], market },
    });
    expect(rows("Bids")).toHaveLength(1);
  });

  it("limits the levels per side", () => {
    render(OrderBook, { props: { bids, asks, market, levels: 2 } });
    expect(rows("Bids")).toHaveLength(2);
  });

  it.each([
    ["bids", 1, 0],
    ["asks", 0, 1],
  ] as const)("layout %s shows one side without the spread", (layout, bidLists, askLists) => {
    const { container } = render(OrderBook, { props: { bids, asks, market, layout } });
    expect(screen.queryAllByRole("list", { name: "Bids" })).toHaveLength(bidLists);
    expect(screen.queryAllByRole("list", { name: "Asks" })).toHaveLength(askLists);
    expect(container.querySelector(".cy-ob__spread")).toBeNull();
  });

  it("asks-only layout lists the best ask first", () => {
    render(OrderBook, { props: { bids, asks, market, layout: "asks", locale: "en-US" } });
    expect(srText(rows("Asks")[0])).toContain("64,000.5");
  });

  it("calls onpriceclick with the level price from a button", async () => {
    const onpriceclick = vi.fn();
    render(OrderBook, { props: { bids, asks, market, grouping: "1", onpriceclick, locale: "en-US" } });
    const button = screen.getByRole("button", { name: "Bid 63,999.0, Size 5.000, Total 6.000" });
    await fireEvent.click(button);
    expect(onpriceclick).toHaveBeenCalledWith("63999");
  });

  it("renders rows as buttons only when onpriceclick is set", () => {
    render(OrderBook, { props: { bids, asks, market } });
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("changes grouping from the control", async () => {
    const ongroupingchange = vi.fn();
    render(OrderBook, { props: { bids, asks, market, ongroupingchange, locale: "en-US" } });
    const select = screen.getByLabelText("Grouping") as HTMLSelectElement;
    expect([...select.options].map((o) => o.textContent)).toEqual(["0.5", "5", "50", "500"]);
    await fireEvent.change(select, { target: { value: "5.0" } });
    expect(ongroupingchange).toHaveBeenCalledWith("5.0");
    expect(rows("Bids").map(srText)).toEqual([
      "Bid 64,000.0, Size 1.000, Total 1.000",
      "Bid 63,995.0, Size 5.000, Total 6.000",
    ]);
  });

  it("drops grouping options that are not tick multiples and falls back to the tick", () => {
    render(OrderBook, {
      props: { bids, asks, market, grouping: "0.75", groupingOptions: ["0.5", "0.75", "1"] },
    });
    const select = screen.getByLabelText("Grouping") as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual(["0.5", "1"]);
    expect(select.value).toBe("0.5");
    expect(rows("Bids")).toHaveLength(3);
  });

  it("hides the control when there is a single option", () => {
    render(OrderBook, { props: { bids, asks, market, groupingOptions: ["0.5"] } });
    expect(screen.queryByLabelText("Grouping")).toBeNull();
  });

  it("localizes labels", () => {
    render(OrderBook, {
      props: { bids, asks, market, labels: { title: "Livro", bids: "Compras", bid: "Compra" } },
    });
    expect(screen.getByRole("region", { name: "Livro" })).toBeInTheDocument();
    expect(srText(rows("Compras" as "Bids")[0])).toMatch(/^Compra /);
  });

  it("renders a burst of updates once per frame, showing the last (spec scenario)", async () => {
    vi.useFakeTimers();
    const { rerender } = render(OrderBook, { props: { bids, asks, market, locale: "en-US" } });
    for (let i = 1; i <= 20; i++) {
      await rerender({ bids: [{ price: String(60000 + i), size: "1" }], asks });
    }
    // Nothing rendered yet within the frame, and only one frame is scheduled.
    expect(rows("Bids")).toHaveLength(3);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersToNextFrame();
    await tick();
    const bidRows = rows("Bids");
    expect(bidRows).toHaveLength(1);
    expect(srText(bidRows[0])).toContain("60,020.0");
  });
});
