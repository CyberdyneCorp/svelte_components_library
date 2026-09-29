import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { BTC_USDT } from "../../_testdata/trading.js";
import type { OrderDraft } from "../types.js";
import OrderTicket from "./OrderTicket.svelte";

type Props = Partial<import("svelte").ComponentProps<typeof OrderTicket>>;

function setup(props: Props = {}) {
  const onsubmit = vi.fn<(draft: OrderDraft) => void>();
  const result = render(OrderTicket, {
    props: { market: BTC_USDT, locale: "en-US", onsubmit, ...props },
  });
  return { ...result, onsubmit };
}

async function type(label: string, text: string) {
  const input = screen.getByLabelText(label) as HTMLInputElement;
  await fireEvent.focus(input);
  await fireEvent.input(input, { target: { value: text } });
  await fireEvent.blur(input);
  await fireEvent.focusOut(input);
}

/** Field text with Intl's no-break spaces as plain spaces. */
function fieldText(label: string): string {
  return (screen.getByLabelText(label) as HTMLInputElement).value.replace(/\s/g, " ");
}

function submitButton(): HTMLButtonElement {
  return screen.getByRole("button", { name: /Long|Short/ }) as HTMLButtonElement;
}

function previewValue(term: string): string {
  const group = screen.getByRole("group", { name: "Order preview" });
  const dt = within(group).getByText(term);
  return (dt.nextElementSibling?.textContent ?? "").replace(/\s/g, " ");
}

