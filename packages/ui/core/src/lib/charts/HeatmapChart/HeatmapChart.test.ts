import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import HeatmapChart from "./HeatmapChart.svelte";

describe("HeatmapChart", () => {
  const data = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  const xLabels = ["X1", "X2", "X3"];
  const yLabels = ["Y1", "Y2"];

  it("renders the container", () => {
    render(HeatmapChart, { props: { data } });
    const el = document.querySelector(".cy-heatmap");
    expect(el).toBeInTheDocument();
  });

  it("renders grid cells", () => {
    render(HeatmapChart, { props: { data } });
    const cells = document.querySelectorAll('[role="gridcell"]');
    expect(cells.length).toBe(6);
  });

  it("displays title when provided", () => {
    render(HeatmapChart, { props: { data, title: "Correlation" } });
    expect(screen.getByText("Correlation")).toBeInTheDocument();
  });

  it("renders axis labels", () => {
    render(HeatmapChart, { props: { data, xLabels, yLabels } });
    expect(screen.getByText("X1")).toBeInTheDocument();
    expect(screen.getByText("Y1")).toBeInTheDocument();
  });

  it("shows cell values when showValues is true and grid is small", () => {
    render(HeatmapChart, { props: { data, showValues: true } });
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
