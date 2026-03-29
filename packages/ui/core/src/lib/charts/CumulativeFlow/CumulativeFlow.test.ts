import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
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
});
