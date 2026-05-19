import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import FlowCanvasControls from "./FlowCanvasControls.svelte";

describe("FlowCanvasControls", () => {
  it("renders four buttons", () => {
    const { container } = render(FlowCanvasControls);
    expect(container.querySelectorAll(".cy-flow-canvas-controls__btn").length).toBe(4);
  });

  it("invokes onzoomin when + clicked", async () => {
    const onzoomin = vi.fn();
    const { getByTitle } = render(FlowCanvasControls, { props: { onzoomin } });
    await fireEvent.click(getByTitle("Zoom in"));
    expect(onzoomin).toHaveBeenCalled();
  });

  it("invokes onfit when fit clicked", async () => {
    const onfit = vi.fn();
    const { getByTitle } = render(FlowCanvasControls, { props: { onfit } });
    await fireEvent.click(getByTitle("Fit to nodes"));
    expect(onfit).toHaveBeenCalled();
  });

  it("applies horizontal orientation class", () => {
    const { container } = render(FlowCanvasControls, {
      props: { orientation: "horizontal" },
    });
    const el = container.querySelector(".cy-flow-canvas-controls");
    expect(el?.className).toContain("horizontal");
  });
});
