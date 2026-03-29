import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
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
});
