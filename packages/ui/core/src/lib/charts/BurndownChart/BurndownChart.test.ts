import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import BurndownChart from "./BurndownChart.svelte";

describe("BurndownChart", () => {
  const data = [
    { date: "2026-03-16", remaining: 40 },
    { date: "2026-03-18", remaining: 30 },
    { date: "2026-03-20", remaining: 20 },
    { date: "2026-03-22", remaining: 10 },
    { date: "2026-03-24", remaining: 2 },
  ];

  it("renders the container", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const el = document.querySelector(".cy-burndown");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders the actual burndown line", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const line = document.querySelector(".cy-burndown__actual-line");
    expect(line).toBeInTheDocument();
  });

  it("renders the ideal line when showIdealLine is true", () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showIdealLine: true } });
    const ideal = document.querySelector(".cy-burndown__ideal-line");
    expect(ideal).toBeInTheDocument();
  });

  it("renders dots for each data point", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const dots = document.querySelectorAll(".cy-burndown__dot");
    expect(dots.length).toBe(5);
  });

  it("renders grid lines when showGrid is true", () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showGrid: true } });
    const gridLines = document.querySelectorAll(".cy-burndown__grid");
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it("renders with empty data", () => {
    render(BurndownChart, { props: { data: [], totalPoints: 40 } });
    const el = document.querySelector(".cy-burndown");
    expect(el).toBeInTheDocument();
    const line = document.querySelector(".cy-burndown__actual-line");
    expect(line).not.toBeInTheDocument();
  });

  it("hides ideal line when showIdealLine is false", () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showIdealLine: false } });
    const ideal = document.querySelector(".cy-burndown__ideal-line");
    expect(ideal).not.toBeInTheDocument();
  });

  it("hides grid lines when showGrid is false", () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showGrid: false } });
    const gridLines = document.querySelectorAll(".cy-burndown__grid");
    expect(gridLines.length).toBe(0);
  });

  it("renders area fill under the actual line", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const area = document.querySelector(".cy-burndown__area");
    expect(area).toBeInTheDocument();
  });

  it("renders x-axis date tick labels in MM/DD format", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    expect(screen.getByText("03/16")).toBeInTheDocument();
    expect(screen.getByText("03/24")).toBeInTheDocument();
  });

  it("renders y-axis tick labels", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const ticks = document.querySelectorAll(".cy-burndown__tick");
    expect(ticks.length).toBeGreaterThan(0);
  });

  it("renders unit label", () => {
    render(BurndownChart, { props: { data, totalPoints: 40, unit: "story points" } });
    expect(screen.getByText("story points")).toBeInTheDocument();
  });

  it("uses default unit label 'points'", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    expect(screen.getByText("points")).toBeInTheDocument();
  });

  it("renders axes lines", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const axes = document.querySelectorAll(".cy-burndown__axis");
    expect(axes.length).toBe(2);
  });

  it("uses first data remaining as totalPoints when totalPoints is 0", () => {
    render(BurndownChart, { props: { data, totalPoints: 0 } });
    // Should still render correctly using data[0].remaining as total
    const line = document.querySelector(".cy-burndown__actual-line");
    expect(line).toBeInTheDocument();
    const ideal = document.querySelector(".cy-burndown__ideal-line");
    expect(ideal).toBeInTheDocument();
  });

  it("computes ideal line from provided ideal values in data", () => {
    const dataWithIdeal = [
      { date: "2026-03-16", remaining: 40, ideal: 40 },
      { date: "2026-03-18", remaining: 30, ideal: 30 },
      { date: "2026-03-20", remaining: 20, ideal: 20 },
    ];
    render(BurndownChart, { props: { data: dataWithIdeal, totalPoints: 40 } });
    const ideal = document.querySelector(".cy-burndown__ideal-line");
    expect(ideal).toBeInTheDocument();
  });

  it("shows tooltip with crosshair and hover dot on mousemove", async () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-burndown__crosshair")).toBeInTheDocument();
    expect(document.querySelector(".cy-burndown__hover-dot")).toBeInTheDocument();
    expect(document.querySelector(".cy-burndown__tooltip")).toBeInTheDocument();
  });

  it("tooltip shows date, remaining, and ideal values", async () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showTooltip: true, showIdealLine: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    const tooltipDate = document.querySelector(".cy-burndown__tooltip-date");
    expect(tooltipDate).toBeInTheDocument();
    const tooltipRows = document.querySelectorAll(".cy-burndown__tooltip-row");
    expect(tooltipRows.length).toBe(2); // Remaining + Ideal
  });

  it("tooltip hides ideal row when showIdealLine is false", async () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showTooltip: true, showIdealLine: false } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    const tooltipRows = document.querySelectorAll(".cy-burndown__tooltip-row");
    expect(tooltipRows.length).toBe(1); // Only Remaining
  });

  it("hides tooltip on mouseleave", async () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-burndown__tooltip")).toBeInTheDocument();

    await fireEvent.mouseLeave(svg);
    expect(document.querySelector(".cy-burndown__tooltip")).not.toBeInTheDocument();
  });

  it("does not show tooltip when showTooltip is false", async () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showTooltip: false } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    await fireEvent.mouseMove(svg, { clientX: 300, clientY: 150 });
    expect(document.querySelector(".cy-burndown__tooltip")).not.toBeInTheDocument();
  });

  it("clears hoverIndex when mouse is far outside data range", async () => {
    render(BurndownChart, { props: { data, totalPoints: 40, showTooltip: true } });
    const svg = document.querySelector("svg") as SVGSVGElement;

    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300, x: 0, y: 0, toJSON: () => {},
    });

    // Move far to the right, outside the plot area
    await fireEvent.mouseMove(svg, { clientX: 700, clientY: 150 });
    expect(document.querySelector(".cy-burndown__crosshair")).not.toBeInTheDocument();
  });

  it("renders today marker when sprint dates include today", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 3);
    const end = new Date(today);
    end.setDate(end.getDate() + 3);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const sprintData = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      sprintData.push({ date: fmt(d), remaining: 40 - (i + 3) * 5 });
    }
    render(BurndownChart, {
      props: { data: sprintData, totalPoints: 40, sprintStart: fmt(start), sprintEnd: fmt(end) },
    });
    const todayMarker = document.querySelector(".cy-burndown__today");
    expect(todayMarker).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("does not render today marker when no sprint dates provided", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const todayMarker = document.querySelector(".cy-burndown__today");
    expect(todayMarker).not.toBeInTheDocument();
  });

  it("does not render today marker when today is outside sprint range", () => {
    render(BurndownChart, {
      props: { data, totalPoints: 40, sprintStart: "2020-01-01", sprintEnd: "2020-01-15" },
    });
    const todayMarker = document.querySelector(".cy-burndown__today");
    expect(todayMarker).not.toBeInTheDocument();
  });

  it("handles dates without full YYYY-MM-DD in formatDate", () => {
    const shortData = [{ date: "March", remaining: 10 }];
    render(BurndownChart, { props: { data: shortData, totalPoints: 10 } });
    expect(screen.getByText("March")).toBeInTheDocument();
  });

  it("renders with single data point", () => {
    const single = [{ date: "2026-03-16", remaining: 40 }];
    render(BurndownChart, { props: { data: single, totalPoints: 40 } });
    const dots = document.querySelectorAll(".cy-burndown__dot");
    expect(dots.length).toBe(1);
  });

  it("renders gradient definition for area fill", () => {
    render(BurndownChart, { props: { data, totalPoints: 40 } });
    const gradient = document.querySelector("#burndown-area-grad");
    expect(gradient).toBeInTheDocument();
  });
});
