import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, beforeAll, vi } from "vitest";
import GraphViewer from "./GraphViewer.svelte";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;

  // Mock canvas getContext
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    shadowColor: "",
    shadowBlur: 0,
    font: "",
    textAlign: "",
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    closePath: vi.fn(),
    quadraticCurveTo: vi.fn(),
  }) as any;
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

  it("renders zoom in button", () => {
    render(GraphViewer, { props: { nodes, edges } });
    expect(screen.getByTitle("Zoom in")).toBeInTheDocument();
  });

  it("renders zoom out button", () => {
    render(GraphViewer, { props: { nodes, edges } });
    expect(screen.getByTitle("Zoom out")).toBeInTheDocument();
  });

  it("renders fit to screen button", () => {
    render(GraphViewer, { props: { nodes, edges } });
    expect(screen.getByTitle("Fit to screen")).toBeInTheDocument();
  });

  it("renders toggle communities button", () => {
    render(GraphViewer, { props: { nodes, edges } });
    expect(screen.getByTitle("Toggle communities")).toBeInTheDocument();
  });

  it("renders reset layout button", () => {
    render(GraphViewer, { props: { nodes, edges } });
    expect(screen.getByTitle("Reset layout")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(GraphViewer, { props: { nodes, edges } });
    expect(screen.getByPlaceholderText("Search nodes...")).toBeInTheDocument();
  });

  it("handles zoom in button click without error", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    await fireEvent.click(screen.getByTitle("Zoom in"));
    expect(screen.getByTitle("Zoom in")).toBeInTheDocument();
  });

  it("handles zoom out button click without error", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    await fireEvent.click(screen.getByTitle("Zoom out"));
    expect(screen.getByTitle("Zoom out")).toBeInTheDocument();
  });

  it("handles fit to screen button click without error", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    await fireEvent.click(screen.getByTitle("Fit to screen"));
    expect(screen.getByTitle("Fit to screen")).toBeInTheDocument();
  });

  it("handles toggle communities click without error", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    await fireEvent.click(screen.getByTitle("Toggle communities"));
    expect(screen.getByTitle("Toggle communities")).toBeInTheDocument();
  });

  it("handles reset layout click without error", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    await fireEvent.click(screen.getByTitle("Reset layout"));
    expect(screen.getByTitle("Reset layout")).toBeInTheDocument();
  });

  it("calls onsearch when search input is changed", async () => {
    const onsearch = vi.fn();
    render(GraphViewer, { props: { nodes, edges, onsearch } });
    const input = screen.getByPlaceholderText("Search nodes...");
    await fireEvent.input(input, { target: { value: "Node" } });
    expect(onsearch).toHaveBeenCalledWith("Node");
  });

  it("displays zoom percentage indicator", () => {
    render(GraphViewer, { props: { nodes, edges } });
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders with custom width and height", () => {
    render(GraphViewer, { props: { nodes, edges, width: "800px", height: "400px" } });
    const el = document.querySelector(".cy-graph") as HTMLElement;
    expect(el.style.width).toBe("800px");
    expect(el.style.height).toBe("400px");
  });

  it("handles canvas mousedown event", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    const canvas = document.querySelector("canvas")!;
    await fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("handles canvas mousemove event", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    const canvas = document.querySelector("canvas")!;
    await fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    expect(canvas).toBeInTheDocument();
  });

  it("handles canvas mouseup event", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    const canvas = document.querySelector("canvas")!;
    await fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("handles canvas mouseleave event", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    const canvas = document.querySelector("canvas")!;
    await fireEvent.mouseLeave(canvas);
    expect(canvas).toBeInTheDocument();
  });

  it("handles canvas wheel event", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    const canvas = document.querySelector("canvas")!;
    await fireEvent.wheel(canvas, { deltaY: -100, clientX: 200, clientY: 200 });
    expect(canvas).toBeInTheDocument();
  });

  it("handles pan via mousedown and mousemove", async () => {
    render(GraphViewer, { props: { nodes, edges } });
    const canvas = document.querySelector("canvas")!;
    // Click on empty area to start panning
    await fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    await fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    await fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("renders with multiple nodes and edges", () => {
    const manyNodes = [
      { id: "1", label: "A", group: "g1" },
      { id: "2", label: "B", group: "g1" },
      { id: "3", label: "C", group: "g2" },
    ];
    const manyEdges = [
      { source: "1", target: "2", label: "connects", weight: 2 },
      { source: "2", target: "3" },
    ];
    render(GraphViewer, { props: { nodes: manyNodes, edges: manyEdges } });
    expect(document.querySelector(".cy-graph")).toBeInTheDocument();
  });

  it("renders with config overrides", () => {
    render(GraphViewer, {
      props: {
        nodes,
        edges,
        config: {
          showLabels: false,
          showEdgeLabels: true,
          enableZoom: false,
          enablePan: false,
        },
      },
    });
    expect(document.querySelector(".cy-graph")).toBeInTheDocument();
  });

  it("renders with empty nodes and edges", () => {
    render(GraphViewer, { props: { nodes: [], edges: [] } });
    expect(document.querySelector(".cy-graph")).toBeInTheDocument();
  });
});
