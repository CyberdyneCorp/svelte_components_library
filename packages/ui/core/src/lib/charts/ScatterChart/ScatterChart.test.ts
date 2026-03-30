import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ScatterChart from "./ScatterChart.svelte";

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
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders with empty series", () => {
    render(ScatterChart, { props: { series: [] } });
    const el = document.querySelector(".cy-scatter-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders axis labels", () => {
    render(ScatterChart, { props: { series, xLabel: "X Axis", yLabel: "Y Axis" } });
    expect(screen.getByText("X Axis")).toBeInTheDocument();
    expect(screen.getByText("Y Axis")).toBeInTheDocument();
  });
});
