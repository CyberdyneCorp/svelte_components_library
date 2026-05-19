import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import FlowMinimap from "./FlowMinimap.svelte";
import type { FlowNodeSpec } from "../types.js";

const nodes: FlowNodeSpec[] = [
  { id: "a", type: "x", x: 0, y: 0, color: "#5FA8FF", inputs: [], outputs: [] },
  { id: "b", type: "x", x: 400, y: 200, color: "#3FE07F", inputs: [], outputs: [] },
];

describe("FlowMinimap", () => {
  it("renders a rect per node", () => {
    const { container } = render(FlowMinimap, { props: { nodes } });
    expect(container.querySelectorAll("rect").length).toBe(2);
  });

  it("renders nothing when there are no nodes", () => {
    const { container } = render(FlowMinimap, { props: { nodes: [] } });
    expect(container.querySelector(".cy-flow-minimap")).toBeNull();
  });

  it("renders the label", () => {
    const { getByText } = render(FlowMinimap, { props: { nodes, label: "graph" } });
    expect(getByText("graph")).toBeInTheDocument();
  });
});
