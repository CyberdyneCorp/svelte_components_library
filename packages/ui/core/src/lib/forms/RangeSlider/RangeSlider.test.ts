import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import RangeSlider from "./RangeSlider.svelte";

describe("RangeSlider", () => {
  it("renders with default props", () => {
    const { container } = render(RangeSlider);
    const sliders = container.querySelectorAll("[role='slider']");
    expect(sliders.length).toBe(2);
  });

  it("has correct aria-label on thumbs", () => {
    const { container } = render(RangeSlider);
    const low = container.querySelector("[aria-label='Low value']");
    const high = container.querySelector("[aria-label='High value']");
    expect(low).toBeInTheDocument();
    expect(high).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    const { container } = render(RangeSlider, { props: { label: "Price range" } });
    expect(container.textContent).toContain("Price range");
  });

  it("shows values by default", () => {
    const { container } = render(RangeSlider, { props: { low: 10, high: 90 } });
    expect(container.textContent).toContain("10");
    expect(container.textContent).toContain("90");
  });
});
