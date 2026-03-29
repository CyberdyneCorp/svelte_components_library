import { render } from "@testing-library/svelte";
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
