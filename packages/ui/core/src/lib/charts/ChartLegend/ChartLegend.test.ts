import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ChartLegend from "./ChartLegend.svelte";
import { markerClipPath, seriesStyle } from "./markers.js";

const items = [
  { label: "Income", color: "#00ff41", ...seriesStyle(0) },
  { label: "Spend", color: "#00d4ff", ...seriesStyle(1) },
  { label: "Savings", color: "#bf5af2", ...seriesStyle(2) },
];

describe("ChartLegend", () => {
  it("renders a labelled list with one item per series", () => {
    render(ChartLegend, { props: { items } });
    const list = screen.getByRole("list", { name: "Legend" });
    expect(list.querySelectorAll("li")).toHaveLength(3);
    expect(screen.getByText("Spend")).toBeInTheDocument();
  });

  it("gives every series a distinct marker shape so it reads in grayscale", () => {
    render(ChartLegend, { props: { items } });
    const markers = [...document.querySelectorAll<HTMLElement>(".cy-chart-legend__marker")];
    const clips = markers.map((m) => m.style.getPropertyValue("clip-path"));
    expect(clips).toEqual(items.map((i) => markerClipPath(i.marker)));
    expect(new Set(clips).size).toBe(3);
  });

  it("colours the marker and hides it from assistive tech", () => {
    render(ChartLegend, { props: { items: [items[0]] } });
    const marker = document.querySelector(".cy-chart-legend__marker") as HTMLElement;
    expect(marker.style.background).toBe("rgb(0, 255, 65)");
    expect(marker).toHaveAttribute("aria-hidden", "true");
  });

  it("draws line samples with each series' dash pattern when showLine is set", () => {
    render(ChartLegend, { props: { items, showLine: true } });
    const lines = [...document.querySelectorAll(".cy-chart-legend__line line")];
    expect(lines.map((l) => l.getAttribute("stroke-dasharray"))).toEqual([null, "6 4", "2 3"]);
  });

  it("omits line samples by default", () => {
    render(ChartLegend, { props: { items } });
    expect(document.querySelector(".cy-chart-legend__line")).not.toBeInTheDocument();
  });

  it("adds BEM hooks for the host chart and renders details", () => {
    render(ChartLegend, {
      props: { items: [{ label: "Rent", color: "red", detail: "40%" }], blockClass: "cy-pie-chart", ariaLabel: "Spending" },
    });
    expect(screen.getByRole("list", { name: "Spending" })).toHaveClass("cy-pie-chart__legend");
    expect(document.querySelector(".cy-pie-chart__legend-item")).toBeInTheDocument();
    expect(document.querySelector(".cy-pie-chart__legend-dot")).toBeInTheDocument();
    expect(screen.getByText("40%")).toHaveClass("cy-pie-chart__legend-value");
  });

  it("re-clips a marker when its shape changes", async () => {
    const { rerender } = render(ChartLegend, { props: { items: [{ label: "A", color: "red", marker: "square" }] } });
    await rerender({ items: [{ label: "A", color: "red", marker: "diamond" }] });
    const marker = document.querySelector(".cy-chart-legend__marker") as HTMLElement;
    expect(marker.style.getPropertyValue("clip-path")).toBe(markerClipPath("diamond"));
  });

  it("falls back to a circle when no marker is given", () => {
    render(ChartLegend, { props: { items: [{ label: "Only", color: "red" }] } });
    expect(document.querySelector("li")).toHaveAttribute("data-marker", "circle");
  });
});
