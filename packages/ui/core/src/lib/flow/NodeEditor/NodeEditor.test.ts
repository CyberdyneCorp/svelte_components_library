import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import NodeEditor from "./NodeEditor.svelte";
import type { FlowNodeSpec, FlowEdgeSpec } from "../types.js";

const nodes: FlowNodeSpec[] = [
  {
    id: "a",
    type: "src",
    x: 100,
    y: 50,
    title: "Source",
    sub: "S",
    inputs: [],
    outputs: [{ id: "o1", label: "out", type: "scalar" }],
  },
  {
    id: "b",
    type: "sink",
    x: 400,
    y: 200,
    title: "Sink",
    sub: "K",
    inputs: [{ id: "i1", label: "in", type: "scalar" }],
    outputs: [],
  },
];

const edges: FlowEdgeSpec[] = [
  {
    id: "e1",
    source: { nodeId: "a", portId: "o1" },
    target: { nodeId: "b", portId: "i1" },
  },
];

describe("NodeEditor", () => {
  it("renders the canvas container", () => {
    const { container } = render(NodeEditor, { props: { nodes, edges } });
    expect(container.querySelector(".cy-flow-canvas")).toBeInTheDocument();
  });

  it("renders the grid layer", () => {
    const { container } = render(NodeEditor, { props: { nodes, edges } });
    expect(container.querySelector(".cy-flow-canvas__grid")).toBeInTheDocument();
  });

  it("renders one node per spec", () => {
    const { container } = render(NodeEditor, { props: { nodes, edges } });
    expect(container.querySelectorAll(".cy-flow-node").length).toBe(2);
  });

  it("renders one SVG edge per edge spec", () => {
    const { container } = render(NodeEditor, { props: { nodes, edges } });
    expect(container.querySelectorAll(".cy-flow-edge").length).toBe(1);
  });

  it("applies the viewport transform to the world", () => {
    const { container } = render(NodeEditor, {
      props: { nodes, edges, viewport: { x: 20, y: 30, z: 1.5 } },
    });
    const world = container.querySelector(".cy-flow-canvas__world") as HTMLElement;
    expect(world.style.transform).toContain("translate(20px, 30px)");
    expect(world.style.transform).toContain("scale(1.5)");
  });
});
