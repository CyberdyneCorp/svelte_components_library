<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import TradingTerminalDemo from "../_testdata/TradingTerminalDemo.svelte";

  const { Story } = defineMeta({
    title: "Trading/Terminal",
    component: TradingTerminalDemo,
    parameters: {
      layout: "fullscreen",
      // Axe violations fail the storybook test project for this story.
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "A futures terminal assembled from the Trading components and one simulated feed: TickerBar, TradingChart (EMA 9/21, SMA 200, Bollinger Bands, volume, RSI and MACD panes, fill markers, entry / TP / SL / liquidation lines), OrderBook, RecentTrades, OrderTicket, PositionsTable and OpenOrdersTable. Click a book level to fill the ticket price; submit to open a position or rest an order; drag the TP / SL lines (or focus the chart and press L, ↑/↓, Enter) to move them; close positions and cancel orders from the tables. Everything is simulated in the story — the components only render props and report intent.",
        },
      },
    },
  });

  /** Smoke test: a book click fills the ticket price, and submitting opens a position. */
  async function bookToPosition({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Pause feed" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Short" }));

    const bids = canvas.getByRole("list", { name: "Bids" });
    const best = within(bids).getAllByRole("button")[0];
    const levelPrice = /[\d,]+\.\d+/.exec(best.textContent ?? "")![0].replace(/,/g, "");
    await userEvent.click(best);
    const priceInput = canvas.getByLabelText("Price") as HTMLInputElement;
    await waitFor(() => expect(Number(priceInput.value.replace(/[^\d.]/g, ""))).toBe(Number(levelPrice)));

    const positions = canvas.getByRole("table", { name: "Open positions" });
    const rowsBefore = within(positions).getAllByRole("row").length;
    const size = canvas.getByLabelText("Size");
    await userEvent.click(size);
    await userEvent.keyboard("0.05");
    await userEvent.click(canvas.getByRole("button", { name: "Sell / Short" }));

    await waitFor(() => expect(within(positions).getAllByRole("row")).toHaveLength(rowsBefore + 1));
    await expect(within(positions).getAllByText(/^Short\b/).length).toBeGreaterThan(0);
  }
</script>

<Story name="Terminal" asChild play={bookToPosition}>
  <TradingTerminalDemo />
</Story>

<!-- Phone layout: the grid stacks in reading order (ticker, chart, ticket, book, tape, account). -->
<Story name="Phone" asChild globals={{ viewport: { value: "mobile1", isRotated: false } }}>
  <TradingTerminalDemo />
</Story>
