import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import SwapInterface from "./SwapInterface.svelte";

describe("SwapInterface", () => {
  it("renders from and to sections", () => {
    render(SwapInterface);
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
  });

  it("displays token symbols", () => {
    render(SwapInterface);
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("USDC")).toBeInTheDocument();
  });

  it("has swap direction button", () => {
    render(SwapInterface);
    expect(screen.getByLabelText("Swap direction")).toBeInTheDocument();
  });

  it("has MAX button", () => {
    render(SwapInterface);
    expect(screen.getByText("MAX")).toBeInTheDocument();
  });

  it("disables swap button when no amount entered", () => {
    render(SwapInterface, { props: { fromAmount: "" } });
    const swapBtn = screen.getByText("Swap");
    expect(swapBtn).toBeDisabled();
  });
});
