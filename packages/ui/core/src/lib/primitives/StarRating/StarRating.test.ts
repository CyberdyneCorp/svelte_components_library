import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import StarRating from "./StarRating.svelte";

describe("StarRating", () => {
  it("renders with default props", () => {
    const { container } = render(StarRating);
    const slider = container.querySelector("[role='slider']");
    expect(slider).toBeInTheDocument();
  });

  it("renders correct number of star buttons", () => {
    render(StarRating, { props: { max: 5 } });
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("has correct aria-valuemax", () => {
    const { container } = render(StarRating, { props: { max: 10 } });
    const slider = container.querySelector("[role='slider']");
    expect(slider?.getAttribute("aria-valuemax")).toBe("10");
  });

  it("has correct aria-valuenow", () => {
    const { container } = render(StarRating, { props: { value: 3 } });
    const slider = container.querySelector("[role='slider']");
    expect(slider?.getAttribute("aria-valuenow")).toBe("3");
  });

  it("applies size class", () => {
    const { container } = render(StarRating, { props: { size: "lg" } });
    const wrapper = container.querySelector(".cy-star-rating");
    expect(wrapper?.className).toContain("lg");
  });
});
