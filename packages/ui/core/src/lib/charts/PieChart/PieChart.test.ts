import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PieChart from "./PieChart.svelte";

describe("PieChart", () => {
  const data = [
    { label: "Python", value: 40 },
    { label: "JavaScript", value: 30 },
    { label: "Rust", value: 20 },
  ];

  it("renders the container", () => {
    render(PieChart, { props: { data } });
    const el = document.querySelector(".cy-pie-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(PieChart, { props: { data } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders path segments for each data point", () => {
    render(PieChart, { props: { data } });
    const segments = document.querySelectorAll(".cy-pie-chart__segment");
    expect(segments.length).toBe(3);
  });

  it("shows legend with labels", () => {
    render(PieChart, { props: { data, showLegend: true } });
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
  });

  it("displays percentages in legend when showValues is true", () => {
    render(PieChart, { props: { data, showLegend: true, showValues: true } });
    expect(screen.getByText("44.4%")).toBeInTheDocument();
  });
});
