import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import PixelTooltip from "./PixelTooltip.svelte";

const trigger = createRawSnippet(() => ({ render: () => `<button>trigger</button>` }));

describe("PixelTooltip", () => {
  it("hides tooltip by default", () => {
    render(PixelTooltip, { props: { text: "Help", children: trigger } });
    expect(screen.queryByTestId("cy-ptip")).not.toBeInTheDocument();
  });
  it("shows tooltip on mouseenter", async () => {
    const { container } = render(PixelTooltip, { props: { text: "Help", children: trigger } });
    await fireEvent.mouseEnter(container.querySelector(".cy-ptip")!);
    expect(screen.getByTestId("cy-ptip")).toHaveTextContent("Help");
  });
  it("hides tooltip on mouseleave", async () => {
    const { container } = render(PixelTooltip, { props: { text: "Help", children: trigger } });
    const root = container.querySelector(".cy-ptip")!;
    await fireEvent.mouseEnter(root);
    await fireEvent.mouseLeave(root);
    expect(screen.queryByTestId("cy-ptip")).not.toBeInTheDocument();
  });
  it("shows on focus", async () => {
    const { container } = render(PixelTooltip, { props: { text: "Help", children: trigger } });
    await fireEvent.focusIn(container.querySelector(".cy-ptip")!);
    expect(screen.getByTestId("cy-ptip")).toBeInTheDocument();
  });
  it("controlled open=true always shows", () => {
    render(PixelTooltip, { props: { text: "Always", open: true, children: trigger } });
    expect(screen.getByTestId("cy-ptip")).toBeInTheDocument();
  });
  it("controlled open=false never shows on hover", async () => {
    const { container } = render(PixelTooltip, { props: { text: "X", open: false, children: trigger } });
    await fireEvent.mouseEnter(container.querySelector(".cy-ptip")!);
    expect(screen.queryByTestId("cy-ptip")).not.toBeInTheDocument();
  });
  it.each(["top", "bottom", "left", "right"] as const)("applies %s position class", (position) => {
    render(PixelTooltip, { props: { text: "x", position, open: true, children: trigger } });
    expect(screen.getByTestId("cy-ptip")).toHaveClass(`cy-ptip__box--${position}`);
  });
  it("tooltip has role", () => {
    render(PixelTooltip, { props: { text: "Help", open: true, children: trigger } });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
