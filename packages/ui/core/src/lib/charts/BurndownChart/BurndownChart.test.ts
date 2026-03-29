import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
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
});
