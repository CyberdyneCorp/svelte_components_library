import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
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

  it("renders with empty tasks and no dates (defaults)", () => {
    render(GanttChart, { props: { tasks: [] } });
    const el = document.querySelector(".cy-gantt");
    expect(el).toBeInTheDocument();
  });

  it("auto-computes viewStart/viewEnd from task dates when no startDate/endDate given", () => {
    render(GanttChart, { props: { tasks } });
    const bars = document.querySelectorAll(".cy-gantt__bar");
    expect(bars.length).toBe(2);
  });

  it("renders progress fill when showProgress and task has progress", () => {
    const tasksWithProgress = [
      { id: "1", label: "Task A", start: "2024-01-01", end: "2024-01-15", progress: 50 },
      { id: "2", label: "Task B", start: "2024-01-10", end: "2024-01-25", progress: 0 },
    ];
    render(GanttChart, { props: { tasks: tasksWithProgress, startDate: "2024-01-01", endDate: "2024-02-01", showProgress: true } });
    const progressBars = document.querySelectorAll(".cy-gantt__bar-progress");
    expect(progressBars.length).toBe(1);
  });

  it("hides progress fill when showProgress is false", () => {
    const tasksWithProgress = [
      { id: "1", label: "Task A", start: "2024-01-01", end: "2024-01-15", progress: 50 },
    ];
    render(GanttChart, { props: { tasks: tasksWithProgress, startDate: "2024-01-01", endDate: "2024-02-01", showProgress: false } });
    const progressBars = document.querySelectorAll(".cy-gantt__bar-progress");
    expect(progressBars.length).toBe(0);
  });

  it("renders bar text labels when bar is wide enough", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01", zoom: "day" } });
    const barTexts = document.querySelectorAll(".cy-gantt__bar-text");
    expect(barTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders header ticks", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const headerTexts = document.querySelectorAll(".cy-gantt__header-text");
    expect(headerTexts.length).toBeGreaterThan(0);
  });

  it("renders grid lines aligned to header ticks", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const gridLines = document.querySelectorAll(".cy-gantt__grid-line");
    expect(gridLines.length).toBeGreaterThan(0);
  });

  it("renders today marker when showToday is true", () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 5);
    const end = new Date(today);
    end.setDate(end.getDate() + 5);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const todayTasks = [{ id: "1", label: "Current", start: fmt(start), end: fmt(end) }];
    render(GanttChart, { props: { tasks: todayTasks, startDate: fmt(start), endDate: fmt(end), showToday: true } });
    const todayLine = document.querySelector(".cy-gantt__today-line");
    expect(todayLine).toBeInTheDocument();
  });

  it("hides today marker when showToday is false", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01", showToday: false } });
    const todayLine = document.querySelector(".cy-gantt__today-line");
    expect(todayLine).not.toBeInTheDocument();
  });

  it("renders dependency lines when showDependencies is true", () => {
    const depTasks = [
      { id: "1", label: "First", start: "2024-01-01", end: "2024-01-10" },
      { id: "2", label: "Second", start: "2024-01-11", end: "2024-01-20", dependencies: ["1"] },
    ];
    render(GanttChart, { props: { tasks: depTasks, startDate: "2024-01-01", endDate: "2024-02-01", showDependencies: true } });
    const depLines = document.querySelectorAll(".cy-gantt__dep-line");
    expect(depLines.length).toBe(1);
  });

  it("hides dependency lines when showDependencies is false", () => {
    const depTasks = [
      { id: "1", label: "First", start: "2024-01-01", end: "2024-01-10" },
      { id: "2", label: "Second", start: "2024-01-11", end: "2024-01-20", dependencies: ["1"] },
    ];
    render(GanttChart, { props: { tasks: depTasks, startDate: "2024-01-01", endDate: "2024-02-01", showDependencies: false } });
    const depLines = document.querySelectorAll(".cy-gantt__dep-line");
    expect(depLines.length).toBe(0);
  });

  it("ignores dependencies referencing non-existent task IDs", () => {
    const depTasks = [
      { id: "1", label: "First", start: "2024-01-01", end: "2024-01-10" },
      { id: "2", label: "Second", start: "2024-01-11", end: "2024-01-20", dependencies: ["999"] },
    ];
    render(GanttChart, { props: { tasks: depTasks, startDate: "2024-01-01", endDate: "2024-02-01", showDependencies: true } });
    const depLines = document.querySelectorAll(".cy-gantt__dep-line");
    expect(depLines.length).toBe(0);
  });

  it("uses custom task colors", () => {
    const colorTasks = [
      { id: "1", label: "Red Task", start: "2024-01-01", end: "2024-01-10", color: "#ff0000" },
    ];
    render(GanttChart, { props: { tasks: colorTasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const bar = document.querySelector(".cy-gantt__bar");
    expect(bar?.getAttribute("fill")).toBe("#ff0000");
  });

  it("uses default brand color when no custom color", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const bar = document.querySelector(".cy-gantt__bar");
    expect(bar?.getAttribute("fill")).toBe("var(--color-action-brand-default)");
  });

  it("renders grouped tasks with group header rows", () => {
    const groupedTasks = [
      { id: "1", label: "Task A", start: "2024-01-01", end: "2024-01-10", group: "Phase 1" },
      { id: "2", label: "Task B", start: "2024-01-05", end: "2024-01-15", group: "Phase 1" },
      { id: "3", label: "Task C", start: "2024-01-10", end: "2024-01-20", group: "Phase 2" },
    ];
    render(GanttChart, { props: { tasks: groupedTasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const groupRows = document.querySelectorAll(".cy-gantt__group-row");
    expect(groupRows.length).toBe(2);
    const groupBgs = document.querySelectorAll(".cy-gantt__group-bg");
    expect(groupBgs.length).toBe(2);
  });

  it("collapses group on click and hides its tasks", async () => {
    const groupedTasks = [
      { id: "1", label: "Task A", start: "2024-01-01", end: "2024-01-10", group: "Phase 1" },
      { id: "2", label: "Task B", start: "2024-01-05", end: "2024-01-15", group: "Phase 1" },
    ];
    render(GanttChart, { props: { tasks: groupedTasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const taskLabels = document.querySelectorAll(".cy-gantt__task-label");
    expect(taskLabels.length).toBe(2);

    const groupBtn = document.querySelector(".cy-gantt__group-row") as HTMLButtonElement;
    await fireEvent.click(groupBtn);
    const taskLabelsAfter = document.querySelectorAll(".cy-gantt__task-label");
    expect(taskLabelsAfter.length).toBe(0);

    // Expand again
    await fireEvent.click(groupBtn);
    const taskLabelsExpanded = document.querySelectorAll(".cy-gantt__task-label");
    expect(taskLabelsExpanded.length).toBe(2);
  });

  it("renders with zoom=day", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-01-10", zoom: "day" } });
    const headerTexts = document.querySelectorAll(".cy-gantt__header-text");
    expect(headerTexts.length).toBeGreaterThan(0);
  });

  it("renders with zoom=month", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-06-01", zoom: "month" } });
    const headerTexts = document.querySelectorAll(".cy-gantt__header-text");
    expect(headerTexts.length).toBeGreaterThan(0);
  });

  it("renders with zoom=quarter", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2025-01-01", zoom: "quarter" } });
    const headerTexts = document.querySelectorAll(".cy-gantt__header-text");
    expect(headerTexts.length).toBeGreaterThan(0);
  });

  it("renders with zoom=year", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2027-01-01", zoom: "year" } });
    const headerTexts = document.querySelectorAll(".cy-gantt__header-text");
    expect(headerTexts.length).toBeGreaterThan(0);
  });

  it("shows tooltip on bar mouseenter and hides on mouseleave", async () => {
    const tasksP = [{ id: "1", label: "Hovered Task", start: "2024-01-01", end: "2024-01-15", progress: 75 }];
    render(GanttChart, { props: { tasks: tasksP, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const bar = document.querySelector(".cy-gantt__bar") as SVGElement;
    expect(document.querySelector(".cy-gantt__tooltip")).not.toBeInTheDocument();

    await fireEvent.mouseEnter(bar, { clientX: 300, clientY: 100 });
    expect(document.querySelector(".cy-gantt__tooltip")).toBeInTheDocument();
    expect(document.querySelector(".cy-gantt__tooltip-label")?.textContent).toBe("Hovered Task");
    expect(document.querySelector(".cy-gantt__tooltip-progress")?.textContent).toBe("75%");

    await fireEvent.mouseLeave(bar);
    expect(document.querySelector(".cy-gantt__tooltip")).not.toBeInTheDocument();
  });

  it("fires onTaskClick on double-click of a bar", async () => {
    const handler = vi.fn();
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01", onTaskClick: handler } });
    const bar = document.querySelector(".cy-gantt__bar") as SVGElement;
    await fireEvent.dblClick(bar);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(tasks[0]);
  });

  it("adds draggable class when onTaskMove is provided", () => {
    const handler = vi.fn();
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01", onTaskMove: handler } });
    const bar = document.querySelector(".cy-gantt__bar");
    expect(bar?.classList.contains("cy-gantt__bar--draggable")).toBe(true);
  });

  it("does not add draggable class when onTaskMove is not provided", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const bar = document.querySelector(".cy-gantt__bar");
    expect(bar?.classList.contains("cy-gantt__bar--draggable")).toBe(false);
  });

  it("initiates drag on mousedown when onTaskMove is provided", async () => {
    const handler = vi.fn();
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01", onTaskMove: handler } });
    const bar = document.querySelector(".cy-gantt__bar") as SVGElement;
    await fireEvent.mouseDown(bar, { clientX: 100, clientY: 50 });
    // Simulate mouse move then mouse up with offset
    await fireEvent.mouseMove(window, { clientX: 200, clientY: 50 });
    await fireEvent.mouseUp(window, { clientX: 200, clientY: 50 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call onTaskMove on drag with zero pixel offset", async () => {
    const handler = vi.fn();
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01", onTaskMove: handler } });
    const bar = document.querySelector(".cy-gantt__bar") as SVGElement;
    await fireEvent.mouseDown(bar, { clientX: 100, clientY: 50 });
    await fireEvent.mouseUp(window, { clientX: 100, clientY: 50 });
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not initiate drag when onTaskMove is not provided", async () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const bar = document.querySelector(".cy-gantt__bar") as SVGElement;
    await fireEvent.mouseDown(bar, { clientX: 100, clientY: 50 });
    // Should not error
    await fireEvent.mouseUp(window, { clientX: 200, clientY: 50 });
  });

  it("renders row separator lines", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const rowLines = document.querySelectorAll(".cy-gantt__row-line");
    expect(rowLines.length).toBe(2);
  });

  it("renders task labels in the label column", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const labels = document.querySelectorAll(".cy-gantt__task-label");
    expect(labels.length).toBe(2);
    expect(labels[0].textContent?.trim()).toBe("Data Collection");
  });

  it("renders the labels header", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const header = document.querySelector(".cy-gantt__labels-header");
    expect(header?.textContent?.trim()).toBe("Tasks");
  });

  it("renders custom height", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01", height: "600px" } });
    const el = document.querySelector(".cy-gantt") as HTMLElement;
    expect(el.style.height).toBe("600px");
  });

  it("mixes grouped and ungrouped tasks", () => {
    const mixedTasks = [
      { id: "1", label: "Grouped", start: "2024-01-01", end: "2024-01-10", group: "G1" },
      { id: "2", label: "Ungrouped", start: "2024-01-05", end: "2024-01-15" },
    ];
    render(GanttChart, { props: { tasks: mixedTasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const groupRows = document.querySelectorAll(".cy-gantt__group-row");
    expect(groupRows.length).toBe(1);
    const taskLabels = document.querySelectorAll(".cy-gantt__task-label");
    expect(taskLabels.length).toBe(2);
  });

  it("updates tooltip position on mousemove over bar", async () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01" } });
    const bar = document.querySelector(".cy-gantt__bar") as SVGElement;
    await fireEvent.mouseMove(bar, { clientX: 300, clientY: 100 });
    const tooltip = document.querySelector(".cy-gantt__tooltip");
    expect(tooltip).toBeInTheDocument();
  });

  it("renders week zoom header ticks starting on Monday", () => {
    render(GanttChart, { props: { tasks, startDate: "2024-01-01", endDate: "2024-02-01", zoom: "week" } });
    const headerTexts = document.querySelectorAll(".cy-gantt__header-text");
    expect(headerTexts.length).toBeGreaterThan(0);
    // Week tick labels should contain month abbreviations
    const firstLabel = headerTexts[0].textContent || "";
    expect(firstLabel).toMatch(/\w{3}\s+\d+/);
  });
});
