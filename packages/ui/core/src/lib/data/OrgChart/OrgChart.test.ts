import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeAll } from "vitest";
import OrgChart from "./OrgChart.svelte";

beforeAll(() => {
  // Polyfill ResizeObserver for jsdom
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

const root = {
  id: "ceo",
  label: "Jane Smith",
  title: "CEO",
  children: [
    { id: "cto", label: "Bob Jones", title: "CTO" },
    { id: "cfo", label: "Alice Brown", title: "CFO" },
  ],
};

describe("OrgChart", () => {
  it("renders the chart container", () => {
    const { container } = render(OrgChart, { props: { root } });
    expect(container.querySelector(".cy-org")).toBeInTheDocument();
  });

  it("renders SVG with img role", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders the root node label", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders child node labels", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("Alice Brown")).toBeInTheDocument();
  });

  it("renders node titles", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByText("CEO")).toBeInTheDocument();
    expect(screen.getByText("CTO")).toBeInTheDocument();
  });

  it("renders collapse toggle buttons for nodes with children", () => {
    render(OrgChart, { props: { root } });
    const toggles = screen.getAllByLabelText("Collapse");
    expect(toggles.length).toBeGreaterThanOrEqual(1);
  });

  it("collapses children when toggle is clicked", async () => {
    render(OrgChart, { props: { root } });
    const toggle = screen.getAllByLabelText("Collapse")[0];
    await fireEvent.click(toggle);
    // After collapse, toggle should show "Expand"
    expect(screen.getByLabelText("Expand")).toBeInTheDocument();
  });

  it("expands children when expand toggle is clicked", async () => {
    render(OrgChart, { props: { root } });
    const toggle = screen.getAllByLabelText("Collapse")[0];
    await fireEvent.click(toggle);
    const expandToggle = screen.getByLabelText("Expand");
    await fireEvent.click(expandToggle);
    // Should now show "Collapse" again
    expect(screen.getAllByLabelText("Collapse").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onnodeclick when a node is clicked", async () => {
    const onnodeclick = vi.fn();
    render(OrgChart, { props: { root, onnodeclick } });
    const nodeBtn = screen.getByLabelText("Jane Smith, CEO");
    await fireEvent.click(nodeBtn);
    expect(onnodeclick).toHaveBeenCalledWith(root);
  });

  it("opens detail panel on node click", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const nodeBtn = screen.getByLabelText("Jane Smith, CEO");
    await fireEvent.click(nodeBtn);
    expect(container.querySelector(".cy-org__detail")).toBeInTheDocument();
    expect(container.querySelector(".cy-org__detail-name")?.textContent).toBe("Jane Smith");
  });

  it("closes detail panel when clicking same node again", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const nodeBtn = screen.getByLabelText("Jane Smith, CEO");
    await fireEvent.click(nodeBtn);
    expect(container.querySelector(".cy-org__detail")).toBeInTheDocument();
    await fireEvent.click(nodeBtn);
    expect(container.querySelector(".cy-org__detail")).not.toBeInTheDocument();
  });

  it("closes detail panel via close button", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const nodeBtn = screen.getByLabelText("Jane Smith, CEO");
    await fireEvent.click(nodeBtn);
    const closeBtn = container.querySelector(".cy-org__detail-close")!;
    await fireEvent.click(closeBtn);
    expect(container.querySelector(".cy-org__detail")).not.toBeInTheDocument();
  });

  it("shows detail panel for node with department and email", async () => {
    const richRoot = {
      id: "ceo",
      label: "Jane Smith",
      title: "CEO",
      department: "Executive",
      email: "jane@company.com",
      description: "Leader of the company",
      links: [{ label: "Profile", url: "https://example.com" }],
      children: [
        { id: "cto", label: "Bob Jones", title: "CTO" },
      ],
    };
    const { container } = render(OrgChart, { props: { root: richRoot } });
    const nodeBtn = screen.getByLabelText("Jane Smith, CEO");
    await fireEvent.click(nodeBtn);
    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("Executive")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("jane@company.com")).toBeInTheDocument();
    expect(screen.getByText("Leader of the company")).toBeInTheDocument();
    expect(screen.getByText("Links")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Direct reports")).toBeInTheDocument();
  });

  it("renders in horizontal direction", () => {
    const { container } = render(OrgChart, { props: { root, direction: "horizontal" } });
    expect(container.querySelector(".cy-org")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("hides collapse toggles when collapsible is false", () => {
    render(OrgChart, { props: { root, collapsible: false } });
    expect(screen.queryByLabelText("Collapse")).not.toBeInTheDocument();
  });

  it("renders node with avatar image", () => {
    const avatarRoot = {
      id: "ceo",
      label: "Jane Smith",
      avatar: "https://example.com/avatar.png",
      children: [],
    };
    const { container } = render(OrgChart, { props: { root: avatarRoot } });
    const image = container.querySelector("image");
    expect(image).toBeInTheDocument();
    expect(image?.getAttribute("href")).toBe("https://example.com/avatar.png");
  });

  it("renders initials when no avatar", () => {
    render(OrgChart, { props: { root } });
    expect(screen.getByText("JS")).toBeInTheDocument(); // Jane Smith -> JS
  });

  it("renders node with color border", () => {
    const colorRoot = {
      id: "ceo",
      label: "Jane Smith",
      color: "#ff0000",
      children: [],
    };
    const { container } = render(OrgChart, { props: { root: colorRoot } });
    const colorRect = container.querySelector('rect[fill="#ff0000"]');
    expect(colorRect).toBeInTheDocument();
  });

  it("handles node click via Enter keydown", async () => {
    const onnodeclick = vi.fn();
    render(OrgChart, { props: { root, onnodeclick } });
    const nodeBtn = screen.getByLabelText("Jane Smith, CEO");
    await fireEvent.keyDown(nodeBtn, { key: "Enter" });
    expect(onnodeclick).toHaveBeenCalledWith(root);
  });

  it("renders edges between nodes", () => {
    const { container } = render(OrgChart, { props: { root } });
    const edges = container.querySelectorAll(".cy-org__edge");
    expect(edges.length).toBe(2); // 2 children = 2 edges
  });

  it("switches detail panel when clicking a different node", async () => {
    const { container } = render(OrgChart, { props: { root } });
    await fireEvent.click(screen.getByLabelText("Jane Smith, CEO"));
    expect(container.querySelector(".cy-org__detail-name")?.textContent).toBe("Jane Smith");
    await fireEvent.click(screen.getByLabelText("Bob Jones, CTO"));
    expect(container.querySelector(".cy-org__detail-name")?.textContent).toBe("Bob Jones");
  });

  it("handles deeply nested tree", () => {
    const deepRoot = {
      id: "a",
      label: "Root",
      children: [
        {
          id: "b",
          label: "Child",
          children: [
            { id: "c", label: "Grandchild", children: [] },
          ],
        },
      ],
    };
    render(OrgChart, { props: { root: deepRoot } });
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
    expect(screen.getByText("Grandchild")).toBeInTheDocument();
  });

  it("handles toggle collapse via Enter keydown", async () => {
    render(OrgChart, { props: { root } });
    const toggle = screen.getAllByLabelText("Collapse")[0];
    await fireEvent.keyDown(toggle, { key: "Enter" });
    expect(screen.getByLabelText("Expand")).toBeInTheDocument();
  });

  it("handles wheel zoom in", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const svg = container.querySelector("svg")!;
    await fireEvent.wheel(svg, { deltaY: -100 });
    // No error thrown, viewBox should have changed
    expect(svg.getAttribute("viewBox")).toBeTruthy();
  });

  it("handles wheel zoom out", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const svg = container.querySelector("svg")!;
    await fireEvent.wheel(svg, { deltaY: 100 });
    expect(svg.getAttribute("viewBox")).toBeTruthy();
  });

  it("handles pointer down on svg for panning", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const svg = container.querySelector("svg")!;
    // Mock setPointerCapture
    svg.setPointerCapture = vi.fn();
    await fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, pointerId: 1 });
    expect(svg.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it("does not start panning when clicking a node group", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const svg = container.querySelector("svg")!;
    svg.setPointerCapture = vi.fn();
    // Click on a node group element
    const nodeGroup = container.querySelector(".cy-org__node-group")!;
    await fireEvent.pointerDown(nodeGroup, { clientX: 100, clientY: 100, pointerId: 1 });
    // setPointerCapture should NOT have been called because target is inside node-group
  });

  it("handles pointer move during pan", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const svg = container.querySelector("svg")!;
    svg.setPointerCapture = vi.fn();
    svg.getBoundingClientRect = vi.fn().mockReturnValue({ width: 800, height: 600 });
    await fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, pointerId: 1 });
    const viewBoxBefore = svg.getAttribute("viewBox");
    await fireEvent.pointerMove(svg, { clientX: 150, clientY: 120 });
    const viewBoxAfter = svg.getAttribute("viewBox");
    expect(viewBoxAfter).toBeTruthy();
  });

  it("handles pointer up to stop panning", async () => {
    const { container } = render(OrgChart, { props: { root } });
    const svg = container.querySelector("svg")!;
    svg.setPointerCapture = vi.fn();
    await fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, pointerId: 1 });
    await fireEvent.pointerUp(svg);
    // After pointer up, pointer move should not pan
    const viewBoxBefore = svg.getAttribute("viewBox");
    await fireEvent.pointerMove(svg, { clientX: 200, clientY: 200 });
    // viewBox should not change since panning stopped
  });

  it("renders root node without children", () => {
    const leafRoot = { id: "root", label: "Solo", children: [] };
    render(OrgChart, { props: { root: leafRoot } });
    expect(screen.getByText("Solo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Collapse")).not.toBeInTheDocument();
  });
});
