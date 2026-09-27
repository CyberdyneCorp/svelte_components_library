import { render, within, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import BarChart from "./BarChart.svelte";

// The data-table fallback repeats every label, so scope text queries.
const plot = () => document.querySelector(".cy-bar-chart svg") as HTMLElement;

describe("BarChart", () => {
  const data = [
    { label: "A", value: 10 },
    { label: "B", value: 20 },
    { label: "C", value: 15 },
  ];

  it("renders the container", () => {
    render(BarChart, { props: { data } });
    const el = document.querySelector(".cy-bar-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(BarChart, { props: { data } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders bar elements for each data point", () => {
    render(BarChart, { props: { data } });
    const bars = document.querySelectorAll(".cy-bar-chart__bar");
    expect(bars.length).toBe(3);
  });

  it("displays labels", () => {
    render(BarChart, { props: { data } });
    expect(within(plot()).getByText("A")).toBeInTheDocument();
    expect(within(plot()).getByText("B")).toBeInTheDocument();
  });

  it("shows values when showValues is true", () => {
    render(BarChart, { props: { data, showValues: true } });
    const values = document.querySelectorAll(".cy-bar-chart__value");
    expect(values.length).toBe(3);
  });
});

describe("BarChart accessibility", () => {
  const data = [
    { label: "Rent", value: 1200 },
    { label: "Food", value: 450 },
  ];

  it("keeps the default accessible name without a title", () => {
    render(BarChart, { props: { data } });
    expect(screen.getByRole("img", { name: "Bar chart" })).toBeInTheDocument();
  });

  it("wires title and description to the SVG", () => {
    render(BarChart, { props: { data, title: "Spending", description: "By category" } });
    expect(screen.getByRole("img", { name: "Spending" })).toHaveAccessibleDescription("By category");
  });

  it("derives a label/value data table", () => {
    render(BarChart, { props: { data, title: "Spending" } });
    const table = screen.getByRole("table", { name: "Spending data" });
    const rows = [...table.querySelectorAll("tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Label", "Value"],
      ["Rent", "1200"],
      ["Food", "450"],
    ]);
  });

  it("toggles the table with an aria-expanded button", async () => {
    render(BarChart, { props: { data } });
    const button = screen.getByRole("button", { name: "Show data" });
    await fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("can drop the toggle", () => {
    render(BarChart, { props: { data, showDataToggle: false } });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
