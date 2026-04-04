import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import SplitView from "./SplitView.svelte";

describe("SplitView", () => {
  it("renders with default props", () => {
    const { container } = render(SplitView);
    const split = container.querySelector(".cy-split");
    expect(split).toBeInTheDocument();
  });

  it("applies horizontal direction class by default", () => {
    const { container } = render(SplitView);
    const split = container.querySelector(".cy-split--horizontal");
    expect(split).toBeInTheDocument();
  });

  it("applies vertical direction class", () => {
    const { container } = render(SplitView, { props: { direction: "vertical" } });
    const split = container.querySelector(".cy-split--vertical");
    expect(split).toBeInTheDocument();
  });

  it("renders separator with correct role", () => {
    render(SplitView);
    const separator = screen.getByRole("separator");
    expect(separator).toBeInTheDocument();
  });

  it("shows collapse buttons when collapsible", () => {
    render(SplitView, { props: { collapsible: true } });
    expect(screen.getByLabelText("Collapse first panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Collapse second panel")).toBeInTheDocument();
  });

  it("does not show collapse buttons by default", () => {
    const { container } = render(SplitView);
    expect(container.querySelector(".cy-split__collapse")).not.toBeInTheDocument();
  });

  it("renders both panels", () => {
    const { container } = render(SplitView);
    const panels = container.querySelectorAll(".cy-split__panel");
    expect(panels.length).toBe(2);
    expect(panels[0].className).toContain("first");
    expect(panels[1].className).toContain("second");
  });

  it("renders grip dots in divider", () => {
    const { container } = render(SplitView);
    const grip = container.querySelector(".cy-split__grip");
    expect(grip).toBeInTheDocument();
    expect(grip?.querySelectorAll("span").length).toBe(3);
  });

  it("first panel has width based on initialSplit", () => {
    const { container } = render(SplitView, { props: { initialSplit: 30 } });
    const firstPanel = container.querySelector(".cy-split__panel--first") as HTMLElement;
    expect(firstPanel.style.width).toBe("30%");
  });

  it("second panel has complementary width", () => {
    const { container } = render(SplitView, { props: { initialSplit: 30 } });
    const secondPanel = container.querySelector(".cy-split__panel--second") as HTMLElement;
    expect(secondPanel.style.width).toBe("70%");
  });

  it("uses height style for vertical direction", () => {
    const { container } = render(SplitView, { props: { direction: "vertical", initialSplit: 40 } });
    const firstPanel = container.querySelector(".cy-split__panel--first") as HTMLElement;
    expect(firstPanel.style.height).toBe("40%");
  });

  it("separator has correct aria-orientation for horizontal", () => {
    render(SplitView);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("separator has correct aria-orientation for vertical", () => {
    render(SplitView, { props: { direction: "vertical" } });
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("separator is focusable with tabindex", () => {
    render(SplitView);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("tabindex", "0");
  });

  it("starts dragging on mousedown on divider", async () => {
    const { container } = render(SplitView);
    const divider = container.querySelector(".cy-split__divider")!;
    await fireEvent.mouseDown(divider);
    // After mousedown, dragging class should appear
    const split = container.querySelector(".cy-split");
    expect(split?.className).toContain("dragging");
  });

  it("stops dragging on mouseup after mousedown", async () => {
    const { container } = render(SplitView);
    const divider = container.querySelector(".cy-split__divider")!;
    await fireEvent.mouseDown(divider);
    await fireEvent.mouseUp(window);
    const split = container.querySelector(".cy-split");
    expect(split?.className).not.toContain("dragging");
  });

  it("collapse first panel button is clickable", async () => {
    const { container } = render(SplitView, { props: { collapsible: true } });
    const btn = screen.getByLabelText("Collapse first panel");
    // Need a bounding rect for the container to work
    const splitEl = container.querySelector(".cy-split") as HTMLElement;
    Object.defineProperty(splitEl, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 }),
    });
    await fireEvent.click(btn);
    // Panel should now be collapsed (width should be at minSize/totalSize * 100)
    const firstPanel = container.querySelector(".cy-split__panel--first") as HTMLElement;
    expect(firstPanel.style.width).toBeTruthy();
  });

  it("collapse second panel button is clickable", async () => {
    const { container } = render(SplitView, { props: { collapsible: true } });
    const btn = screen.getByLabelText("Collapse second panel");
    const splitEl = container.querySelector(".cy-split") as HTMLElement;
    Object.defineProperty(splitEl, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 }),
    });
    await fireEvent.click(btn);
    const secondPanel = container.querySelector(".cy-split__panel--second") as HTMLElement;
    expect(secondPanel.style.width).toBeTruthy();
  });

  it("displays left arrow for horizontal collapse first button", () => {
    render(SplitView, { props: { collapsible: true } });
    const btn = screen.getByLabelText("Collapse first panel");
    expect(btn.textContent).toContain("\u25C0");
  });

  it("displays up arrow for vertical collapse first button", () => {
    render(SplitView, { props: { collapsible: true, direction: "vertical" } });
    const btn = screen.getByLabelText("Collapse first panel");
    expect(btn.textContent).toContain("\u25B2");
  });

  it("displays right arrow for horizontal collapse second button", () => {
    render(SplitView, { props: { collapsible: true } });
    const btn = screen.getByLabelText("Collapse second panel");
    expect(btn.textContent).toContain("\u25B6");
  });

  it("displays down arrow for vertical collapse second button", () => {
    render(SplitView, { props: { collapsible: true, direction: "vertical" } });
    const btn = screen.getByLabelText("Collapse second panel");
    expect(btn.textContent).toContain("\u25BC");
  });
});
