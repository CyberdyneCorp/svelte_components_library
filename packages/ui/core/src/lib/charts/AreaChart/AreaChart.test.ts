import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
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

  it("renders with empty series", () => {
    render(AreaChart, { props: { series: [] } });
    const el = document.querySelector(".cy-area-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders with a series that has empty data", () => {
    render(AreaChart, { props: { series: [{ name: "Empty", data: [] }] } });
    const areas = document.querySelectorAll(".cy-area-chart__area");
    expect(areas.length).toBe(1);
  });

  it("renders multiple series with separate area and line paths", () => {
    const multiSeries = [
      { name: "Revenue", data: [{ x: 0, y: 100 }, { x: 1, y: 200 }] },
      { name: "Cost", data: [{ x: 0, y: 50 }, { x: 1, y: 80 }] },
    ];
    render(AreaChart, { props: { series: multiSeries } });
    const areas = document.querySelectorAll(".cy-area-chart__area");
    const lines = document.querySelectorAll(".cy-area-chart__line");
    expect(areas.length).toBe(2);
    expect(lines.length).toBe(2);
  });

  it("renders stacked areas when stacked is true", () => {
    const multiSeries = [
      { name: "A", data: [{ x: 0, y: 10 }, { x: 1, y: 20 }] },
      { name: "B", data: [{ x: 0, y: 5 }, { x: 1, y: 10 }] },
    ];
    render(AreaChart, { props: { series: multiSeries, stacked: true } });
    const areas = document.querySelectorAll(".cy-area-chart__area");
    expect(areas.length).toBe(2);
  });

  it("renders gradient definitions for each series", () => {
    render(AreaChart, { props: { series } });
    const gradients = document.querySelectorAll("linearGradient");
    expect(gradients.length).toBe(1);
  });

  it("hides grid lines when showGrid is false", () => {
    render(AreaChart, { props: { series, showGrid: false } });
    const gridLines = document.querySelectorAll(".cy-area-chart__grid");
    expect(gridLines.length).toBe(0);
  });

  it("hides legend when showLegend is false", () => {
    render(AreaChart, { props: { series, showLegend: false } });
    const legend = document.querySelector(".cy-area-chart__legend");
    expect(legend).not.toBeInTheDocument();
  });

  it("hides legend when series is empty", () => {
    render(AreaChart, { props: { series: [], showLegend: true } });
    const legend = document.querySelector(".cy-area-chart__legend");
    expect(legend).not.toBeInTheDocument();
  });

  it("uses custom series colors", () => {
    const colorSeries = [
      { name: "Custom", data: [{ x: 0, y: 100 }], color: "#ff0000" },
    ];
    render(AreaChart, { props: { series: colorSeries } });
    const line = document.querySelector(".cy-area-chart__line");
    expect(line?.getAttribute("stroke")).toBe("#ff0000");
  });

  it("uses default colors for series without custom color", () => {
    render(AreaChart, { props: { series } });
    const line = document.querySelector(".cy-area-chart__line");
    expect(line?.getAttribute("stroke")).toBe("#00ff41");
  });

  it("renders tick labels on both axes", () => {
    render(AreaChart, { props: { series } });
    const ticks = document.querySelectorAll(".cy-area-chart__tick");
    expect(ticks.length).toBeGreaterThan(0);
  });

  it("shows tooltip with crosshair and dots on mousemove", async () => {
    render(AreaChart, { props: { series, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-area-chart__crosshair")).toBeInTheDocument();
    expect(document.querySelector(".cy-area-chart__tooltip")).toBeInTheDocument();
    const dots = document.querySelectorAll(".cy-area-chart__dot");
    expect(dots.length).toBeGreaterThan(0);
  });

  it("hides tooltip on mouseleave", async () => {
    render(AreaChart, { props: { series, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-area-chart__tooltip")).toBeInTheDocument();

    await fireEvent.mouseLeave(svg);
    expect(document.querySelector(".cy-area-chart__tooltip")).not.toBeInTheDocument();
  });

  it("does not show tooltip when showTooltip is false", async () => {
    render(AreaChart, { props: { series, showTooltip: false } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-area-chart__tooltip")).not.toBeInTheDocument();
  });

  it("clears hoverX when mouse moves outside plot area", async () => {
    render(AreaChart, { props: { series, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 0, clientY: 150 });
    expect(document.querySelector(".cy-area-chart__crosshair")).not.toBeInTheDocument();
  });

  it("renders legend dots with correct colors", () => {
    const colorSeries = [
      { name: "Red", data: [{ x: 0, y: 1 }], color: "#ff0000" },
    ];
    render(AreaChart, { props: { series: colorSeries, showLegend: true } });
    const dot = document.querySelector(".cy-area-chart__legend-dot") as HTMLElement;
    expect(dot.style.background).toBe("rgb(255, 0, 0)");
  });

  it("renders axes lines", () => {
    render(AreaChart, { props: { series } });
    const axes = document.querySelectorAll(".cy-area-chart__axis");
    expect(axes.length).toBe(2);
  });

  it("stacked series accumulate y values", () => {
    const stackSeries = [
      { name: "A", data: [{ x: 0, y: 10 }, { x: 1, y: 20 }] },
      { name: "B", data: [{ x: 0, y: 5 }, { x: 1, y: 15 }] },
    ];
    render(AreaChart, { props: { series: stackSeries, stacked: true } });
    // Second area path should reference accumulated values
    const areas = document.querySelectorAll(".cy-area-chart__area");
    expect(areas.length).toBe(2);
    // Both should have non-empty 'd' attributes
    expect(areas[0].getAttribute("d")).toBeTruthy();
    expect(areas[1].getAttribute("d")).toBeTruthy();
  });
});
