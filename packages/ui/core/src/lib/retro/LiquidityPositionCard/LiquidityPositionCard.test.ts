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
});
