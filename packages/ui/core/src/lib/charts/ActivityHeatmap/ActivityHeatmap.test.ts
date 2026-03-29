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

  it("renders a canvas element", () => {
    render(ActivityHeatmap, { props: { data } });
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("shows label when provided", () => {
    render(ActivityHeatmap, { props: { data, label: "Commits" } });
    const label = document.querySelector(".cy-heatmap__label");
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toBe("Commits");
  });

  it("renders with empty data", () => {
    render(ActivityHeatmap, { props: { data: [] } });
    const el = document.querySelector(".cy-heatmap");
    expect(el).toBeInTheDocument();
  });
});
