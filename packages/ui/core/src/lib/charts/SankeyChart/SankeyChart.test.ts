import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
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

  it("shows values in labels when showValues is true", () => {
    render(SankeyChart, { props: { nodes, links, showValues: true } });
    const labels = document.querySelectorAll(".cy-sankey-chart__node-label");
    // At least some labels should contain parenthesized values
    const hasValues = Array.from(labels).some((l) => l.textContent?.includes("("));
    expect(hasValues).toBe(true);
  });

  it("uses node id as label when no label provided", () => {
    const noLabelNodes = [
      { id: "src" },
      { id: "tgt" },
    ];
    const simpleLinks = [{ source: "src", target: "tgt", value: 50 }];
    render(SankeyChart, { props: { nodes: noLabelNodes, links: simpleLinks, showValues: false } });
    const labels = document.querySelectorAll(".cy-sankey-chart__node-label");
    const texts = Array.from(labels).map((l) => l.textContent?.trim());
    expect(texts).toContain("src");
    expect(texts).toContain("tgt");
  });

  it("uses custom node colors", () => {
    const colorNodes = [
      { id: "a", label: "A", color: "#ff0000" },
      { id: "b", label: "B", color: "#00ff00" },
    ];
    const simpleLinks = [{ source: "a", target: "b", value: 50 }];
    render(SankeyChart, { props: { nodes: colorNodes, links: simpleLinks } });
    const rects = document.querySelectorAll(".cy-sankey-chart__node");
    expect(rects[0].getAttribute("fill")).toBe("#ff0000");
  });

  it("uses default colors when no custom color on nodes", () => {
    render(SankeyChart, { props: { nodes, links } });
    const rects = document.querySelectorAll(".cy-sankey-chart__node");
    expect(rects[0].getAttribute("fill")).toBe("#00ff41");
  });

  it("applies animation class when animate is true", () => {
    render(SankeyChart, { props: { nodes, links, animate: true } });
    const animatedLinks = document.querySelectorAll(".cy-sankey-chart__link--animated");
    expect(animatedLinks.length).toBe(2);
    const animatedNodes = document.querySelectorAll(".cy-sankey-chart__node--animated");
    expect(animatedNodes.length).toBe(3);
  });

  it("does not apply animation class when animate is false", () => {
    render(SankeyChart, { props: { nodes, links, animate: false } });
    const animatedLinks = document.querySelectorAll(".cy-sankey-chart__link--animated");
    expect(animatedLinks.length).toBe(0);
    const animatedNodes = document.querySelectorAll(".cy-sankey-chart__node--animated");
    expect(animatedNodes.length).toBe(0);
  });

  it("shows link tooltip on mouseenter", async () => {
    render(SankeyChart, { props: { nodes, links, showTooltip: true } });
    expect(document.querySelector(".cy-sankey-chart__tooltip")).not.toBeInTheDocument();
    const linkPath = document.querySelector(".cy-sankey-chart__link") as SVGElement;
    await fireEvent.mouseEnter(linkPath, { clientX: 400, clientY: 200 });
    const tooltip = document.querySelector(".cy-sankey-chart__tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toContain("Source A");
    expect(tooltip?.textContent).toContain("Target C");
  });

  it("hides link tooltip on mouseleave", async () => {
    render(SankeyChart, { props: { nodes, links, showTooltip: true } });
    const linkPath = document.querySelector(".cy-sankey-chart__link") as SVGElement;
    await fireEvent.mouseEnter(linkPath, { clientX: 400, clientY: 200 });
    expect(document.querySelector(".cy-sankey-chart__tooltip")).toBeInTheDocument();
    await fireEvent.mouseLeave(linkPath);
    expect(document.querySelector(".cy-sankey-chart__tooltip")).not.toBeInTheDocument();
  });

  it("shows node tooltip on mouseenter", async () => {
    render(SankeyChart, { props: { nodes, links, showTooltip: true } });
    const nodeRect = document.querySelector(".cy-sankey-chart__node") as SVGElement;
    await fireEvent.mouseEnter(nodeRect, { clientX: 100, clientY: 100 });
    const tooltip = document.querySelector(".cy-sankey-chart__tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toContain("Source A");
  });

  it("does not show tooltip when showTooltip is false", async () => {
    render(SankeyChart, { props: { nodes, links, showTooltip: false } });
    const linkPath = document.querySelector(".cy-sankey-chart__link") as SVGElement;
    await fireEvent.mouseEnter(linkPath, { clientX: 400, clientY: 200 });
    expect(document.querySelector(".cy-sankey-chart__tooltip")).not.toBeInTheDocument();
  });

  it("fires onNodeClick when a node is clicked", async () => {
    const handler = vi.fn();
    render(SankeyChart, { props: { nodes, links, onNodeClick: handler } });
    const nodeRect = document.querySelector(".cy-sankey-chart__node") as SVGElement;
    await fireEvent.click(nodeRect);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("fires onLinkClick when a link is clicked", async () => {
    const handler = vi.fn();
    render(SankeyChart, { props: { nodes, links, onLinkClick: handler } });
    const linkPath = document.querySelector(".cy-sankey-chart__link") as SVGElement;
    await fireEvent.click(linkPath);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toHaveProperty("source", "a");
    expect(handler.mock.calls[0][0]).toHaveProperty("target", "c");
    expect(handler.mock.calls[0][0]).toHaveProperty("value", 100);
  });

  it("applies custom className", () => {
    render(SankeyChart, { props: { nodes, links, class: "my-sankey" } });
    const el = document.querySelector(".cy-sankey-chart");
    expect(el?.classList.contains("my-sankey")).toBe(true);
  });

  it("renders multi-column layout correctly", () => {
    const multiNodes = [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
      { id: "d", label: "D" },
    ];
    const multiLinks = [
      { source: "a", target: "b", value: 100 },
      { source: "b", target: "c", value: 80 },
      { source: "c", target: "d", value: 60 },
    ];
    render(SankeyChart, { props: { nodes: multiNodes, links: multiLinks } });
    const rects = document.querySelectorAll(".cy-sankey-chart__node");
    expect(rects.length).toBe(4);
    const paths = document.querySelectorAll(".cy-sankey-chart__link");
    expect(paths.length).toBe(3);
  });

  it("handles link with custom color", () => {
    const colorLinks = [
      { source: "a", target: "c", value: 100, color: "#ff00ff" },
    ];
    render(SankeyChart, { props: { nodes, links: colorLinks } });
    const linkPath = document.querySelector(".cy-sankey-chart__link");
    expect(linkPath?.getAttribute("stroke")).toBe("#ff00ff");
  });

  it("ignores links referencing non-existent nodes", () => {
    const badLinks = [
      { source: "a", target: "nonexistent", value: 100 },
    ];
    render(SankeyChart, { props: { nodes, links: badLinks } });
    // Should not crash; link should be skipped
    const paths = document.querySelectorAll(".cy-sankey-chart__link");
    expect(paths.length).toBe(0);
  });
});
