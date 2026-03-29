import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TokenSelector from "./TokenSelector.svelte";

describe("TokenSelector", () => {
  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "5.23" },
    { symbol: "USDC", name: "USD Coin", balance: "1000" },
    { symbol: "DAI", name: "Dai", balance: "500" },
  ];

  it("does not render when open is false", () => {
    const { container } = render(TokenSelector, { props: { tokens, open: false } });
    const overlay = container.querySelector(".cy-token-selector__overlay");
    expect(overlay).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(TokenSelector, { props: { tokens, open: true } });
    expect(screen.getByText("Select a token")).toBeInTheDocument();
  });

  it("displays token list", () => {
    render(TokenSelector, { props: { tokens, open: true } });
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.getByText("USD Coin")).toBeInTheDocument();
  });

  it("has search input", () => {
    render(TokenSelector, { props: { tokens, open: true } });
    expect(screen.getByPlaceholderText("Search by name or symbol")).toBeInTheDocument();
  });

  it("has accessible close button", () => {
    render(TokenSelector, { props: { tokens, open: true } });
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });
});
