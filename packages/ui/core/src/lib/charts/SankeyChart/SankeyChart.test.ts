import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import SankeyChart from "./SankeyChart.svelte";

describe("SankeyChart", () => {
  const nodes = [
    { id: "a", label: "Source A" },
    { id: "b", label: "Source B" },
    { id: "c", label: "Target C" },
  ];

  const links = [
    { source: "a", target: "c", value: 100 },
    { source: "b", target: "c", value: 50 },
  ];

  it("renders the container", () => {
    render(SankeyChart, { props: { nodes, links } });
    const el = document.querySelector(".cy-sankey-chart");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(SankeyChart, { props: { nodes, links } });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders node rectangles", () => {
    render(SankeyChart, { props: { nodes, links } });
    const rects = document.querySelectorAll(".cy-sankey-chart__node");
    expect(rects.length).toBe(3);
  });

  it("renders link paths", () => {
    render(SankeyChart, { props: { nodes, links } });
    const paths = document.querySelectorAll(".cy-sankey-chart__link");
    expect(paths.length).toBe(2);
  });

  it("renders node labels", () => {
    render(SankeyChart, { props: { nodes, links } });
    const labels = document.querySelectorAll(".cy-sankey-chart__node-label");
    expect(labels.length).toBe(3);
  });

  it("renders with empty data", () => {
    render(SankeyChart, { props: { nodes: [], links: [] } });
    const el = document.querySelector(".cy-sankey-chart");
    expect(el).toBeInTheDocument();
  });

  it("hides values when showValues is false", () => {
    render(SankeyChart, { props: { nodes, links, showValues: false } });
    const labels = document.querySelectorAll(".cy-sankey-chart__node-label");
    labels.forEach((label) => {
      expect(label.textContent).not.toContain("(");
    });
  });
});
