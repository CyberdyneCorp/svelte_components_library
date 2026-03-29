import { render } from "@testing-library/svelte";
import { describe, it, expect, beforeAll } from "vitest";
import GraphViewer from "./GraphViewer.svelte";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe("GraphViewer", () => {
  const nodes = [
    { id: "1", label: "Node A" },
    { id: "2", label: "Node B" },
  ];
  const edges = [{ source: "1", target: "2" }];

  it("renders the container", () => {
    render(GraphViewer, { props: { nodes, edges } });
    const el = document.querySelector(".cy-graph");
    expect(el).toBeInTheDocument();
  });

  it("renders a canvas element", () => {
    render(GraphViewer, { props: { nodes, edges } });
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders the toolbar", () => {
    render(GraphViewer, { props: { nodes, edges } });
    const toolbar = document.querySelector(".cy-graph__toolbar");
    expect(toolbar).toBeInTheDocument();
  });
});
