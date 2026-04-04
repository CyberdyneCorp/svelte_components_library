import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import CumulativeFlow from "./CumulativeFlow.svelte";

describe("CumulativeFlow", () => {
  const statuses = [
    { key: "backlog", label: "Backlog" },
    { key: "inProgress", label: "In Progress" },
    { key: "done", label: "Done" },
  ];

  const data = [
    { date: "2026-03-01", backlog: 20, inProgress: 5, done: 0 },
    { date: "2026-03-08", backlog: 10, inProgress: 8, done: 7 },
    { date: "2026-03-15", backlog: 3, inProgress: 2, done: 20 },
  ];

  it("renders the container", () => {
    render(CumulativeFlow, { props: { data, statuses } });
    const el = document.querySelector(".cy-cfd");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(CumulativeFlow, { props: { data, statuses } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders area paths for each status", () => {
    render(CumulativeFlow, { props: { data, statuses } });
    const areas = document.querySelectorAll(".cy-cfd__area");
    expect(areas.length).toBe(3);
  });

  it("renders legend items when showLegend is true", () => {
    render(CumulativeFlow, { props: { data, statuses, showLegend: true } });
    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("hides legend when showLegend is false", () => {
    render(CumulativeFlow, { props: { data, statuses, showLegend: false } });
    const legend = document.querySelector(".cy-cfd__legend");
    expect(legend).not.toBeInTheDocument();
  });

  it("renders grid lines when showGrid is true", () => {
    render(CumulativeFlow, { props: { data, statuses, showGrid: true } });
    const gridLines = document.querySelectorAll(".cy-cfd__grid");
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it("renders with empty data", () => {
    render(CumulativeFlow, { props: { data: [], statuses } });
    const el = document.querySelector(".cy-cfd");
    expect(el).toBeInTheDocument();
    // Areas still render for each status, but with empty path data
    const areas = document.querySelectorAll(".cy-cfd__area");
    expect(areas.length).toBe(3);
    areas.forEach((area) => {
      expect(area.getAttribute("d")).toBe("");
    });
  });

  it("renders with empty statuses", () => {
    render(CumulativeFlow, { props: { data, statuses: [] } });
    const el = document.querySelector(".cy-cfd");
    expect(el).toBeInTheDocument();
    const areas = document.querySelectorAll(".cy-cfd__area");
    expect(areas.length).toBe(0);
  });

  it("hides grid lines when showGrid is false", () => {
    render(CumulativeFlow, { props: { data, statuses, showGrid: false } });
    const gridLines = document.querySelectorAll(".cy-cfd__grid");
    expect(gridLines.length).toBe(0);
  });

  it("renders x-axis date tick labels", () => {
    render(CumulativeFlow, { props: { data, statuses } });
    const ticks = document.querySelectorAll(".cy-cfd__tick");
    // Should have y ticks + x ticks
    expect(ticks.length).toBeGreaterThan(0);
    // Date labels should be in MM/DD format
    expect(screen.getByText("03/01")).toBeInTheDocument();
  });

  it("renders y-axis tick labels", () => {
    render(CumulativeFlow, { props: { data, statuses } });
    const ticks = document.querySelectorAll(".cy-cfd__tick");
    expect(ticks.length).toBeGreaterThan(3); // at least the y ticks
  });

  it("renders axis labels when provided", () => {
    render(CumulativeFlow, { props: { data, statuses, xLabel: "Date", yLabel: "Items" } });
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
  });

  it("does not render axis labels when not provided", () => {
    render(CumulativeFlow, { props: { data, statuses } });
    const axisLabels = document.querySelectorAll(".cy-cfd__axis-label");
    expect(axisLabels.length).toBe(0);
  });

  it("renders axes lines", () => {
    render(CumulativeFlow, { props: { data, statuses } });
    const axes = document.querySelectorAll(".cy-cfd__axis");
    expect(axes.length).toBe(2);
  });

  it("uses custom status colors", () => {
    const colorStatuses = [
      { key: "backlog", label: "Backlog", color: "#ff0000" },
    ];
    const simpleData = [{ date: "2026-03-01", backlog: 10 }];
    render(CumulativeFlow, { props: { data: simpleData, statuses: colorStatuses } });
    const area = document.querySelector(".cy-cfd__area");
    expect(area?.getAttribute("fill")).toBe("#ff0000");
  });

  it("uses default colors when no custom color provided", () => {
    render(CumulativeFlow, { props: { data, statuses } });
    const area = document.querySelector(".cy-cfd__area");
    expect(area?.getAttribute("fill")).toBe("var(--color-action-brand-default)");
  });

  it("shows tooltip with crosshair on mousemove", async () => {
    render(CumulativeFlow, { props: { data, statuses, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-cfd__crosshair")).toBeInTheDocument();
    expect(document.querySelector(".cy-cfd__tooltip")).toBeInTheDocument();
  });

  it("tooltip shows date and status values", async () => {
    render(CumulativeFlow, { props: { data, statuses, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    const tooltipDate = document.querySelector(".cy-cfd__tooltip-date");
    expect(tooltipDate).toBeInTheDocument();
    const tooltipRows = document.querySelectorAll(".cy-cfd__tooltip-row");
    expect(tooltipRows.length).toBe(3);
  });

  it("hides tooltip on mouseleave", async () => {
    render(CumulativeFlow, { props: { data, statuses, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-cfd__tooltip")).toBeInTheDocument();

    await fireEvent.mouseLeave(svg);
    expect(document.querySelector(".cy-cfd__tooltip")).not.toBeInTheDocument();
  });

  it("does not show tooltip when showTooltip is false", async () => {
    render(CumulativeFlow, { props: { data, statuses, showTooltip: false } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-cfd__tooltip")).not.toBeInTheDocument();
  });

  it("clears crosshair on mouseleave after hover", async () => {
    render(CumulativeFlow, { props: { data, statuses, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-cfd__crosshair")).toBeInTheDocument();
    await fireEvent.mouseLeave(svg);
    expect(document.querySelector(".cy-cfd__crosshair")).not.toBeInTheDocument();
  });

  it("renders legend dots with correct colors", () => {
    render(CumulativeFlow, { props: { data, statuses, showLegend: true } });
    const dots = document.querySelectorAll(".cy-cfd__legend-dot");
    expect(dots.length).toBe(3);
  });

  it("hides legend when statuses is empty", () => {
    render(CumulativeFlow, { props: { data, statuses: [], showLegend: true } });
    const legend = document.querySelector(".cy-cfd__legend");
    expect(legend).not.toBeInTheDocument();
  });

  it("handles dates without dashes in formatDate", () => {
    const shortData = [{ date: "March", backlog: 10, inProgress: 5, done: 0 }];
    render(CumulativeFlow, { props: { data: shortData, statuses } });
    expect(screen.getByText("March")).toBeInTheDocument();
  });

  it("renders with single data point", () => {
    const singleData = [{ date: "2026-03-01", backlog: 20, inProgress: 5, done: 0 }];
    render(CumulativeFlow, { props: { data: singleData, statuses } });
    const areas = document.querySelectorAll(".cy-cfd__area");
    expect(areas.length).toBe(3);
  });
});
