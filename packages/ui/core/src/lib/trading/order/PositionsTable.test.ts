import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { MARKETS, POSITIONS } from "../../_testdata/trading.js";
import PositionsTable from "./PositionsTable.svelte";
import { pnlTone, priceCell, quoteAmount, sizeCell } from "./tableFormat.js";

const plain = (s: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

function row(market: string): HTMLElement {
  return screen.getByRole("rowheader", { name: market }).closest("tr") as HTMLElement;
}

function cells(market: string): string[] {
  return within(row(market))
    .getAllByRole("cell")
    .map((cell) => plain(cell.textContent));
}

describe("table formatting", () => {
  it("formats with the market precision, or falls back to the raw value", () => {
    expect(priceCell("64120", MARKETS["BTC-USDT"], "en-US")).toBe("64,120.0");
    expect(priceCell("64120", undefined)).toBe("64120");
    expect(priceCell(undefined, MARKETS["BTC-USDT"])).toBeUndefined();
    expect(sizeCell("0.25", MARKETS["BTC-USDT"], "en-US")).toBe("0.250");
    expect(sizeCell("n/a", MARKETS["BTC-USDT"])).toBe("n/a");
  });

  it("signs PnL and maps it to a trade tone", () => {
    expect(quoteAmount("217.375", 2, "en-US", true)).toBe("+217.38");
    expect(quoteAmount("-237.125", 2, "en-US", true)).toBe("-237.13");
    expect(quoteAmount("-0.001", 2, "en-US", true)).toBe("0.00");
    expect(quoteAmount("1581.264", 2, "en-US")).toBe("1,581.26");
    expect(quoteAmount("oops", 2)).toBe("oops");
    expect(pnlTone("1")).toBe("long");
    expect(pnlTone("-1")).toBe("short");
    expect(pnlTone("0.00")).toBe("flat");
    expect(pnlTone("x")).toBe("flat");
  });
});

describe("PositionsTable", () => {
  it("renders a real table with column and row headers", () => {
    render(PositionsTable, { props: { positions: POSITIONS, markets: MARKETS, locale: "en-US" } });
    const table = screen.getByRole("table", { name: "Open positions" });
    const headers = within(table).getAllByRole("columnheader").map((h) => h.textContent?.trim());
    expect(headers).toEqual([
      "Market",
      "Side",
      "Size",
      "Entry",
      "Mark",
      "Liq. price",
      "Margin",
      "Unrealized PnL (ROE)",
      "TP / SL",
    ]);
    expect(cells("BTC-USDT")).toEqual([
      "Long 10×",
      "0.250",
      "63,250.5",
      "64,120.0",
      "57,100.0",
      "1,581.26 (Cross)",
      "+217.38 (+13.75%)",
      "68,000.0 / 61,000.0",
    ]);
    expect(cells("ETH-USDT")).toEqual([
      "Short 10×",
      "3.50",
      "3,120.40",
      "3,188.15",
      "—",
      "1,092.14 (Isolated)",
      "-237.13 (-21.71%)",
      "— / —",
    ]);
  });

  it("colours PnL and side with the trade tones", () => {
    render(PositionsTable, { props: { positions: POSITIONS, markets: MARKETS, locale: "en-US" } });
    expect(within(row("BTC-USDT")).getByText(/\+217\.38/)).toHaveClass("cy-tt__long");
    expect(within(row("ETH-USDT")).getByText(/-237\.13/)).toHaveClass("cy-tt__short");
    expect(within(row("ETH-USDT")).getByText(/Short/)).toHaveClass("cy-tt__short");
  });

  it("spec scenario: market close emits intent only and the table does not change", async () => {
    const onclose = vi.fn();
    const positions = [POSITIONS[0]];
    render(PositionsTable, { props: { positions, markets: MARKETS, onclose } });
    const actions = screen.getByRole("group", { name: "BTC-USDT Long actions" });
    await fireEvent.click(within(actions).getByRole("button", { name: "Market close" }));
    expect(onclose).toHaveBeenCalledWith(positions[0], "market");
    expect(screen.getAllByRole("rowheader")).toHaveLength(1);
    expect(positions).toHaveLength(1);
  });

  it("reports limit close and TP/SL edits", async () => {
    const onclose = vi.fn();
    const onedittpsl = vi.fn();
    render(PositionsTable, { props: { positions: POSITIONS, markets: MARKETS, onclose, onedittpsl } });
    const eth = within(row("ETH-USDT"));
    await fireEvent.click(eth.getByRole("button", { name: "Limit close" }));
    await fireEvent.click(eth.getByRole("button", { name: "Edit TP/SL" }));
    expect(onclose).toHaveBeenCalledWith(POSITIONS[1], "limit");
    expect(onedittpsl).toHaveBeenCalledWith(POSITIONS[1]);
  });

  it("hides the actions column without callbacks", () => {
    render(PositionsTable, { props: { positions: POSITIONS } });
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("columnheader", { name: "Actions" })).toBeNull();
  });

  it("only renders the buttons whose callback is set", () => {
    render(PositionsTable, { props: { positions: POSITIONS, onedittpsl: vi.fn() } });
    expect(screen.queryByRole("button", { name: "Market close" })).toBeNull();
    expect(screen.getAllByRole("button", { name: "Edit TP/SL" })).toHaveLength(2);
  });

  it("shows an empty state spanning the table", () => {
    render(PositionsTable, { props: { positions: [], onclose: vi.fn() } });
    const empty = screen.getByRole("cell", { name: "No open positions" });
    expect(empty).toHaveAttribute("colspan", "10");
  });

  it("accepts labels", () => {
    render(PositionsTable, {
      props: {
        positions: POSITIONS,
        onclose: vi.fn(),
        labels: {
          caption: "Posições",
          closeMarket: "Fechar a mercado",
          sides: { long: "Compra", short: "Venda" },
          rowActions: (market: string, side: string) => `Ações ${market} ${side}`,
        },
      },
    });
    expect(screen.getByRole("table", { name: "Posições" })).toBeInTheDocument();
    const group = screen.getByRole("group", { name: "Ações BTC-USDT Compra" });
    expect(within(group).getByRole("button", { name: "Fechar a mercado" })).toBeInTheDocument();
  });
});
