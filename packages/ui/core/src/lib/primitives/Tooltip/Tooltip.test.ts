import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Tooltip from "./Tooltip.svelte";

describe("Tooltip", () => {
  it("renders with default props", () => {
    const { container } = render(Tooltip, { props: { text: "Hint" } });
    const wrapper = container.querySelector(".cy-tooltip-wrapper");
    expect(wrapper).toBeInTheDocument();
  });

  it("does not show tooltip by default", () => {
    const { container } = render(Tooltip, { props: { text: "Hint" } });
    const tooltip = container.querySelector("[role='tooltip']");
    expect(tooltip).not.toBeInTheDocument();
  });

  it("shows tooltip on mouseenter", async () => {
    const { container } = render(Tooltip, { props: { text: "Hint text" } });
    const wrapper = container.querySelector(".cy-tooltip-wrapper")!;
    await fireEvent.mouseEnter(wrapper);
    const tooltip = container.querySelector("[role='tooltip']");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toContain("Hint text");
  });

  it("hides tooltip on mouseleave", async () => {
    const { container } = render(Tooltip, { props: { text: "Hint" } });
    const wrapper = container.querySelector(".cy-tooltip-wrapper")!;
    await fireEvent.mouseEnter(wrapper);
    await fireEvent.mouseLeave(wrapper);
    const tooltip = container.querySelector("[role='tooltip']");
    expect(tooltip).not.toBeInTheDocument();
  });
});
