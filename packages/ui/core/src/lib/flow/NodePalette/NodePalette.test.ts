import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import NodePalette from "./NodePalette.svelte";

const groups = [
  {
    name: "Sources",
    color: "#5FA8FF",
    items: [
      { type: "s1", label: "Sentinel-1 SAR", sub: "S1" },
      { type: "s2", label: "Sentinel-2 Optical", sub: "S2" },
    ],
  },
  {
    name: "Logic",
    color: "#A855F7",
    items: [{ type: "and", label: "AND", sub: "∧" }],
  },
];

describe("NodePalette", () => {
  it("renders all groups and items", () => {
    const { getByText } = render(NodePalette, { props: { groups } });
    expect(getByText("Sentinel-1 SAR")).toBeInTheDocument();
    expect(getByText("Sentinel-2 Optical")).toBeInTheDocument();
    expect(getByText("AND")).toBeInTheDocument();
  });

  it("displays the total count", () => {
    const { getByText } = render(NodePalette, { props: { groups } });
    expect(getByText("3")).toBeInTheDocument();
  });

  it("filters items by query", async () => {
    const { getByPlaceholderText, queryByText } = render(NodePalette, {
      props: { groups, filter: "and" },
    });
    expect(queryByText("AND")).toBeInTheDocument();
    expect(queryByText("Sentinel-1 SAR")).toBeNull();
  });

  it("renders draggable items", () => {
    const { container } = render(NodePalette, { props: { groups } });
    const items = container.querySelectorAll(".cy-node-palette__item");
    expect(items.length).toBe(3);
    items.forEach((it) => {
      expect(it.getAttribute("draggable")).toBe("true");
    });
  });
});
