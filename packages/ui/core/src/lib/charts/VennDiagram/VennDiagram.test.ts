import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import VennDiagram from "./VennDiagram.svelte";

describe("VennDiagram", () => {
  const twoSets = {
    sets: [
      { label: "Set A", size: 100 },
      { label: "Set B", size: 80 },
    ],
    overlaps: [
      { sets: [0, 1], size: 30, label: "30" },
    ],
  };

  const threeSets = {
    sets: [
      { label: "X", size: 200 },
      { label: "Y", size: 150 },
      { label: "Z", size: 100 },
    ],
    overlaps: [
      { sets: [0, 1], size: 50 },
      { sets: [1, 2], size: 30 },
      { sets: [0, 1, 2], size: 10 },
    ],
  };

  it("renders the container", () => {
    render(VennDiagram, { props: twoSets });
    const el = document.querySelector(".cy-venn-diagram");
    expect(el).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    render(VennDiagram, { props: twoSets });
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders circles for each set", () => {
    render(VennDiagram, { props: twoSets });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle");
    expect(circles.length).toBe(2);
  });

  it("renders three circles for three sets", () => {
    render(VennDiagram, { props: threeSets });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle");
    expect(circles.length).toBe(3);
  });

  it("shows set labels", () => {
    render(VennDiagram, { props: twoSets });
    expect(screen.getByText("Set A")).toBeInTheDocument();
    expect(screen.getByText("Set B")).toBeInTheDocument();
  });

  it("shows overlap labels", () => {
    render(VennDiagram, { props: twoSets });
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("hides values when showValues is false", () => {
    render(VennDiagram, { props: { ...twoSets, showValues: false } });
    const values = document.querySelectorAll(".cy-venn-diagram__value");
    expect(values.length).toBe(0);
  });

  it("renders with empty sets", () => {
    render(VennDiagram, { props: { sets: [], overlaps: [] } });
    const el = document.querySelector(".cy-venn-diagram");
    expect(el).toBeInTheDocument();
  });

  it("renders a single set centered", () => {
    render(VennDiagram, { props: { sets: [{ label: "Solo", size: 50 }], overlaps: [] } });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle");
    expect(circles.length).toBe(1);
    expect(screen.getByText("Solo")).toBeInTheDocument();
  });

  it("renders four sets arranged in a circle", () => {
    const fourSets = {
      sets: [
        { label: "A", size: 100 },
        { label: "B", size: 80 },
        { label: "C", size: 60 },
        { label: "D", size: 40 },
      ],
      overlaps: [],
    };
    render(VennDiagram, { props: fourSets });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle");
    expect(circles.length).toBe(4);
  });

  it("uses custom colors on sets", () => {
    const colorSets = {
      sets: [
        { label: "Red", size: 100, color: "#ff0000" },
        { label: "Blue", size: 80, color: "#0000ff" },
      ],
      overlaps: [],
    };
    render(VennDiagram, { props: colorSets });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle");
    expect(circles[0].getAttribute("fill")).toBe("#ff0000");
    expect(circles[1].getAttribute("fill")).toBe("#0000ff");
  });

  it("uses default colors when no color specified", () => {
    render(VennDiagram, { props: twoSets });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle");
    expect(circles[0].getAttribute("fill")).toBe("#00ff41");
    expect(circles[1].getAttribute("fill")).toBe("#00d4ff");
  });

  it("hides labels when showLabels is false", () => {
    render(VennDiagram, { props: { ...twoSets, showLabels: false } });
    const labels = document.querySelectorAll(".cy-venn-diagram__label");
    expect(labels.length).toBe(0);
  });

  it("shows set values when showValues and showLabels are true", () => {
    render(VennDiagram, { props: { ...twoSets, showLabels: true, showValues: true } });
    const values = document.querySelectorAll(".cy-venn-diagram__value");
    expect(values.length).toBe(2);
    expect(values[0].textContent?.trim()).toBe("100");
    expect(values[1].textContent?.trim()).toBe("80");
  });

  it("hides overlap labels when showValues is false", () => {
    render(VennDiagram, { props: { ...twoSets, showValues: false } });
    const overlapLabels = document.querySelectorAll(".cy-venn-diagram__overlap-label");
    expect(overlapLabels.length).toBe(0);
  });

  it("shows overlap size when no label is provided", () => {
    const noLabelOverlap = {
      sets: [
        { label: "A", size: 100 },
        { label: "B", size: 80 },
      ],
      overlaps: [
        { sets: [0, 1], size: 25 },
      ],
    };
    render(VennDiagram, { props: noLabelOverlap });
    const overlapLabels = document.querySelectorAll(".cy-venn-diagram__overlap-label");
    expect(overlapLabels.length).toBe(1);
    expect(overlapLabels[0].textContent?.trim()).toBe("25");
  });

  it("renders 3-set overlap label at centroid", () => {
    render(VennDiagram, { props: threeSets });
    const overlapLabels = document.querySelectorAll(".cy-venn-diagram__overlap-label");
    // Should have 3 overlap labels (2 two-set + 1 three-set)
    expect(overlapLabels.length).toBe(3);
  });

  it("fires onSetClick when a circle is clicked", async () => {
    const handler = vi.fn();
    render(VennDiagram, { props: { ...twoSets, onSetClick: handler } });
    const circle = document.querySelector(".cy-venn-diagram__circle") as SVGElement;
    await fireEvent.click(circle);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(twoSets.sets[0], 0);
  });

  it("fires onOverlapClick when an overlap label is clicked", async () => {
    const handler = vi.fn();
    render(VennDiagram, { props: { ...twoSets, onOverlapClick: handler } });
    const overlapLabel = document.querySelector(".cy-venn-diagram__overlap-label") as SVGElement;
    await fireEvent.click(overlapLabel);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("shows tooltip on circle mouseenter", async () => {
    render(VennDiagram, { props: { ...twoSets, showTooltip: true } });
    expect(document.querySelector(".cy-venn-diagram__tooltip")).not.toBeInTheDocument();
    const circle = document.querySelector(".cy-venn-diagram__circle") as SVGElement;
    await fireEvent.mouseEnter(circle, { clientX: 200, clientY: 150 });
    const tooltip = document.querySelector(".cy-venn-diagram__tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toContain("Set A");
    expect(tooltip?.textContent).toContain("100");
  });

  it("hides tooltip on mouseleave", async () => {
    render(VennDiagram, { props: { ...twoSets, showTooltip: true } });
    const circle = document.querySelector(".cy-venn-diagram__circle") as SVGElement;
    await fireEvent.mouseEnter(circle, { clientX: 200, clientY: 150 });
    expect(document.querySelector(".cy-venn-diagram__tooltip")).toBeInTheDocument();
    await fireEvent.mouseLeave(circle);
    expect(document.querySelector(".cy-venn-diagram__tooltip")).not.toBeInTheDocument();
  });

  it("does not show tooltip when showTooltip is false", async () => {
    render(VennDiagram, { props: { ...twoSets, showTooltip: false } });
    const circle = document.querySelector(".cy-venn-diagram__circle") as SVGElement;
    await fireEvent.mouseEnter(circle, { clientX: 200, clientY: 150 });
    expect(document.querySelector(".cy-venn-diagram__tooltip")).not.toBeInTheDocument();
  });

  it("applies animation class when animate is true", () => {
    render(VennDiagram, { props: { ...twoSets, animate: true } });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle--animated");
    expect(circles.length).toBe(2);
  });

  it("does not apply animation class when animate is false", () => {
    render(VennDiagram, { props: { ...twoSets, animate: false } });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle--animated");
    expect(circles.length).toBe(0);
  });

  it("applies custom className", () => {
    render(VennDiagram, { props: { ...twoSets, class: "my-custom-class" } });
    const el = document.querySelector(".cy-venn-diagram");
    expect(el?.classList.contains("my-custom-class")).toBe(true);
  });

  it("handles two sets with no overlap", () => {
    const noOverlap = {
      sets: [
        { label: "A", size: 100 },
        { label: "B", size: 80 },
      ],
      overlaps: [],
    };
    render(VennDiagram, { props: noOverlap });
    const circles = document.querySelectorAll(".cy-venn-diagram__circle");
    expect(circles.length).toBe(2);
    const overlapLabels = document.querySelectorAll(".cy-venn-diagram__overlap-label");
    expect(overlapLabels.length).toBe(0);
  });
});
