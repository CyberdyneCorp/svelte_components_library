import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import GasEstimate from "./GasEstimate.svelte";

describe("GasEstimate", () => {
  const gasProps = {
    slow: { gwei: "15", time: "~10 min", usd: "$1.20" },
    standard: { gwei: "25", time: "~3 min", usd: "$2.00" },
    fast: { gwei: "40", time: "~30 sec", usd: "$3.50" },
  };

  it("renders the title", () => {
    render(GasEstimate, { props: gasProps });
    expect(screen.getByText("Gas Estimate")).toBeInTheDocument();
  });

  it("displays all three gas options", () => {
    render(GasEstimate, { props: gasProps });
    expect(screen.getByText("Slow")).toBeInTheDocument();
    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText("Fast")).toBeInTheDocument();
  });

  it("displays gwei values", () => {
    render(GasEstimate, { props: gasProps });
    expect(screen.getByText("15 gwei")).toBeInTheDocument();
    expect(screen.getByText("25 gwei")).toBeInTheDocument();
  });

  it("selects standard by default", () => {
    const { container } = render(GasEstimate, { props: gasProps });
    const selected = container.querySelector(".cy-gas__option--selected");
    expect(selected).toBeInTheDocument();
    expect(selected?.textContent).toContain("Standard");
  });

  it("renders options as buttons", () => {
    render(GasEstimate, { props: gasProps });
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
  });
});
