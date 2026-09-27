import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import BudgetBar from "./BudgetBar.svelte";

const eur = { currency: "EUR", locale: "en-IE", label: "Groceries" };

function meter() {
  return screen.getByRole("meter", { name: "Groceries" });
}

describe("BudgetBar", () => {
  it("exposes a named meter with min, max and value from the ratio", () => {
    render(BudgetBar, { props: { ...eur, spent: "500", limit: "1000" } });
    const el = meter();
    expect(el).toHaveAttribute("aria-valuemin", "0");
    expect(el).toHaveAttribute("aria-valuemax", "100");
    expect(el).toHaveAttribute("aria-valuenow", "50");
    expect(el).toHaveAttribute("aria-valuetext", "€500.00 of €1,000.00, within budget");
  });

  it("marks the approaching state with text, icon and class", () => {
    const { container } = render(BudgetBar, { props: { ...eur, spent: "820", limit: "1000" } });
    expect(meter()).toHaveAttribute("aria-valuenow", "82");
    expect(meter()).toHaveAttribute("aria-valuetext", "€820.00 of €1,000.00, approaching limit");
    expect(container.querySelector(".cy-budget")).toHaveClass("cy-budget--approaching");
    expect(container.querySelector(".cy-budget__state")).toHaveTextContent("approaching limit");
    expect(container.querySelector(".cy-budget__state svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("caps an exceeded bar at 100% and shows the overage", () => {
    const { container } = render(BudgetBar, { props: { ...eur, spent: "1120.50", limit: "1000" } });
    expect(meter()).toHaveAttribute("aria-valuenow", "100");
    expect(meter()).toHaveAttribute(
      "aria-valuetext",
      "€1,120.50 of €1,000.00, €120.50 over, limit exceeded",
    );
    expect((container.querySelector(".cy-budget__spent") as HTMLElement).style.width).toBe("100%");
    expect(container.querySelector(".cy-budget__overage")).toHaveTextContent("€120.50 over");
    expect(container.querySelector(".cy-budget")).toHaveClass("cy-budget--exceeded");
  });

  it("uses a distinct icon per state", () => {
    const markup = ["100", "900", "1100"].map((spent) => {
      const { container } = render(BudgetBar, { props: { ...eur, spent, limit: "1000" } });
      return container.querySelector(".cy-budget__state svg")?.innerHTML;
    });
    expect(new Set(markup).size).toBe(3);
  });

  it("draws committed stacked after spent and mentions it in text", () => {
    const { container } = render(BudgetBar, {
      props: { ...eur, spent: "600", committed: "150", limit: "1000" },
    });
    const segments = container.querySelectorAll(".cy-budget__track > div");
    expect([...segments].map((s) => s.className.split(" ")[0])).toEqual([
      "cy-budget__spent",
      "cy-budget__committed",
    ]);
    expect((segments[1] as HTMLElement).style.width).toBe("15%");
    expect(meter()).toHaveAttribute("aria-valuetext", "€600.00 of €1,000.00, €150.00 committed, within budget");
  });

  it("does not divide by a zero limit", () => {
    render(BudgetBar, { props: { ...eur, spent: "25", limit: "0" } });
    expect(meter()).toHaveAttribute("aria-valuenow", "100");
    expect(meter()).toHaveAttribute("aria-valuetext", "€25.00 of €0.00, €25.00 over, limit exceeded");
  });

  it("renders an invalid limit as zero instead of NaN", () => {
    const { container } = render(BudgetBar, { props: { ...eur, spent: "0", limit: "n/a" } });
    expect(meter()).toHaveAttribute("aria-valuenow", "0");
    expect(container.textContent).not.toContain("NaN");
  });

  it("formats with the locale and currency minor units", () => {
    render(BudgetBar, { props: { label: "Groceries", currency: "EUR", locale: "de-DE", spent: "1234.5", limit: "2000" } });
    expect(meter().getAttribute("aria-valuetext")).toContain("1.234,50 € of 2.000,00 €");
  });

  it("keeps large amounts exact", () => {
    render(BudgetBar, {
      props: { label: "Groceries", currency: "USD", locale: "en-US", spent: "12345678901234.56", limit: "20000000000000" },
    });
    expect(meter().getAttribute("aria-valuetext")).toContain("$12,345,678,901,234.56 of $20,000,000,000,000.00");
  });

  it("accepts translated state labels and messages", () => {
    const { container } = render(BudgetBar, {
      props: {
        ...eur,
        spent: "1200",
        limit: "1000",
        stateLabels: { exceeded: "orçamento estourado" },
        messages: { amount: (s: string, l: string) => `${s} de ${l}`, overage: (o: string) => `${o} acima` },
      },
    });
    expect(meter()).toHaveAttribute("aria-valuetext", "€1,200.00 de €1,000.00, €200.00 acima, orçamento estourado");
    expect(container.querySelector(".cy-budget__state")).toHaveTextContent("orçamento estourado");
  });

  it("honours custom thresholds", () => {
    const { container } = render(BudgetBar, {
      props: { ...eur, spent: "500", limit: "1000", thresholds: [0.5, 0.9] as const },
    });
    expect(container.querySelector(".cy-budget")).toHaveClass("cy-budget--approaching");
  });

  it("never shows a rounded amount that disagrees with the state", () => {
    render(BudgetBar, { props: { ...eur, spent: "1000.009", limit: "1000" } });
    expect(meter()).toHaveAttribute("aria-valuetext", "€1,000.00 of €1,000.00, approaching limit");
  });

  it("lets ariaLabel override the meter name", () => {
    render(BudgetBar, { props: { ...eur, spent: "1", limit: "10", ariaLabel: "Groceries budget" } });
    expect(screen.getByRole("meter", { name: "Groceries budget" })).toBeInTheDocument();
  });
});
