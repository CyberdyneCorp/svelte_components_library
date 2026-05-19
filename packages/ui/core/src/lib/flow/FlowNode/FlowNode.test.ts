import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import FlowNode from "./FlowNode.svelte";
import type { FlowNodeSpec } from "../types.js";

const baseNode: FlowNodeSpec = {
  id: "n_test",
  type: "demo",
  x: 100,
  y: 80,
  title: "Demo Node",
  sub: "DM",
  inputs: [{ id: "in1", label: "value", type: "scalar" }],
  outputs: [{ id: "out1", label: "result", type: "bool" }],
  rows: [{ kind: "row", l: "Op", v: "mean" }],
};

describe("FlowNode", () => {
  it("renders title and sub", () => {
    const { getByText } = render(FlowNode, { props: { node: baseNode } });
    expect(getByText("Demo Node")).toBeInTheDocument();
    expect(getByText("DM")).toBeInTheDocument();
  });

  it("positions the node at the given coordinates", () => {
    const { container } = render(FlowNode, { props: { node: baseNode } });
    const el = container.querySelector(".cy-flow-node") as HTMLElement;
    expect(el.style.left).toBe("100px");
    expect(el.style.top).toBe("80px");
  });

  it("renders one in port and one out port", () => {
    const { container } = render(FlowNode, { props: { node: baseNode } });
    expect(container.querySelectorAll(".cy-flow-port--in").length).toBe(1);
    expect(container.querySelectorAll(".cy-flow-port--out").length).toBe(1);
  });

  it("applies selected class", () => {
    const { container } = render(FlowNode, {
      props: { node: baseNode, selected: true },
    });
    const el = container.querySelector(".cy-flow-node");
    expect(el?.className).toContain("cy-flow-node--selected");
  });

  it("shows firing status in foot", () => {
    const { getByText } = render(FlowNode, {
      props: { node: baseNode, firing: true },
    });
    expect(getByText("firing")).toBeInTheDocument();
  });
});
