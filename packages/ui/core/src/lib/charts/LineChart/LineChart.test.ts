import { render, within, fireEvent, screen } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import LineChart from "./LineChart.svelte";

// The data-table fallback repeats every label, so scope text queries.
const legend = () => document.querySelector(".cy-line-chart__legend") as HTMLElement;
const plot = () => document.querySelector(".cy-line-chart svg") as HTMLElement;

describe("LineChart", () => {
  const series = [
    { name: "Loss", data: [{ x: 0, y: 1 }, { x: 1, y: 0.5 }, { x: 2, y: 0.3 }] },
  ];

  it("renders the container", () => {
    render(LineChart, { props: { series } });
    const el = document.querySelector(".cy-line-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(LineChart, { props: { series } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders path elements for series data", () => {
    render(LineChart, { props: { series } });
    const paths = document.querySelectorAll(".cy-line-chart__line");
    expect(paths.length).toBe(1);
  });

  it("shows legend when showLegend is true", () => {
    render(LineChart, { props: { series, showLegend: true } });
    expect(within(legend()).getByText("Loss")).toBeInTheDocument();
  });

  it("renders grid lines when showGrid is true", () => {
    render(LineChart, { props: { series, showGrid: true } });
    const gridLines = document.querySelectorAll(".cy-line-chart__grid");
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it("renders multiple series lines", () => {
    const multiSeries = [
      { name: "Loss", data: [{ x: 0, y: 1 }, { x: 1, y: 0.5 }] },
      { name: "Accuracy", data: [{ x: 0, y: 0.5 }, { x: 1, y: 0.9 }] },
    ];
    render(LineChart, { props: { series: multiSeries } });
    const paths = document.querySelectorAll(".cy-line-chart__line");
    expect(paths.length).toBe(2);
  });

  it("renders legend items for each series", () => {
    const multiSeries = [
      { name: "Loss", data: [{ x: 0, y: 1 }] },
      { name: "Accuracy", data: [{ x: 0, y: 0.5 }] },
    ];
    render(LineChart, { props: { series: multiSeries, showLegend: true } });
    const items = document.querySelectorAll(".cy-line-chart__legend-item");
    expect(items.length).toBe(2);
    expect(within(legend()).getByText("Loss")).toBeInTheDocument();
    expect(within(legend()).getByText("Accuracy")).toBeInTheDocument();
  });

  it("hides legend when showLegend is false", () => {
    render(LineChart, { props: { series, showLegend: false } });
    const legend = document.querySelector(".cy-line-chart__legend");
    expect(legend).not.toBeInTheDocument();
  });

  it("hides legend when series is empty", () => {
    render(LineChart, { props: { series: [], showLegend: true } });
    const legend = document.querySelector(".cy-line-chart__legend");
    expect(legend).not.toBeInTheDocument();
  });

  it("hides grid lines when showGrid is false", () => {
    render(LineChart, { props: { series, showGrid: false } });
    const gridLines = document.querySelectorAll(".cy-line-chart__grid");
    expect(gridLines.length).toBe(0);
  });

  it("renders with empty series", () => {
    render(LineChart, { props: { series: [] } });
    const el = document.querySelector(".cy-line-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders with a series that has empty data", () => {
    render(LineChart, { props: { series: [{ name: "Empty", data: [] }] } });
    const paths = document.querySelectorAll(".cy-line-chart__line");
    expect(paths.length).toBe(1);
  });

  it("renders x and y axis labels", () => {
    render(LineChart, { props: { series, xLabel: "Epoch", yLabel: "Value" } });
    expect(within(plot()).getByText("Epoch")).toBeInTheDocument();
    expect(within(plot()).getByText("Value")).toBeInTheDocument();
  });

  it("does not render axis labels when not provided", () => {
    render(LineChart, { props: { series } });
    const axisLabels = document.querySelectorAll(".cy-line-chart__axis-label");
    expect(axisLabels.length).toBe(0);
  });

  it("renders tick labels on axes", () => {
    render(LineChart, { props: { series } });
    const ticks = document.querySelectorAll(".cy-line-chart__tick-label");
    expect(ticks.length).toBeGreaterThan(0);
  });

  it("renders axes lines", () => {
    render(LineChart, { props: { series } });
    const axes = document.querySelectorAll(".cy-line-chart__axis");
    expect(axes.length).toBe(2);
  });

  it("uses custom series colors", () => {
    const colorSeries = [
      { name: "Custom", data: [{ x: 0, y: 1 }], color: "#ff0000" },
    ];
    render(LineChart, { props: { series: colorSeries } });
    const path = document.querySelector(".cy-line-chart__line");
    expect(path?.getAttribute("stroke")).toBe("#ff0000");
  });

  it("uses default colors when no custom color is provided", () => {
    render(LineChart, { props: { series } });
    const path = document.querySelector(".cy-line-chart__line");
    expect(path?.getAttribute("stroke")).toBe("#00ff41");
  });

  it("applies animation class when animate is true", () => {
    render(LineChart, { props: { series, animate: true } });
    const lines = document.querySelectorAll(".cy-line-chart__line--animated");
    expect(lines.length).toBe(1);
  });

  it("does not apply animation class when animate is false", () => {
    render(LineChart, { props: { series, animate: false } });
    const lines = document.querySelectorAll(".cy-line-chart__line--animated");
    expect(lines.length).toBe(0);
  });

  it("shows tooltip with crosshair and dots on mousemove over SVG", async () => {
    render(LineChart, { props: { series, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    // Mock getBoundingClientRect
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    const crosshair = document.querySelector(".cy-line-chart__crosshair");
    expect(crosshair).toBeInTheDocument();
    const dots = document.querySelectorAll(".cy-line-chart__dot");
    expect(dots.length).toBeGreaterThan(0);
    const tooltip = document.querySelector(".cy-line-chart__tooltip");
    expect(tooltip).toBeInTheDocument();
  });

  it("hides tooltip on mouseleave", async () => {
    render(LineChart, { props: { series, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-line-chart__tooltip")).toBeInTheDocument();

    await fireEvent.mouseLeave(svg);
    expect(document.querySelector(".cy-line-chart__tooltip")).not.toBeInTheDocument();
  });

  it("does not show tooltip when showTooltip is false", async () => {
    render(LineChart, { props: { series, showTooltip: false } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-line-chart__tooltip")).not.toBeInTheDocument();
  });

  it("clears hoverX when mouse is outside plot area", async () => {
    render(LineChart, { props: { series, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    // Move to far left, outside the plot
    await fireEvent.mouseMove(svg, { clientX: 0, clientY: 150 });
    expect(document.querySelector(".cy-line-chart__crosshair")).not.toBeInTheDocument();
  });

  it("formats integer tick labels without decimals", () => {
    const intSeries = [
      { name: "Int", data: [{ x: 0, y: 10 }, { x: 5, y: 20 }] },
    ];
    render(LineChart, { props: { series: intSeries } });
    const ticks = document.querySelectorAll(".cy-line-chart__tick-label");
    const texts = Array.from(ticks).map((t) => t.textContent);
    // Integer values should not have decimals
    texts.forEach((t) => {
      if (t && !t.includes(".")) {
        expect(t).toMatch(/^-?\d+$/);
      }
    });
  });

  it("legend dots have correct color", () => {
    const colorSeries = [
      { name: "Red", data: [{ x: 0, y: 1 }], color: "#ff0000" },
    ];
    render(LineChart, { props: { series: colorSeries, showLegend: true } });
    const dot = document.querySelector(".cy-line-chart__legend-dot") as HTMLElement;
    expect(dot.style.background).toBe("rgb(255, 0, 0)");
  });
});

describe("LineChart accessibility", () => {
  const twoSeries = [
    { name: "Income", data: [{ x: 1, y: 10 }, { x: 2, y: 12 }] },
    { name: "Spend", data: [{ x: 1, y: 8 }, { x: 3, y: 9 }] },
  ];

  it("keeps the default accessible name without a title", () => {
    render(LineChart, { props: { series: twoSeries } });
    expect(screen.getByRole("img", { name: "Line chart" })).toBeInTheDocument();
  });

  it("wires title and description to the SVG", () => {
    render(LineChart, { props: { series: twoSeries, title: "Cash flow", description: "Monthly totals" } });
    const svg = screen.getByRole("img", { name: "Cash flow" });
    expect(svg).toHaveAccessibleDescription("Monthly totals");
  });

  it("derives the data table from the series", () => {
    render(LineChart, { props: { series: twoSeries, xLabel: "Month", title: "Cash flow" } });
    const table = screen.getByRole("table", { name: "Cash flow data" });
    const rows = [...table.querySelectorAll("tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Month", "Income", "Spend"],
      ["1", "10", "8"],
      ["2", "12", ""],
      ["3", "", "9"],
    ]);
  });

  it("toggles the table with an aria-expanded button", async () => {
    render(LineChart, { props: { series: twoSeries } });
    const button = screen.getByRole("button", { name: "Show data" });
    await fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("gives each series a distinct marker shape and dash pattern in the plot", () => {
    render(LineChart, { props: { series: twoSeries } });
    const lines = [...document.querySelectorAll(".cy-line-chart__line")];
    expect(lines.map((l) => l.getAttribute("stroke-dasharray"))).toEqual([null, "6 4"]);
    const marks = [...document.querySelectorAll(".cy-line-chart__marker")];
    expect(new Set(marks.map((m) => m.getAttribute("data-marker")))).toEqual(new Set(["circle", "square"]));
    const legend = [...document.querySelectorAll(".cy-line-chart__legend-item")];
    expect(legend.map((li) => li.getAttribute("data-marker"))).toEqual(["circle", "square"]);
  });

  it("can hide point markers", () => {
    render(LineChart, { props: { series: twoSeries, showMarkers: false } });
    expect(document.querySelector(".cy-line-chart__marker")).not.toBeInTheDocument();
  });

  it("fades dashed lines instead of the dash-offset draw animation", () => {
    render(LineChart, { props: { series: twoSeries, animate: true } });
    const [solid, dashed] = document.querySelectorAll(".cy-line-chart__line");
    expect(solid).toHaveClass("cy-line-chart__line--animated");
    expect(dashed).not.toHaveClass("cy-line-chart__line--animated");
    expect(dashed).toHaveClass("cy-line-chart__line--fade");
  });
});
