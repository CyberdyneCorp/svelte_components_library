import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import PixelScrollArea from "./PixelScrollArea.svelte";

describe("PixelScrollArea", () => {
  it("renders region", () => {
    render(PixelScrollArea);
    expect(screen.getByRole("region")).toBeInTheDocument();
  });
  it("applies aria-label", () => {
    render(PixelScrollArea, { props: { ariaLabel: "Content" } });
    expect(screen.getByRole("region", { name: "Content" })).toBeInTheDocument();
  });
  it.each(["vertical", "horizontal", "both"] as const)("applies %s axis class", (axis) => {
    const { container } = render(PixelScrollArea, { props: { axis } });
    expect(container.querySelector(`.cy-pscroll--${axis}`)).toBeInTheDocument();
  });
  it("applies maxHeight inline style", () => {
    const { container } = render(PixelScrollArea, { props: { maxHeight: "300px" } });
    const el = container.querySelector<HTMLElement>(".cy-pscroll")!;
    expect(el.style.maxHeight).toBe("300px");
  });
  it("is focusable via tabindex=0", () => {
    const { container } = render(PixelScrollArea);
    expect(container.querySelector<HTMLElement>(".cy-pscroll")!).toHaveAttribute("tabindex", "0");
  });
  it("renders children", () => {
    render(PixelScrollArea, {
      props: { children: createRawSnippet(() => ({ render: () => `<p>inner</p>` })) },
    });
    expect(screen.getByText("inner")).toBeInTheDocument();
  });
});
