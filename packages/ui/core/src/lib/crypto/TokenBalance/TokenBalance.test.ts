import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TokenBalance from "./TokenBalance.svelte";

describe("TokenBalance", () => {
  it("renders with required props", () => {
    render(TokenBalance, { props: { symbol: "ETH", balance: "5.23" } });
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("5.23")).toBeInTheDocument();
  });

  it("displays USD value when provided", () => {
    render(TokenBalance, { props: { symbol: "ETH", balance: "5.23", usdValue: "$10,500" } });
    expect(screen.getByText("$10,500")).toBeInTheDocument();
  });

  it("displays positive change", () => {
    render(TokenBalance, { props: { symbol: "ETH", balance: "5.23", change: 3.45 } });
    expect(screen.getByText("+3.45%")).toBeInTheDocument();
  });

  it("displays negative change", () => {
    render(TokenBalance, { props: { symbol: "ETH", balance: "5.23", change: -2.1 } });
    expect(screen.getByText("-2.10%")).toBeInTheDocument();
  });

  it("does not show change when not provided", () => {
    const { container } = render(TokenBalance, { props: { symbol: "ETH", balance: "5.23" } });
    const change = container.querySelector(".cy-token-balance__change");
    expect(change).not.toBeInTheDocument();
  });
});
