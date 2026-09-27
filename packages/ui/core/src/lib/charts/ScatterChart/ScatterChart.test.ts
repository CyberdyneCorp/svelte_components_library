import { render, screen, fireEvent, within } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ScatterChart from "./ScatterChart.svelte";

// The data-table fallback repeats every label, so scope text queries.
const legend = () => document.querySelector(".cy-scatter-chart__legend") as HTMLElement;
const plot = () => document.querySelector(".cy-scatter-chart svg") as HTMLElement;

describe("ScatterChart", () => {
  const series = [
    {
      name: "Test",
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
      ],
    },
  ];

  const multiSeries = [
    { name: "A", data: [{ x: 1, y: 5 }, { x: 2, y: 10 }] },
    { name: "B", data: [{ x: 3, y: 8 }, { x: 4, y: 12 }] },
  ];

  it("renders the container", () => {
    render(ScatterChart, { props: { series } });
    const el = document.querySelector(".cy-scatter-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(ScatterChart, { props: { series } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders data points", () => {
    render(ScatterChart, { props: { series } });
    const points = document.querySelectorAll(".cy-scatter-chart__point");
    expect(points.length).toBe(3);
  });

  it("renders grid lines when showGrid is true", () => {
    render(ScatterChart, { props: { series, showGrid: true } });
    const grid = document.querySelectorAll(".cy-scatter-chart__grid");
    expect(grid.length).toBeGreaterThan(0);
  });

  it("hides grid when showGrid is false", () => {
    render(ScatterChart, { props: { series, showGrid: false } });
    const grid = document.querySelectorAll(".cy-scatter-chart__grid");
    expect(grid.length).toBe(0);
  });

  it("shows legend with multiple series", () => {
    render(ScatterChart, { props: { series: multiSeries, showLegend: true } });
    expect(within(legend()).getByText("A")).toBeInTheDocument();
    expect(within(legend()).getByText("B")).toBeInTheDocument();
  });

  it("renders with empty series", () => {
    render(ScatterChart, { props: { series: [] } });
    const el = document.querySelector(".cy-scatter-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders axis labels", () => {
    render(ScatterChart, { props: { series, xLabel: "X Axis", yLabel: "Y Axis" } });
    expect(within(plot()).getByText("X Axis")).toBeInTheDocument();
    expect(within(plot()).getByText("Y Axis")).toBeInTheDocument();
  });
});

describe("ScatterChart accessibility", () => {
  const twoSeries = [
    { name: "Stocks", data: [{ x: 1, y: 5, label: "AAPL" }, { x: 2, y: 7 }] },
    { name: "Bonds", data: [{ x: 1.5, y: 2 }] },
  ];

  it("keeps the default accessible name without a title", () => {
    render(ScatterChart, { props: { series: twoSeries } });
    expect(screen.getByRole("img", { name: "Scatter chart" })).toBeInTheDocument();
  });

  it("wires title and description to the SVG", () => {
    render(ScatterChart, { props: { series: twoSeries, title: "Risk vs return", description: "Per asset" } });
    expect(screen.getByRole("img", { name: "Risk vs return" })).toHaveAccessibleDescription("Per asset");
  });

  it("derives one table row per point, with a label column when points have labels", () => {
    render(ScatterChart, { props: { series: twoSeries, xLabel: "Risk", yLabel: "Return" } });
    const rows = [...document.querySelectorAll("table tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Series", "Risk", "Return", "Label"],
      ["Stocks", "1", "5", "AAPL"],
      ["Stocks", "2", "7", ""],
      ["Bonds", "1.5", "2", ""],
    ]);
  });

  it("omits the label column when no point has a label", () => {
    render(ScatterChart, { props: { series: [{ name: "S", data: [{ x: 1, y: 2 }] }] } });
    const headers = [...document.querySelectorAll("th[scope=col]")].map((h) => h.textContent);
    expect(headers).toEqual(["Series", "x", "y"]);
  });

  it("toggles the table with an aria-expanded button", async () => {
    render(ScatterChart, { props: { series: twoSeries } });
    const button = screen.getByRole("button", { name: "Show data" });
    await fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("draws each series' points with its own marker shape, matching the legend", () => {
    render(ScatterChart, { props: { series: twoSeries } });
    const points = [...document.querySelectorAll(".cy-scatter-chart__point")];
    expect(points.map((p) => p.getAttribute("data-marker"))).toEqual(["circle", "circle", "square"]);
    const legend = [...document.querySelectorAll(".cy-scatter-chart__legend-item")];
    expect(legend.map((li) => li.getAttribute("data-marker"))).toEqual(["circle", "square"]);
  });
});
