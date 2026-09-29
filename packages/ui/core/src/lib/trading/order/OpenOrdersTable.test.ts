import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { MARKETS, ORDERS } from "../../_testdata/trading.js";
import OpenOrdersTable from "./OpenOrdersTable.svelte";

const plain = (s: string | null) => (s ?? "").replace(/\s+/g, " ").trim();
const formatTime = (time: number) => new Date(time).toISOString().slice(11, 16);

function cells(market: string): string[] {
  const tr = screen.getByRole("rowheader", { name: market }).closest("tr") as HTMLElement;
  return within(tr)
    .getAllByRole("cell")
    .map((cell) => plain(cell.textContent));
}

describe("OpenOrdersTable", () => {
  it("renders a real table with price or trigger, size, filled, flags and time", () => {
    render(OpenOrdersTable, {
      props: { orders: ORDERS, markets: MARKETS, locale: "en-US", formatTime },
    });
    const table = screen.getByRole("table", { name: "Open orders" });
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent?.trim())).toEqual([
      "Market",
      "Side",
      "Type",
      "Price",
      "Size",
      "Filled",
      "Reduce only",
      "TIF",
      "Time",
    ]);
    expect(cells("BTC-USDT")).toEqual([
      "Long",
      "Limit",
      "62,000.0",
      "0.100",
      "0.025",
      "No",
      "GTC",
      "12:30",
    ]);
    expect(cells("ETH-USDT")).toEqual([
      "Short",
      "Stop market",
      "Trigger 3,250.00",
      "1.50",
      "0.00",
      "Yes",
      "GTC",
      "13:05",
    ]);
    expect(within(table).getAllByRole("rowheader")[0].closest("tr")?.querySelector("time"))
      .toHaveAttribute("datetime", "2026-09-29T12:30:00.000Z");
  });

  it("shows trigger and limit for stop-limit orders and 'Market' for plain market orders", () => {
    const orders = [
      { ...ORDERS[0], id: "a", type: "stop-limit" as const, triggerPrice: "61000" },
      { ...ORDERS[0], id: "b", market: "SOL-USDT", type: "market" as const, price: undefined },
    ];
    render(OpenOrdersTable, { props: { orders, markets: MARKETS, locale: "en-US", formatTime } });
    expect(cells("BTC-USDT")[2]).toBe("Trigger 61,000.0 · 62,000.0");
    expect(cells("SOL-USDT")[2]).toBe("Market");
    expect(cells("SOL-USDT")[3]).toBe("0.1"); // no MarketSpec: raw value
  });

  it("formats time with the locale by default", () => {
    render(OpenOrdersTable, { props: { orders: [ORDERS[0]], locale: "en-US" } });
    const expected = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "medium" })
      .format(ORDERS[0].createdAt);
    expect(cells("BTC-USDT")[7]).toBe(plain(expected));
  });

  it("reports cancel and cancel-all intents only", async () => {
    const oncancel = vi.fn();
    const oncancelall = vi.fn();
    render(OpenOrdersTable, { props: { orders: ORDERS, oncancel, oncancelall } });
    await fireEvent.click(screen.getByRole("button", { name: "Cancel ETH-USDT Short Stop market" }));
    expect(oncancel).toHaveBeenCalledWith(ORDERS[1]);
    await fireEvent.click(screen.getByRole("button", { name: "Cancel all" }));
    expect(oncancelall).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("rowheader")).toHaveLength(2);
  });

  it("shows an empty state and no cancel-all without orders", () => {
    render(OpenOrdersTable, { props: { orders: [], oncancel: vi.fn(), oncancelall: vi.fn() } });
    expect(screen.getByRole("cell", { name: "No open orders" })).toHaveAttribute("colspan", "10");
    expect(screen.queryByRole("button", { name: "Cancel all" })).toBeNull();
  });

  it("hides actions without callbacks and accepts labels", () => {
    render(OpenOrdersTable, {
      props: {
        orders: [],
        labels: { caption: "Ordens abertas", empty: "Nenhuma ordem" },
      },
    });
    expect(screen.getByRole("table", { name: "Ordens abertas" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Nenhuma ordem" })).toHaveAttribute("colspan", "9");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
