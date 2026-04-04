import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
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

  it("filters tokens by search query on symbol", async () => {
    render(TokenSelector, { props: { tokens, open: true, search: "eth" } });
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.queryByText("USD Coin")).not.toBeInTheDocument();
    expect(screen.queryByText("Dai")).not.toBeInTheDocument();
  });

  it("filters tokens by search query on name", async () => {
    render(TokenSelector, { props: { tokens, open: true, search: "usd" } });
    expect(screen.getByText("USD Coin")).toBeInTheDocument();
    expect(screen.queryByText("Ethereum")).not.toBeInTheDocument();
  });

  it("shows empty state when no tokens match search", () => {
    render(TokenSelector, { props: { tokens, open: true, search: "xyz" } });
    expect(screen.getByText("No tokens found")).toBeInTheDocument();
  });

  it("calls onselect when a token is clicked", async () => {
    const onselect = vi.fn();
    render(TokenSelector, { props: { tokens, open: true, onselect } });
    const ethOption = screen.getByText("Ethereum").closest("button")!;
    await fireEvent.click(ethOption);
    expect(onselect).toHaveBeenCalledWith(tokens[0]);
  });

  it("closes dialog when close button is clicked", async () => {
    const { container } = render(TokenSelector, { props: { tokens, open: true } });
    await fireEvent.click(screen.getByLabelText("Close"));
    // After closing, the overlay should be gone
    const overlay = container.querySelector(".cy-token-selector__overlay");
    expect(overlay).not.toBeInTheDocument();
  });

  it("closes dialog on Escape key", async () => {
    const { container } = render(TokenSelector, { props: { tokens, open: true } });
    const searchInput = screen.getByPlaceholderText("Search by name or symbol");
    await fireEvent.keyDown(searchInput, { key: "Escape" });
    const overlay = container.querySelector(".cy-token-selector__overlay");
    expect(overlay).not.toBeInTheDocument();
  });

  it("navigates with ArrowDown and selects with Enter", async () => {
    const onselect = vi.fn();
    render(TokenSelector, { props: { tokens, open: true, onselect } });
    const searchInput = screen.getByPlaceholderText("Search by name or symbol");
    await fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    await fireEvent.keyDown(searchInput, { key: "Enter" });
    expect(onselect).toHaveBeenCalledWith(tokens[1]);
  });

  it("navigates with ArrowUp", async () => {
    const onselect = vi.fn();
    render(TokenSelector, { props: { tokens, open: true, onselect } });
    const searchInput = screen.getByPlaceholderText("Search by name or symbol");
    await fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    await fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    await fireEvent.keyDown(searchInput, { key: "ArrowUp" });
    await fireEvent.keyDown(searchInput, { key: "Enter" });
    expect(onselect).toHaveBeenCalledWith(tokens[1]);
  });

  it("shows popular tokens when search is empty", () => {
    render(TokenSelector, { props: { tokens, open: true } });
    expect(screen.getByText("Popular")).toBeInTheDocument();
  });

  it("hides popular tokens when search has value", () => {
    render(TokenSelector, { props: { tokens, open: true, search: "eth" } });
    expect(screen.queryByText("Popular")).not.toBeInTheDocument();
  });

  it("selects token via popular chip click", async () => {
    const onselect = vi.fn();
    render(TokenSelector, { props: { tokens, open: true, onselect } });
    // Popular chips show token symbols
    const chips = screen.getAllByText("ETH");
    const popularChip = chips.find((el) =>
      el.closest(".cy-token-selector__popular-chip")
    )!;
    await fireEvent.click(popularChip.closest("button")!);
    expect(onselect).toHaveBeenCalledWith(tokens[0]);
  });

  it("displays token balance when provided", () => {
    render(TokenSelector, { props: { tokens, open: true } });
    expect(screen.getByText("5.23")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
  });

  it("displays token icon when provided", () => {
    const tokensWithIcon = [
      { symbol: "ETH", name: "Ethereum", icon: "E", balance: "5.23" },
    ];
    render(TokenSelector, { props: { tokens: tokensWithIcon, open: true } });
    // The icon should be rendered in the item
    const icons = screen.getAllByText("E");
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it("closes on overlay click", async () => {
    const { container } = render(TokenSelector, { props: { tokens, open: true } });
    const overlay = container.querySelector(".cy-token-selector__overlay") as HTMLElement;
    await fireEvent.click(overlay);
    const overlayAfter = container.querySelector(".cy-token-selector__overlay");
    expect(overlayAfter).not.toBeInTheDocument();
  });

  it("updates activeIndex on mouseenter", async () => {
    const onselect = vi.fn();
    render(TokenSelector, { props: { tokens, open: true, onselect } });
    // Hover over the third token
    const daiOption = screen.getByText("Dai").closest("button")!;
    await fireEvent.mouseEnter(daiOption);
    // Now press Enter to select whatever is active
    const searchInput = screen.getByPlaceholderText("Search by name or symbol");
    await fireEvent.keyDown(searchInput, { key: "Enter" });
    expect(onselect).toHaveBeenCalledWith(tokens[2]);
  });
});
