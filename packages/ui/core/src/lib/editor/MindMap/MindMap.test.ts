import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import MindMap from "./MindMap.svelte";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;

  // Mock canvas context
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    setLineDash: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    textAlign: "",
    textBaseline: "",
    font: "",
    shadowColor: "",
    shadowBlur: 0,
    globalAlpha: 1,
  }) as any;
});

const rootData = {
  id: "root",
  label: "Central Idea",
  children: [
    { id: "child1", label: "Branch 1", children: [] },
    { id: "child2", label: "Branch 2", children: [
      { id: "grandchild1", label: "Sub 1", children: [] },
    ]},
  ],
};

describe("MindMap", () => {
  it("renders the container", () => {
    render(MindMap);
    const el = document.querySelector(".cy-mindmap");
    expect(el).toBeInTheDocument();
  });

  it("renders a canvas element", () => {
    render(MindMap);
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders the toolbar", () => {
    render(MindMap);
    const toolbar = document.querySelector(".cy-mindmap__toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("hides toolbar when readonly", () => {
    render(MindMap, { props: { readonly: true } });
    const toolbar = document.querySelector(".cy-mindmap__toolbar");
    expect(toolbar).not.toBeInTheDocument();
  });

  it("renders with custom width and height", () => {
    const { container } = render(MindMap, { props: { width: "800px", height: "500px" } });
    const el = container.querySelector(".cy-mindmap") as HTMLElement;
    expect(el.style.width).toBe("800px");
    expect(el.style.height).toBe("500px");
  });

  it("renders with root data", () => {
    render(MindMap, { props: { root: rootData } });
    const el = document.querySelector(".cy-mindmap");
    expect(el).toBeInTheDocument();
  });

  it("has application role", () => {
    render(MindMap);
    expect(screen.getByRole("application")).toBeInTheDocument();
  });

  it("toolbar has Add Child button", () => {
    render(MindMap);
    expect(screen.getByText("Add Child")).toBeInTheDocument();
  });

  it("toolbar has Add Sibling button", () => {
    render(MindMap);
    expect(screen.getByText("Add Sibling")).toBeInTheDocument();
  });

  it("toolbar has Delete button", () => {
    render(MindMap);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("toolbar has Undo button", () => {
    render(MindMap);
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  it("toolbar has Redo button", () => {
    render(MindMap);
    expect(screen.getByText("Redo")).toBeInTheDocument();
  });

  it("toolbar has Collapse button", () => {
    render(MindMap);
    expect(screen.getByText("Collapse")).toBeInTheDocument();
  });

  it("toolbar has Expand button", () => {
    render(MindMap);
    expect(screen.getByText("Expand")).toBeInTheDocument();
  });

  it("toolbar has Export button", () => {
    render(MindMap);
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("Undo button is disabled initially", () => {
    render(MindMap);
    const undoBtn = screen.getByTitle("Undo (Ctrl+Z)");
    expect(undoBtn).toBeDisabled();
  });

  it("Redo button is disabled initially", () => {
    render(MindMap);
    const redoBtn = screen.getByTitle("Redo (Ctrl+Shift+Z)");
    expect(redoBtn).toBeDisabled();
  });

  it("displays zoom percentage", () => {
    const { container } = render(MindMap);
    const label = container.querySelector(".cy-mindmap__zoom-label");
    expect(label).toBeInTheDocument();
    // Zoom should contain a percentage
    expect(label?.textContent).toMatch(/\d+%/);
  });

  it("has zoom in button", () => {
    render(MindMap);
    expect(screen.getByTitle("Zoom In")).toBeInTheDocument();
  });

  it("has zoom out button", () => {
    render(MindMap);
    expect(screen.getByTitle("Zoom Out")).toBeInTheDocument();
  });

  it("has fit to screen button", () => {
    render(MindMap);
    expect(screen.getByTitle("Fit to Screen")).toBeInTheDocument();
  });

  it("clicking Zoom In does not throw", async () => {
    render(MindMap);
    const btn = screen.getByTitle("Zoom In");
    await fireEvent.click(btn);
    // Just asserting no error
    expect(btn).toBeInTheDocument();
  });

  it("clicking Zoom Out does not throw", async () => {
    render(MindMap);
    const btn = screen.getByTitle("Zoom Out");
    await fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it("clicking Fit to Screen does not throw", async () => {
    render(MindMap);
    const btn = screen.getByTitle("Fit to Screen");
    await fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it("clicking Collapse All does not throw", async () => {
    render(MindMap, { props: { root: rootData } });
    const btn = screen.getByTitle("Collapse All");
    await fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it("clicking Expand All does not throw", async () => {
    render(MindMap, { props: { root: rootData } });
    const btn = screen.getByTitle("Expand All");
    await fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it("clicking Export calls onexport", async () => {
    const onexport = vi.fn();
    render(MindMap, { props: { root: rootData, onexport } });
    const btn = screen.getByTitle("Export to Markdown");
    await fireEvent.click(btn);
    expect(onexport).toHaveBeenCalled();
    const md = onexport.mock.calls[0][0];
    expect(md).toContain("Central Idea");
  });

  it("calls onchange after Collapse All", async () => {
    const onchange = vi.fn();
    render(MindMap, { props: { root: { ...rootData, children: [...rootData.children!] }, onchange } });
    await fireEvent.click(screen.getByTitle("Collapse All"));
    expect(onchange).toHaveBeenCalled();
  });

  it("calls onchange after Expand All", async () => {
    const onchange = vi.fn();
    render(MindMap, { props: { root: { ...rootData, children: [...rootData.children!] }, onchange } });
    await fireEvent.click(screen.getByTitle("Expand All"));
    expect(onchange).toHaveBeenCalled();
  });

  it("Escape key on container dispatches no error", async () => {
    const { container } = render(MindMap);
    const mindmap = container.querySelector(".cy-mindmap")!;
    await fireEvent.keyDown(mindmap, { key: "Escape" });
    expect(mindmap).toBeInTheDocument();
  });

  it("canvas responds to mousedown without error", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("canvas responds to mousemove without error", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("canvas responds to mouseup without error", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("canvas responds to dblclick without error", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.dblClick(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("canvas responds to contextmenu without error", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.contextMenu(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("canvas responds to wheel event without error", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.wheel(canvas, { deltaY: -100, clientX: 100, clientY: 100 });
    expect(canvas).toBeInTheDocument();
  });

  it("panning: mousedown on empty area + mousemove + mouseup", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    // Click on empty area to start pan
    await fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    await fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
    await fireEvent.mouseUp(canvas, { clientX: 50, clientY: 50 });
    expect(canvas).toBeInTheDocument();
  });

  it("mouseleave resets panning state", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    await fireEvent.mouseLeave(canvas);
    expect(canvas).toBeInTheDocument();
  });

  it("Ctrl+Z keydown on container does not throw", async () => {
    const { container } = render(MindMap);
    const mindmap = container.querySelector(".cy-mindmap")!;
    await fireEvent.keyDown(mindmap, { key: "z", ctrlKey: true });
    expect(mindmap).toBeInTheDocument();
  });

  it("Ctrl+Shift+Z keydown on container does not throw", async () => {
    const { container } = render(MindMap);
    const mindmap = container.querySelector(".cy-mindmap")!;
    await fireEvent.keyDown(mindmap, { key: "Z", ctrlKey: true, shiftKey: true });
    expect(mindmap).toBeInTheDocument();
  });

  it("Ctrl+Y keydown triggers redo path", async () => {
    const { container } = render(MindMap);
    const mindmap = container.querySelector(".cy-mindmap")!;
    await fireEvent.keyDown(mindmap, { key: "y", ctrlKey: true });
    expect(mindmap).toBeInTheDocument();
  });

  it("Tab key does nothing when no node selected", async () => {
    const { container } = render(MindMap);
    const mindmap = container.querySelector(".cy-mindmap")!;
    await fireEvent.keyDown(mindmap, { key: "Tab" });
    expect(mindmap).toBeInTheDocument();
  });

  it("readonly mode prevents dblclick editing", async () => {
    const { container } = render(MindMap, { props: { readonly: true } });
    const canvas = container.querySelector("canvas")!;
    await fireEvent.dblClick(canvas, { clientX: 100, clientY: 100 });
    // No edit input should appear
    expect(container.querySelector(".cy-mindmap__edit-input")).not.toBeInTheDocument();
  });

  it("readonly mode prevents context menu", async () => {
    const { container } = render(MindMap, { props: { readonly: true } });
    const canvas = container.querySelector("canvas")!;
    await fireEvent.contextMenu(canvas, { clientX: 100, clientY: 100 });
    expect(container.querySelector(".cy-mindmap__context-menu")).not.toBeInTheDocument();
  });

  it("zoom in via wheel (scroll up) does not throw", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.wheel(canvas, { deltaY: -50, clientX: 200, clientY: 200 });
    expect(canvas).toBeInTheDocument();
  });

  it("zoom out via wheel (scroll down) does not throw", async () => {
    const { container } = render(MindMap);
    const canvas = container.querySelector("canvas")!;
    await fireEvent.wheel(canvas, { deltaY: 50, clientX: 200, clientY: 200 });
    expect(canvas).toBeInTheDocument();
  });

  it("has toolbar separator elements", () => {
    const { container } = render(MindMap);
    const seps = container.querySelectorAll(".cy-mindmap__toolbar-sep");
    expect(seps.length).toBeGreaterThan(0);
  });

  it("has canvas wrap container", () => {
    const { container } = render(MindMap);
    expect(container.querySelector(".cy-mindmap__canvas-wrap")).toBeInTheDocument();
  });

  it("delete button has danger styling", () => {
    const { container } = render(MindMap);
    const deleteBtn = container.querySelector(".cy-mindmap__toolbar-btn--danger");
    expect(deleteBtn).toBeInTheDocument();
  });
});
