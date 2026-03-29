import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import VelocityChart from "./VelocityChart.svelte";

describe("VelocityChart", () => {
  const sprints = [
    { name: "Sprint 1", completed: 28, committed: 30 },
    { name: "Sprint 2", completed: 32, committed: 30 },
    { name: "Sprint 3", completed: 25, committed: 28 },
  ];

  it("renders the container", () => {
    render(VelocityChart, { props: { sprints } });
    const el = document.querySelector(".cy-velocity");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(VelocityChart, { props: { sprints } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders bar elements for each sprint", () => {
    render(VelocityChart, { props: { sprints } });
    const bars = document.querySelectorAll(".cy-velocity__bar");
    expect(bars.length).toBe(3);
  });

  it("renders committed outlines when showCommitted is true", () => {
    render(VelocityChart, { props: { sprints, showCommitted: true } });
    const committed = document.querySelectorAll(".cy-velocity__committed-bar");
    expect(committed.length).toBe(3);
  });

  it("shows values on top of bars when showValues is true", () => {
    render(VelocityChart, { props: { sprints, showValues: true } });
    const values = document.querySelectorAll(".cy-velocity__value");
    expect(values.length).toBe(3);
  });

  it("renders the average line when showAverage is true", () => {
    render(VelocityChart, { props: { sprints, showAverage: true } });
    const avgLine = document.querySelector(".cy-velocity__avg-line");
    expect(avgLine).toBeInTheDocument();
  });

  it("displays sprint names", () => {
    render(VelocityChart, { props: { sprints } });
    expect(screen.getByText("Sprint 1")).toBeInTheDocument();
    expect(screen.getByText("Sprint 2")).toBeInTheDocument();
  });
});
