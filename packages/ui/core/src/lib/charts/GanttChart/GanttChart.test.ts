import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import GanttChart from "./GanttChart.svelte";

describe("GanttChart", () => {
  const tasks = [
    { id: "1", label: "Data Collection", start: "2024-01-01", end: "2024-01-15" },
    { id: "2", label: "Model Training", start: "2024-01-10", end: "2024-01-25" },
  ];

  it("renders the container", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const el = document.querySelector(".cy-gantt");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders task bars", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const bars = document.querySelectorAll(".cy-gantt__bar");
    expect(bars.length).toBe(2);
  });

  it("renders with empty tasks", () => {
    render(GanttChart, { props: { tasks: [], startDate: "2024-01-01", endDate: "2024-02-01" } });
    const el = document.querySelector(".cy-gantt");
    expect(el).toBeInTheDocument();
  });
});
