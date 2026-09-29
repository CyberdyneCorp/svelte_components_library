import { render, screen, within, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import HeatmapChart from "./HeatmapChart.svelte";

describe("HeatmapChart", () => {
  const data = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  const xLabels = ["X1", "X2", "X3"];
  const yLabels = ["Y1", "Y2"];

  function grid(): HTMLElement {
    return document.querySelector(".cy-heatmap__container") as HTMLElement;
  }

  it("renders the container", () => {
    render(HeatmapChart, { props: { data } });
    const el = document.querySelector(".cy-heatmap");
    expect(el).toBeInTheDocument();
  });

  it("renders grid cells", () => {
    render(HeatmapChart, { props: { data } });
    expect(document.querySelectorAll(".cy-heatmap__cell").length).toBe(6);
  });

  it("displays title when provided", () => {
    render(HeatmapChart, { props: { data, title: "Correlation" } });
    expect(screen.getByText("Correlation")).toBeInTheDocument();
  });

  it("renders axis labels", () => {
    render(HeatmapChart, { props: { data, xLabels, yLabels } });
    expect(within(grid()).getByText("X1")).toBeInTheDocument();
    expect(within(grid()).getByText("Y1")).toBeInTheDocument();
  });

  it("shows cell values when showValues is true and grid is small", () => {
    render(HeatmapChart, { props: { data, showValues: true } });
    expect(within(grid()).getByText("5")).toBeInTheDocument();
  });

  it("shows a tooltip on hover", async () => {
    render(HeatmapChart, { props: { data, xLabels, yLabels } });
    await fireEvent.mouseEnter(document.querySelectorAll(".cy-heatmap__cell")[4]);
    expect(document.querySelector(".cy-heatmap__tooltip")?.textContent).toContain("Y2 / X2");
    await fireEvent.mouseLeave(document.querySelectorAll(".cy-heatmap__cell")[4]);
    expect(document.querySelector(".cy-heatmap__tooltip")).not.toBeInTheDocument();
  });
});

describe("HeatmapChart accessibility", () => {
  const data = [
    [1, 0.5],
    [-0.25, 1],
  ];

  // Regression: cells were focusable role="gridcell" without a row/grid parent
  // (axe aria-required-parent) and the heatmap had no accessible name.
  it("exposes the grid as one named image with no focusable cells", () => {
    render(HeatmapChart, { props: { data } });
    expect(screen.getByRole("img", { name: "Heatmap" })).toBe(document.querySelector(".cy-heatmap__container"));
    expect(document.querySelector('[role="gridcell"]')).toBeNull();
    expect(document.querySelector(".cy-heatmap__cell[tabindex]")).toBeNull();
  });

  it("wires title and description to the grid", () => {
    render(HeatmapChart, { props: { data, title: "Correlation", description: "Pairwise r" } });
    expect(screen.getByRole("img", { name: "Correlation" })).toHaveAccessibleDescription("Pairwise r");
  });

  it("derives a data table from the matrix and axis labels", () => {
    render(HeatmapChart, { props: { data, xLabels: ["A", "B"], yLabels: ["A", "B"], labels: { columns: { row: "Feature" } } } });
    const rows = [...document.querySelectorAll("table tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Feature", "A", "B"],
      ["A", "1", "0.50"],
      ["B", "-0.25", "1"],
    ]);
  });

  // Regression: an empty corner header failed axe empty-table-header.
  it("names the row-label column by default", () => {
    render(HeatmapChart, { props: { data } });
    expect(document.querySelector("thead th")?.textContent).toBe("Row");
  });

  it("renders no table or toggle without data", () => {
    render(HeatmapChart, { props: { data: [] } });
    expect(document.querySelector("table")).toBeNull();
    expect(screen.queryByRole("button", { name: "Show data" })).toBeNull();
  });

  it("colours value text black or white for contrast", () => {
    render(HeatmapChart, { props: { data: [[0, 10]] } });
    const values = [...document.querySelectorAll<HTMLElement>(".cy-heatmap__cell-val")].map((el) => el.style.color);
    expect(values).toEqual(["rgb(255, 255, 255)", "rgb(0, 0, 0)"]);
  });
});
