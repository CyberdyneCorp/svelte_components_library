import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ActivityHeatmap from "./ActivityHeatmap.svelte";

describe("ActivityHeatmap", () => {
  const data = [
    { date: "2024-01-01", value: 5 },
    { date: "2024-01-02", value: 10 },
    { date: "2024-01-03", value: 3 },
  ];

  it("renders the container", () => {
    render(ActivityHeatmap, { props: { data } });
    const el = document.querySelector(".cy-heatmap");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(ActivityHeatmap, { props: { data } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders cells for data points", () => {
    render(ActivityHeatmap, { props: { data } });
    const cells = document.querySelectorAll("rect");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("renders with empty data", () => {
    render(ActivityHeatmap, { props: { data: [] } });
    const el = document.querySelector(".cy-heatmap");
    expect(el).toBeInTheDocument();
  });
});
