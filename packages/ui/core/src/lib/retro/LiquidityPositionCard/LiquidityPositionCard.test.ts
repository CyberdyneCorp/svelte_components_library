import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import LiquidityPositionCard from "./LiquidityPositionCard.svelte";

const base = {
  tokenA: "WETH",
  tokenB: "USDC",
  value: 12600,
  pnl: -316.96,
  range: { min: 3100, max: 4100, lower: 3200, upper: 3900, current: 4500 },
  feeApyPct: 68.43,
  uncollected: 7.91,
};

describe("LiquidityPositionCard", () => {
  it("renders pair", () => {
    render(LiquidityPositionCard, { props: base });
    expect(screen.getByText("WETH/USDC")).toBeInTheDocument();
  });
  it("has accessible label", () => {
    render(LiquidityPositionCard, { props: base });
    expect(screen.getByLabelText("Position WETH/USDC")).toBeInTheDocument();
  });
  it("renders formatted value", () => {
    render(LiquidityPositionCard, { props: base });
    expect(screen.getByText("$12,600")).toBeInTheDocument();
  });
  it("renders negative P&L with down class", () => {
    const { container } = render(LiquidityPositionCard, { props: base });
    expect(container.querySelector(".cy-lpos__pnl--down")).toBeInTheDocument();
    expect(screen.getByTestId("cy-lpos-pnl")).toHaveTextContent("-$316.96");
  });
  it("renders positive P&L with up class", () => {
    const { container } = render(LiquidityPositionCard, { props: { ...base, pnl: 125.43 } });
    expect(container.querySelector(".cy-lpos__pnl--up")).toBeInTheDocument();
    expect(screen.getByTestId("cy-lpos-pnl")).toHaveTextContent("+$125.43");
  });
  it("zero P&L has neither up nor down class", () => {
    const { container } = render(LiquidityPositionCard, { props: { ...base, pnl: 0 } });
    expect(container.querySelector(".cy-lpos__pnl--up")).not.toBeInTheDocument();
    expect(container.querySelector(".cy-lpos__pnl--down")).not.toBeInTheDocument();
  });
  it("renders Fee APY", () => {
    render(LiquidityPositionCard, { props: base });
    expect(screen.getByTestId("cy-lpos-fee")).toHaveTextContent("68.43%");
  });
  it("renders Uncollected", () => {
    render(LiquidityPositionCard, { props: base });
    expect(screen.getByTestId("cy-lpos-uncollected")).toHaveTextContent("$7.91");
  });
  it("renders embedded LiquidityRangeBar", () => {
    render(LiquidityPositionCard, { props: base });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
  it("shows Out of Range when current above upper", () => {
    render(LiquidityPositionCard, { props: base });
    expect(screen.getByText("Out of Range")).toBeInTheDocument();
  });
  it("supports custom currency", () => {
    render(LiquidityPositionCard, { props: { ...base, currency: "€" } });
    expect(screen.getByText("€12,600")).toBeInTheDocument();
  });
  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(LiquidityPositionCard, { props: { ...base, onClick } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("keeps the number-prop markup unchanged (regression)", () => {
    render(LiquidityPositionCard, { props: base });
    expect(screen.getByTestId("cy-lpos-value")).toHaveTextContent(/^\$12,600$/);
    expect(screen.getByTestId("cy-lpos-pnl")).toHaveTextContent(/^-\$316\.96$/);
    expect(screen.getByTestId("cy-lpos-fee")).toHaveTextContent(/^68\.43%$/);
    expect(screen.getByTestId("cy-lpos-uncollected")).toHaveTextContent(/^\$7\.91$/);
    expect(screen.queryByTestId("cy-lpos-subtitle")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cy-lpos-fee-tier")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cy-lpos-range-text")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-describedby");
  });
});

const decimalBase = {
  tokenA: "WETH",
  tokenB: "USDC",
  range: base.range,
  locale: "en-US",
};

describe("LiquidityPositionCard — decimal-safe props", () => {
  it("renders an 18-decimal value exactly, without float maths", () => {
    render(LiquidityPositionCard, {
      props: {
        ...decimalBase,
        valueMoney: { amount: "0.000000000000000001", currency: "ETH", decimals: 18 },
      },
    });
    expect(screen.getByTestId("cy-lpos-value")).toHaveTextContent("0.000000000000000001 ETH");
  });

  it("keeps digits a float would lose", () => {
    render(LiquidityPositionCard, {
      props: {
        ...decimalBase,
        valueMoney: { amount: "123456789012345678.123456789012345678", currency: "ETH", decimals: 18 },
      },
    });
    expect(screen.getByTestId("cy-lpos-value")).toHaveTextContent(
      "123,456,789,012,345,678.123456789012345678 ETH",
    );
  });

  it("formats ISO money with the given locale", () => {
    render(LiquidityPositionCard, {
      props: { ...decimalBase, locale: "pt-BR", valueMoney: { amount: "12600.5", currency: "BRL" } },
    });
    expect(screen.getByTestId("cy-lpos-value")).toHaveTextContent(/R\$\s12\.600,50/);
  });

  it("valueMoney and pnlMoney take precedence over value and pnl", () => {
    render(LiquidityPositionCard, {
      props: {
        ...base,
        locale: "en-US",
        valueMoney: { amount: "1.5", currency: "USD" },
        pnlMoney: { amount: "-0.25", currency: "USD" },
      },
    });
    expect(screen.getByTestId("cy-lpos-value")).toHaveTextContent(/^\$1\.50$/);
    expect(screen.getByTestId("cy-lpos-pnl")).toHaveTextContent(/^-\$0\.25$/);
    expect(screen.queryByText("$12,600")).not.toBeInTheDocument();
  });

  it("signs and colours pnlMoney", () => {
    const { container, rerender } = render(LiquidityPositionCard, {
      props: { ...decimalBase, pnlMoney: { amount: "125.43", currency: "USD" } },
    });
    expect(screen.getByTestId("cy-lpos-pnl")).toHaveTextContent("+$125.43");
    expect(container.querySelector(".cy-currency--positive")).toBeInTheDocument();
    rerender({ ...decimalBase, pnlMoney: { amount: "-316.96", currency: "USD" } });
    expect(screen.getByTestId("cy-lpos-pnl")).toHaveTextContent("-$316.96");
    expect(container.querySelector(".cy-currency--negative")).toBeInTheDocument();
    rerender({ ...decimalBase, pnlMoney: { amount: "0", currency: "USD" } });
    expect(screen.getByTestId("cy-lpos-pnl")).toHaveTextContent(/^\$0\.00$/);
  });

  it("renders uncollected fees per token plus the approximate total", () => {
    render(LiquidityPositionCard, {
      props: {
        ...base,
        locale: "en-US",
        uncollectedFees: [
          { asset: "WETH", amount: "0.001234567890123456", decimals: 18 },
          { asset: "USDC", amount: "3.21" },
        ],
        uncollectedTotal: { amount: "7.91", currency: "USD" },
      },
    });
    const fees = screen.getAllByTestId("cy-lpos-uncollected-fee");
    expect(fees.map((f) => f.textContent?.trim())).toEqual([
      "0.001234567890123456\u00a0WETH",
      "3.21\u00a0USDC",
    ]);
    expect(screen.getByTestId("cy-lpos-uncollected-total")).toHaveTextContent("≈ $7.91");
    // The number prop is ignored once the decimal ones are set.
    expect(screen.getByTestId("cy-lpos-uncollected")).not.toHaveTextContent(/^\$7\.91$/);
  });

  it("keeps a fee amount's own fraction digits when decimals is omitted", () => {
    render(LiquidityPositionCard, {
      props: { ...decimalBase, uncollectedFees: [{ asset: "WETH", amount: "0.000000000000000001" }] },
    });
    expect(screen.getByTestId("cy-lpos-uncollected-fee")).toHaveTextContent(
      "0.000000000000000001 WETH",
    );
  });

  it("shows only the total when no per-token fees are given", () => {
    render(LiquidityPositionCard, {
      props: { ...decimalBase, uncollectedTotal: { amount: "7.91", currency: "USD" } },
    });
    expect(screen.queryByTestId("cy-lpos-uncollected-fee")).not.toBeInTheDocument();
    expect(screen.getByTestId("cy-lpos-uncollected-total")).toHaveTextContent("≈ $7.91");
  });

  it("hides the P&L, fee APY and uncollected rows when absent", () => {
    const { container } = render(LiquidityPositionCard, {
      props: { ...decimalBase, valueMoney: { amount: "10", currency: "USD" } },
    });
    expect(screen.queryByTestId("cy-lpos-pnl")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cy-lpos-fee")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cy-lpos-uncollected")).not.toBeInTheDocument();
    expect(container.querySelector(".cy-lpos__bottom")).not.toBeInTheDocument();
  });

  it("hides only the rows that are absent", () => {
    render(LiquidityPositionCard, { props: { ...base, pnl: undefined, uncollected: undefined } });
    expect(screen.queryByTestId("cy-lpos-pnl")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cy-lpos-uncollected")).not.toBeInTheDocument();
    expect(screen.getByTestId("cy-lpos-fee")).toHaveTextContent("68.43%");
  });

  it("shows the fee tier in the title and the subtitle parts", () => {
    render(LiquidityPositionCard, {
      props: {
        ...decimalBase,
        feeTier: "0.05%",
        tokenId: "812345",
        chain: "Ethereum",
        walletLabel: "Cold wallet",
      },
    });
    expect(screen.getByTestId("cy-lpos-fee-tier")).toHaveTextContent("0.05%");
    expect(screen.getByTestId("cy-lpos-subtitle")).toHaveTextContent(
      "#812345 · Ethereum · Cold wallet",
    );
  });

  it("skips missing subtitle parts", () => {
    render(LiquidityPositionCard, { props: { ...decimalBase, chain: "Base" } });
    expect(screen.getByTestId("cy-lpos-subtitle")).toHaveTextContent(/^Base$/);
  });

  it("announces rangeText and hides the decorative range bar", () => {
    const rangeText = "Out of range: 3,200 to 3,900 USDC per WETH, current 4,500";
    render(LiquidityPositionCard, { props: { ...decimalBase, rangeText } });
    const sentence = screen.getByTestId("cy-lpos-range-text");
    expect(sentence).toHaveTextContent(rangeText);
    expect(screen.getByRole("button")).toHaveAttribute("aria-describedby", sentence.id);
    expect(screen.getByRole("button")).toHaveAccessibleDescription(rangeText);
    expect(screen.getByTestId("cy-lpos-range")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(document.querySelector('[role="progressbar"]')).toBeNull();
    expect(document.querySelector("[aria-valuenow]")).toBeNull();
  });
});
