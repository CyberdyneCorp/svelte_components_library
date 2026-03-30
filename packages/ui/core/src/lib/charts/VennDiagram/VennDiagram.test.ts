import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
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
});
