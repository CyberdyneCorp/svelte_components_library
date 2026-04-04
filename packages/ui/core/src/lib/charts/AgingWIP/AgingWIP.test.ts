import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import AgingWIP from "./AgingWIP.svelte";

describe("AgingWIP", () => {
  const items = [
    { id: "1", title: "Task Alpha", status: "In Progress", daysInProgress: 12, assignee: "Alice" },
    { id: "2", title: "Task Beta", status: "In Review", daysInProgress: 3 },
    { id: "3", title: "Task Gamma", status: "In Progress", daysInProgress: 7, assignee: "Bob" },
  ];

  it("renders the container", () => {
    render(AgingWIP, { props: { items } });
    const el = document.querySelector(".cy-aging-wip");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(AgingWIP, { props: { items } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders bar elements for each item", () => {
    render(AgingWIP, { props: { items } });
    const bars = document.querySelectorAll(".cy-aging-wip__bar");
    expect(bars.length).toBe(3);
  });

  it("renders threshold lines when showThresholds is true", () => {
    render(AgingWIP, { props: { items, showThresholds: true } });
    const thresholds = document.querySelectorAll(".cy-aging-wip__threshold");
    expect(thresholds.length).toBe(2);
  });

  it("hides threshold lines when showThresholds is false", () => {
    render(AgingWIP, { props: { items, showThresholds: false } });
    const thresholds = document.querySelectorAll(".cy-aging-wip__threshold");
    expect(thresholds.length).toBe(0);
  });

  it("displays truncated item titles", () => {
    render(AgingWIP, { props: { items } });
    expect(screen.getByText("Task Alpha")).toBeInTheDocument();
  });

  it("renders with empty items array", () => {
    render(AgingWIP, { props: { items: [] } });
    const el = document.querySelector(".cy-aging-wip");
    expect(el).toBeInTheDocument();
    const bars = document.querySelectorAll(".cy-aging-wip__bar");
    expect(bars.length).toBe(0);
  });

  it("sorts items by daysInProgress descending", () => {
    render(AgingWIP, { props: { items } });
    const labels = document.querySelectorAll(".cy-aging-wip__label");
    // First label should be the item with most days (12 = Task Alpha)
    expect(labels[0].textContent).toBe("Task Alpha");
  });

  it("renders days labels next to bars", () => {
    render(AgingWIP, { props: { items } });
    const daysLabels = document.querySelectorAll(".cy-aging-wip__days");
    expect(daysLabels.length).toBe(3);
    expect(daysLabels[0].textContent).toBe("12d");
  });

  it("uses error color for items at or above critical threshold", () => {
    const criticalItems = [
      { id: "1", title: "Critical", status: "WIP", daysInProgress: 15 },
    ];
    render(AgingWIP, { props: { items: criticalItems, criticalThreshold: 10 } });
    const bar = document.querySelector(".cy-aging-wip__bar");
    expect(bar?.getAttribute("fill")).toBe("var(--color-state-error)");
  });

  it("uses warning color for items at or above warning but below critical threshold", () => {
    const warnItems = [
      { id: "1", title: "Warning", status: "WIP", daysInProgress: 7 },
    ];
    render(AgingWIP, { props: { items: warnItems, warningThreshold: 5, criticalThreshold: 10 } });
    const bar = document.querySelector(".cy-aging-wip__bar");
    expect(bar?.getAttribute("fill")).toBe("var(--color-state-warning)");
  });

  it("uses brand color for items below warning threshold", () => {
    const normalItems = [
      { id: "1", title: "Normal", status: "WIP", daysInProgress: 2 },
    ];
    render(AgingWIP, { props: { items: normalItems, warningThreshold: 5 } });
    const bar = document.querySelector(".cy-aging-wip__bar");
    expect(bar?.getAttribute("fill")).toBe("var(--color-action-brand-default)");
  });

  it("renders threshold labels with custom values", () => {
    render(AgingWIP, { props: { items, warningThreshold: 3, criticalThreshold: 8 } });
    const thresholdLabels = document.querySelectorAll(".cy-aging-wip__threshold-label");
    expect(thresholdLabels.length).toBe(2);
    expect(thresholdLabels[0].textContent).toContain("3d");
    expect(thresholdLabels[1].textContent).toContain("8d");
  });

  it("truncates long titles", () => {
    const longTitleItems = [
      { id: "1", title: "This is a very long task title that should be truncated", status: "WIP", daysInProgress: 5 },
    ];
    render(AgingWIP, { props: { items: longTitleItems } });
    const label = document.querySelector(".cy-aging-wip__label");
    // max 18 chars, so should end with ellipsis
    expect(label?.textContent?.length).toBeLessThanOrEqual(18);
  });

  it("shows tooltip on bar hover with assignee", async () => {
    render(AgingWIP, { props: { items } });
    const bars = document.querySelectorAll(".cy-aging-wip__bar");
    // Hover first bar (sorted = Task Alpha which has assignee)
    await fireEvent.mouseEnter(bars[0]);
    const tooltip = document.querySelector(".cy-aging-wip__tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(document.querySelector(".cy-aging-wip__tooltip-title")?.textContent).toBe("Task Alpha");
    // Check assignee row is shown
    const rows = document.querySelectorAll(".cy-aging-wip__tooltip-row");
    const texts = Array.from(rows).map((r) => r.textContent);
    expect(texts.some((t) => t?.includes("Alice"))).toBe(true);
  });

  it("shows tooltip without assignee line when item has no assignee", async () => {
    render(AgingWIP, { props: { items } });
    const bars = document.querySelectorAll(".cy-aging-wip__bar");
    // Third sorted item (daysInProgress=3, Task Beta, no assignee)
    await fireEvent.mouseEnter(bars[2]);
    const tooltip = document.querySelector(".cy-aging-wip__tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(document.querySelector(".cy-aging-wip__tooltip-title")?.textContent).toBe("Task Beta");
    const rows = document.querySelectorAll(".cy-aging-wip__tooltip-row");
    const texts = Array.from(rows).map((r) => r.textContent);
    expect(texts.some((t) => t?.includes("Assignee"))).toBe(false);
  });

  it("hides tooltip on bar mouseleave", async () => {
    render(AgingWIP, { props: { items } });
    const bar = document.querySelector(".cy-aging-wip__bar") as SVGElement;
    await fireEvent.mouseEnter(bar);
    expect(document.querySelector(".cy-aging-wip__tooltip")).toBeInTheDocument();
    await fireEvent.mouseLeave(bar);
    expect(document.querySelector(".cy-aging-wip__tooltip")).not.toBeInTheDocument();
  });

  it("fires onitemclick callback when bar is clicked", async () => {
    const handler = vi.fn();
    render(AgingWIP, { props: { items, onitemclick: handler } });
    const bar = document.querySelector(".cy-aging-wip__bar") as SVGElement;
    await fireEvent.click(bar);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("fires onitemclick on Enter keydown", async () => {
    const handler = vi.fn();
    render(AgingWIP, { props: { items, onitemclick: handler } });
    const bar = document.querySelector(".cy-aging-wip__bar") as SVGElement;
    await fireEvent.keyDown(bar, { key: "Enter" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire onitemclick on non-Enter keydown", async () => {
    const handler = vi.fn();
    render(AgingWIP, { props: { items, onitemclick: handler } });
    const bar = document.querySelector(".cy-aging-wip__bar") as SVGElement;
    await fireEvent.keyDown(bar, { key: "Space" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("renders x-axis tick labels", () => {
    render(AgingWIP, { props: { items } });
    const ticks = document.querySelectorAll(".cy-aging-wip__tick");
    expect(ticks.length).toBeGreaterThan(0);
  });

  it("applies custom width and height", () => {
    render(AgingWIP, { props: { items, width: "800px", height: "500px" } });
    const el = document.querySelector(".cy-aging-wip") as HTMLElement;
    expect(el.style.width).toBe("800px");
    expect(el.style.height).toBe("500px");
  });

  it("updates mousePos on SVG mousemove", async () => {
    render(AgingWIP, { props: { items } });
    const svg = document.querySelector("svg") as SVGSVGElement;
    await fireEvent.mouseMove(svg, { clientX: 200, clientY: 150 });
    // No error should occur and mouse tracking should work
    expect(svg).toBeInTheDocument();
  });
});
