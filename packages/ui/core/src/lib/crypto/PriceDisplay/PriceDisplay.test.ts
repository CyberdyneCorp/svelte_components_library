import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PriceDisplay from "./PriceDisplay.svelte";

describe("PriceDisplay", () => {
  it("renders with required props", () => {
    render(PriceDisplay, { props: { symbol: "BTC", price: "$42,000" } });
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText("$42,000")).toBeInTheDocument();
  });

  it("displays period", () => {
    render(PriceDisplay, { props: { symbol: "BTC", price: "$42,000", period: "7d" } });
    expect(screen.getByText("7d")).toBeInTheDocument();
  });

  it("displays positive change", () => {
    render(PriceDisplay, { props: { symbol: "BTC", price: "$42,000", change: 5.5 } });
    expect(screen.getByText("+5.50%")).toBeInTheDocument();
  });

  it("displays negative change", () => {
    render(PriceDisplay, { props: { symbol: "BTC", price: "$42,000", change: -3.2 } });
    expect(screen.getByText("-3.20%")).toBeInTheDocument();
  });

  it("does not render change section when not provided", () => {
    const { container } = render(PriceDisplay, { props: { symbol: "BTC", price: "$42,000" } });
    const change = container.querySelector(".cy-price__change");
    expect(change).not.toBeInTheDocument();
  });
});
