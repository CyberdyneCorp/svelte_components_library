import { render, within, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PieChart from "./PieChart.svelte";

// The data-table fallback repeats every label, so scope text queries.
const legend = () => document.querySelector(".cy-pie-chart__legend") as HTMLElement;

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
    expect(within(legend()).getByText("Python")).toBeInTheDocument();
    expect(within(legend()).getByText("JavaScript")).toBeInTheDocument();
  });

  it("displays percentages in legend when showValues is true", () => {
    render(PieChart, { props: { data, showLegend: true, showValues: true } });
    expect(within(legend()).getByText("44.4%")).toBeInTheDocument();
  });
});

describe("PieChart accessibility", () => {
  const data = [
    { label: "Rent", value: 50 },
    { label: "Food", value: 30 },
    { label: "Fun", value: 20 },
  ];

  it("keeps the default accessible name without a title", () => {
    render(PieChart, { props: { data } });
    expect(screen.getByRole("img", { name: "Pie chart" })).toBeInTheDocument();
  });

  it("wires title and description to the SVG", () => {
    render(PieChart, { props: { data, title: "Budget", description: "Share per category" } });
    expect(screen.getByRole("img", { name: "Budget" })).toHaveAccessibleDescription("Share per category");
  });

  it("derives a label/value/share data table", () => {
    render(PieChart, { props: { data } });
    const rows = [...document.querySelectorAll("table tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Label", "Value", "Share"],
      ["Rent", "50", "50.0%"],
      ["Food", "30", "30.0%"],
      ["Fun", "20", "20.0%"],
    ]);
  });

  it("toggles the table with an aria-expanded button", async () => {
    render(PieChart, { props: { data } });
    const button = screen.getByRole("button", { name: "Show data" });
    await fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("draws the legend's shape inside each slice so slices read in grayscale", () => {
    render(PieChart, { props: { data } });
    const slices = [...document.querySelectorAll(".cy-pie-chart__marker")];
    const legend = [...document.querySelectorAll(".cy-pie-chart__legend-item")];
    const sliceShapes = slices.map((m) => m.getAttribute("data-marker"));
    expect(sliceShapes).toEqual(["circle", "square", "triangle"]);
    expect(legend.map((li) => li.getAttribute("data-marker"))).toEqual(sliceShapes);
  });

  it("skips the in-slice marker on slivers", () => {
    render(PieChart, { props: { data: [{ label: "Big", value: 99 }, { label: "Tiny", value: 1 }] } });
    expect(document.querySelectorAll(".cy-pie-chart__marker")).toHaveLength(1);
  });

  it("hides the legend when showLegend is false", () => {
    render(PieChart, { props: { data, showLegend: false } });
    expect(document.querySelector(".cy-pie-chart__legend")).not.toBeInTheDocument();
  });
});