describe("OrderTicket", () => {
  it("spec scenario: a quote-denominated size is normalised on submit", async () => {
    const { onsubmit } = setup();
    await type("Price", "64000");
    await fireEvent.click(screen.getByRole("radio", { name: "USDT" }));
    await type("Size", "1000");
    expect(submitButton()).toBeEnabled();
    await fireEvent.click(submitButton());
    expect(onsubmit).toHaveBeenCalledTimes(1);
    expect(onsubmit.mock.calls[0][0]).toMatchObject({
      market: "BTC-USDT",
      side: "long",
      type: "limit",
      sizeUnit: "base",
      size: "0.015",
      price: "64000.0",
    });
  });

  it("spec scenario: a stop loss above a long limit entry shows an error and disables submit", async () => {
    const { onsubmit } = setup();
    await type("Price", "64000");
    await type("Size", "0.01");
    expect(submitButton()).toBeEnabled();
    await type("Stop loss", "65000");
    const stopLoss = screen.getByLabelText("Stop loss");
    expect(stopLoss).toHaveAttribute("aria-invalid", "true");
    expect(stopLoss).toHaveAccessibleDescription("Stop loss must be below the entry price");
    expect(submitButton()).toBeDisabled();
    await fireEvent.submit(submitButton().form!);
    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("uses a radio group for the side and colours the submit button by side", async () => {
    setup();
    const long = screen.getByRole("radio", { name: "Long" });
    const short = screen.getByRole("radio", { name: "Short" });
    expect(long).toBeChecked();
    expect(submitButton()).toHaveClass("cy-ot__submit--long");
    await fireEvent.click(short);
    expect(short).toBeChecked();
    expect(submitButton()).toHaveTextContent("Sell / Short");
    expect(submitButton()).toHaveClass("cy-ot__submit--short");
  });

  it("flips the take-profit rule for shorts", async () => {
    setup({ side: "short" });
    await type("Price", "64000");
    await type("Take profit", "65000");
    expect(screen.getByLabelText("Take profit")).toHaveAccessibleDescription(
      "Take profit must be below the entry price",
    );
  });

  it("shows fields per order type", async () => {
    setup();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
    expect(screen.queryByLabelText("Trigger price")).toBeNull();
    expect(screen.getByRole("checkbox", { name: "Post only" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Time in force" })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("radio", { name: "Stop limit" }));
    expect(screen.getByLabelText("Trigger price")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Post only" })).toBeNull();

    await fireEvent.click(screen.getByRole("radio", { name: "Stop market" }));
    expect(screen.getByLabelText("Trigger price")).toBeInTheDocument();
    expect(screen.queryByLabelText("Price")).toBeNull();
    expect(screen.queryByRole("group", { name: "Time in force" })).toBeNull();

    await fireEvent.click(screen.getByRole("radio", { name: "Market" }));
    expect(screen.queryByLabelText("Trigger price")).toBeNull();
    expect(screen.queryByLabelText("Price")).toBeNull();
  });

  it("shows a required error once a field is left empty", async () => {
    setup();
    expect(screen.queryByText("Required")).toBeNull();
    await type("Size", "");
    expect(screen.getByLabelText("Size")).toHaveAccessibleDescription("Required");
    expect(submitButton()).toBeDisabled();
  });

  it("previews notional, initial margin, fee and — only with the hook — liquidation", async () => {
    const estimateLiquidation = vi.fn(() => "58000.24");
    setup({ leverage: 20, takerFee: "0.0005", makerFee: "0.0002", estimateLiquidation });
    await type("Price", "64000");
    await type("Size", "0.015");
    expect(previewValue("Notional")).toBe("960.00 USDT");
    expect(previewValue("Initial margin")).toBe("48.00 USDT");
    expect(previewValue("Estimated fee")).toBe("0.48 USDT");
    expect(previewValue("Est. liquidation price")).toBe("58,000.2");
    expect(estimateLiquidation).toHaveBeenLastCalledWith(
      expect.objectContaining({ size: "0.015", leverage: 20, price: "64000.0" }),
    );
    await fireEvent.click(screen.getByRole("checkbox", { name: "Post only" }));
    expect(previewValue("Estimated fee")).toBe("0.20 USDT"); // 960 × 0.0002 = 0.192, rounded up
  });

  it("has no liquidation row or fee row without the hook and rates", () => {
    setup();
    const group = screen.getByRole("group", { name: "Order preview" });
    expect(within(group).queryByText("Est. liquidation price")).toBeNull();
    expect(within(group).queryByText("Estimated fee")).toBeNull();
    expect(previewValue("Notional")).toBe("—");
  });

  it("previews and validates market orders against the reference price", async () => {
    const { onsubmit } = setup({ type: "market", referencePrice: "64000", leverage: 10 });
    await type("Size", "0.01");
    expect(previewValue("Notional")).toBe("640.00 USDT");
    await type("Take profit", "63000");
    expect(screen.getByLabelText("Take profit")).toHaveAccessibleDescription(
      "Take profit must be above the entry price",
    );
    await type("Take profit", "66000");
    await fireEvent.click(submitButton());
    expect(onsubmit.mock.calls[0][0]).toEqual({
      market: "BTC-USDT",
      side: "long",
      type: "market",
      size: "0.010",
      sizeUnit: "base",
      leverage: 10,
      marginMode: "cross",
      reduceOnly: false,
      postOnly: false,
      timeInForce: "GTC",
      takeProfit: "66000.0",
    });
  });

  it("blocks leverage above the market maximum", () => {
    setup({ leverage: 80 });
    expect(screen.getByRole("alert")).toHaveTextContent("Leverage must be between 1× and 50×");
    expect(submitButton()).toBeDisabled();
  });

  it("enforces minimum notional and available margin", async () => {
    setup({ available: "10" });
    await type("Price", "1000");
    await type("Size", "0.001");
    expect(screen.getByLabelText("Size")).toHaveAccessibleDescription(
      "Minimum order value is 5 USDT",
    );
    await type("Size", "1");
    expect(screen.getByLabelText("Size")).toHaveAccessibleDescription(
      "Insufficient available margin",
    );
    await fireEvent.click(screen.getByRole("checkbox", { name: "Reduce only" }));
    expect(screen.getByLabelText("Size")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("sizes from the percentage slider and reads it back", async () => {
    setup({ available: "1000", leverage: 10 });
    const percent = screen.getByRole("slider", { name: /percentage/ }) as HTMLInputElement;
    expect(percent).toBeDisabled(); // no entry price yet for a base size
    await type("Price", "64000");
    expect(percent).toBeEnabled();
    await fireEvent.input(percent, { target: { value: "50" } });
    expect(fieldText("Size")).toBe("0.078 BTC");
    expect(percent).toHaveAttribute("aria-valuetext", "50%"); // 0.078 × 64000 = 4992 of 10000 ≈ 50%
    expect(screen.getByText("Available").nextElementSibling).toHaveTextContent("1,000.00 USDT");
  });

  it("converts the size when switching units", async () => {
    setup();
    await type("Price", "64000");
    await type("Size", "0.015");
    await fireEvent.click(screen.getByRole("radio", { name: "USDT" }));
    expect(fieldText("Size")).toBe("960.00 USDT");
    await fireEvent.click(screen.getByRole("radio", { name: "BTC" }));
    expect(fieldText("Size")).toBe("0.015 BTC");
  });

  it("emits margin mode, reduce-only, post-only and time in force", async () => {
    const { onsubmit } = setup();
    await type("Price", "64000");
    await type("Size", "0.01");
    await fireEvent.click(screen.getByRole("radio", { name: "Isolated" }));
    await fireEvent.click(screen.getByRole("radio", { name: "IOC" }));
    await fireEvent.click(screen.getByRole("checkbox", { name: "Reduce only" }));
    await fireEvent.click(screen.getByRole("checkbox", { name: "Post only" }));
    await fireEvent.click(submitButton());
    expect(onsubmit.mock.calls[0][0]).toMatchObject({
      marginMode: "isolated",
      timeInForce: "IOC",
      reduceOnly: true,
      postOnly: true,
    });
  });

  it("accepts labels for every string", () => {
    setup({
      labels: {
        form: "Boleta",
        price: "Preço",
        sides: { long: "Compra", short: "Venda" },
        submit: (side) => (side === "long" ? "Comprar" : "Vender"),
        leverage: { label: "Alavancagem" },
      },
    });
    expect(screen.getByRole("form", { name: "Boleta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Preço")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Compra" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Comprar" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Alavancagem" })).toBeInTheDocument();
  });

  it("disables every control when disabled", () => {
    setup({ disabled: true });
    expect(screen.getByLabelText("Price")).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Long" })).toBeDisabled();
    expect(screen.getByRole("slider", { name: "Leverage" })).toBeDisabled();
    expect(submitButton()).toBeDisabled();
  });
});
