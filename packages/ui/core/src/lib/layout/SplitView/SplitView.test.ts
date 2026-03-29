import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
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
});
