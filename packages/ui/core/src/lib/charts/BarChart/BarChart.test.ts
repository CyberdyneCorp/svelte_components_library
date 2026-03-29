import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import BarChart from "./BarChart.svelte";

describe("BarChart", () => {
  const data = [
    { label: "A", value: 10 },
    { label: "B", value: 20 },
    { label: "C", value: 15 },
  ];

  it("renders the container", () => {
    render(BarChart, { props: { data } });
    const el = document.querySelector(".cy-bar-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(BarChart, { props: { data } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders bar elements for each data point", () => {
    render(BarChart, { props: { data } });
    const bars = document.querySelectorAll(".cy-bar-chart__bar");
    expect(bars.length).toBe(3);
  });

  it("displays labels", () => {
    render(BarChart, { props: { data } });
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows values when showValues is true", () => {
    render(BarChart, { props: { data, showValues: true } });
    const values = document.querySelectorAll(".cy-bar-chart__value");
    expect(values.length).toBe(3);
  });
});
