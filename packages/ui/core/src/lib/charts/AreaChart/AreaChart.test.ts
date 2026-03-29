import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import AreaChart from "./AreaChart.svelte";

describe("AreaChart", () => {
  const series = [
    { name: "Revenue", data: [{ x: 0, y: 100 }, { x: 1, y: 200 }, { x: 2, y: 150 }] },
  ];

  it("renders the container", () => {
    render(AreaChart, { props: { series } });
    const el = document.querySelector(".cy-area-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(AreaChart, { props: { series } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders area and line paths", () => {
    render(AreaChart, { props: { series } });
    const areas = document.querySelectorAll(".cy-area-chart__area");
    const lines = document.querySelectorAll(".cy-area-chart__line");
    expect(areas.length).toBe(1);
    expect(lines.length).toBe(1);
  });

  it("shows legend when showLegend is true", () => {
    render(AreaChart, { props: { series, showLegend: true } });
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("renders grid lines when showGrid is true", () => {
    render(AreaChart, { props: { series, showGrid: true } });
    const gridLines = document.querySelectorAll(".cy-area-chart__grid");
    expect(gridLines.length).toBeGreaterThan(0);
  });
});
