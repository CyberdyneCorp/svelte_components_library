import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import LineChart from "./LineChart.svelte";

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
    expect(screen.getByText("Loss")).toBeInTheDocument();
  });

  it("renders grid lines when showGrid is true", () => {
    render(LineChart, { props: { series, showGrid: true } });
    const gridLines = document.querySelectorAll(".cy-line-chart__grid");
    expect(gridLines.length).toBeGreaterThan(0);
  });
});
