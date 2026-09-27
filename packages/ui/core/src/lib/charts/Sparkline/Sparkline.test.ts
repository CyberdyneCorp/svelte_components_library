import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Sparkline from "./Sparkline.svelte";

describe("Sparkline", () => {
  const data = [10, 20, 15, 25, 30];

  it("renders an SVG element", () => {
    render(Sparkline, { props: { data } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders a polyline for the data", () => {
    render(Sparkline, { props: { data } });
    const polyline = document.querySelector(".cy-sparkline__line");
    expect(polyline).toBeInTheDocument();
  });

  it("shows end dot when showEndDot is true", () => {
    render(Sparkline, { props: { data, showEndDot: true } });
    const dot = document.querySelector(".cy-sparkline__dot");
    expect(dot).toBeInTheDocument();
  });

  it("renders area path when showArea is true", () => {
    render(Sparkline, { props: { data, showArea: true } });
    const area = document.querySelector(".cy-sparkline__area");
    expect(area).toBeInTheDocument();
  });

  it("applies custom dimensions", () => {
    render(Sparkline, { props: { data, width: 200, height: 50 } });
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "200");
    expect(svg).toHaveAttribute("height", "50");
  });
});

describe("Sparkline accessibility", () => {
  it("is an image named 'Sparkline' by default", () => {
    render(Sparkline, { props: { data: [1, 2, 3] } });
    expect(screen.getByRole("img", { name: "Sparkline" })).toBeInTheDocument();
  });

  it("uses the label as the accessible name", () => {
    render(Sparkline, { props: { data: [1, 2, 3], label: "NDVI" } });
    expect(screen.getByRole("img", { name: "NDVI" })).toBeInTheDocument();
  });

  it("prefers a title and keeps it visually hidden by default", () => {
    render(Sparkline, { props: { data: [1, 2], title: "BTC 7d", description: "Down 3%" } });
    expect(screen.getByRole("img", { name: "BTC 7d" })).toHaveAccessibleDescription("Down 3%");
    expect(document.querySelector("figcaption")).toHaveClass("cy-chart-frame__sr-only");
  });

  it("renders a screen-reader table of the values without a toggle or legend", () => {
    render(Sparkline, { props: { data: [4, 8], label: "Balance" } });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(document.querySelector(".cy-chart-frame__table-wrap")).toHaveClass("cy-chart-frame__sr-only");
    const rows = [...document.querySelectorAll("table tr")].map((r) => [...r.children].map((c) => c.textContent));
    expect(rows).toEqual([
      ["Point", "Balance"],
      ["1", "4"],
      ["2", "8"],
    ]);
  });

  it("uses sample timestamps as row headers", () => {
    render(Sparkline, { props: { samples: [{ ts: 100, value: 1 }, { ts: 200, value: 2 }] } });
    const headers = [...document.querySelectorAll("th[scope=row]")].map((h) => h.textContent);
    expect(headers).toEqual(["100", "200"]);
    expect(document.querySelector("th[scope=col]")).toHaveTextContent("Time");
  });

  it("can opt into the visible data toggle", () => {
    render(Sparkline, { props: { data: [1, 2], showDataToggle: true } });
    expect(screen.getByRole("button", { name: "Show data" })).toHaveAttribute("aria-expanded", "false");
  });
});
