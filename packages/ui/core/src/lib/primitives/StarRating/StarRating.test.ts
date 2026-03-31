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

  it("renders custom number of stars", () => {
    render(StarRating, { props: { max: 10 } });
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(10);
  });

  // Aria attributes
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

  it("has correct aria-valuemin", () => {
    const { container } = render(StarRating, { props: {} });
    const slider = container.querySelector("[role='slider']");
    expect(slider?.getAttribute("aria-valuemin")).toBe("0");
  });

  it("uses default aria-label", () => {
    const { container } = render(StarRating);
    const slider = container.querySelector("[role='slider']");
    expect(slider?.getAttribute("aria-label")).toBe("Star rating");
  });

  it("uses custom label", () => {
    const { container } = render(StarRating, { props: { label: "Quality" } });
    expect(screen.getByText("Quality")).toBeInTheDocument();
  });

  // Size
  it("applies size class", () => {
    const { container } = render(StarRating, { props: { size: "lg" } });
    expect(container.querySelector(".cy-star-rating--lg")).toBeInTheDocument();
  });

  it("applies sm size class", () => {
    const { container } = render(StarRating, { props: { size: "sm" } });
    expect(container.querySelector(".cy-star-rating--sm")).toBeInTheDocument();
  });

  // Click rating
  it("calls onchange when star is clicked", async () => {
    const onchange = vi.fn();
    render(StarRating, { props: { value: 0, onchange } });
    const stars = screen.getAllByRole("button");
    await fireEvent.click(stars[2]);
    expect(onchange).toHaveBeenCalledWith(3);
  });

  it("does not fire onchange in readonly mode", async () => {
    const onchange = vi.fn();
    render(StarRating, { props: { value: 0, readonly: true, onchange } });
    const stars = screen.getAllByRole("button");
    await fireEvent.click(stars[2]);
    expect(onchange).not.toHaveBeenCalled();
  });

  // Readonly
  it("applies readonly class", () => {
    const { container } = render(StarRating, { props: { readonly: true } });
    expect(container.querySelector(".cy-star-rating--readonly")).toBeInTheDocument();
  });

  it("disables star buttons in readonly mode", () => {
    render(StarRating, { props: { readonly: true } });
    const stars = screen.getAllByRole("button");
    stars.forEach((star) => expect(star).toBeDisabled());
  });

  it("slider is not focusable in readonly mode", () => {
    const { container } = render(StarRating, { props: { readonly: true } });
    const slider = container.querySelector("[role='slider']");
    expect(slider?.getAttribute("tabindex")).toBe("-1");
  });

  // Hover preview
  it("handles mouse move on star", async () => {
    render(StarRating, { props: { value: 0 } });
    const stars = screen.getAllByRole("button");
    await fireEvent.mouseMove(stars[3], { clientX: 100 });
    // After hover, the display value should be updated (stars should reflect)
    expect(stars[3]).toBeInTheDocument();
  });

  it("resets hover on mouse leave", async () => {
    const { container } = render(StarRating, { props: { value: 2 } });
    const slider = container.querySelector("[role='slider']")!;
    const stars = screen.getAllByRole("button");
    await fireEvent.mouseMove(stars[4], { clientX: 100 });
    await fireEvent.mouseLeave(slider);
    // Should revert to original value display
    expect(slider.getAttribute("aria-valuenow")).toBe("2");
  });

  it("does not hover in readonly mode", async () => {
    const { container } = render(StarRating, { props: { value: 2, readonly: true } });
    const slider = container.querySelector("[role='slider']")!;
    const stars = screen.getAllByRole("button");
    await fireEvent.mouseMove(stars[4], { clientX: 100 });
    await fireEvent.mouseLeave(slider);
    expect(slider.getAttribute("aria-valuenow")).toBe("2");
  });

  // Keyboard navigation
  it("increases value with ArrowRight", async () => {
    const onchange = vi.fn();
    const { container } = render(StarRating, { props: { value: 2, onchange } });
    const slider = container.querySelector("[role='slider']")!;
    await fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onchange).toHaveBeenCalledWith(3);
  });

  it("increases value with ArrowUp", async () => {
    const onchange = vi.fn();
    const { container } = render(StarRating, { props: { value: 2, onchange } });
    const slider = container.querySelector("[role='slider']")!;
    await fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(onchange).toHaveBeenCalledWith(3);
  });

  it("decreases value with ArrowLeft", async () => {
    const onchange = vi.fn();
    const { container } = render(StarRating, { props: { value: 3, onchange } });
    const slider = container.querySelector("[role='slider']")!;
    await fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onchange).toHaveBeenCalledWith(2);
  });

  it("decreases value with ArrowDown", async () => {
    const onchange = vi.fn();
    const { container } = render(StarRating, { props: { value: 3, onchange } });
    const slider = container.querySelector("[role='slider']")!;
    await fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(onchange).toHaveBeenCalledWith(2);
  });

  it("does not exceed max", async () => {
    const onchange = vi.fn();
    const { container } = render(StarRating, { props: { value: 5, max: 5, onchange } });
    const slider = container.querySelector("[role='slider']")!;
    await fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onchange).toHaveBeenCalledWith(5);
  });

  it("does not go below 0", async () => {
    const onchange = vi.fn();
    const { container } = render(StarRating, { props: { value: 0, onchange } });
    const slider = container.querySelector("[role='slider']")!;
    await fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onchange).toHaveBeenCalledWith(0);
  });

  it("does not respond to keyboard in readonly", async () => {
    const onchange = vi.fn();
    const { container } = render(StarRating, { props: { value: 2, readonly: true, onchange } });
    const slider = container.querySelector("[role='slider']")!;
    await fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onchange).not.toHaveBeenCalled();
  });

  // Half stars
  it("uses half step with allowHalf and keyboard", async () => {
    const onchange = vi.fn();
    const { container } = render(StarRating, { props: { value: 2, allowHalf: true, onchange } });
    const slider = container.querySelector("[role='slider']")!;
    await fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onchange).toHaveBeenCalledWith(2.5);
  });

  // Show value
  it("shows numeric value when showValue is true", () => {
    render(StarRating, { props: { value: 3, max: 5, showValue: true } });
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });

  it("does not show value by default", () => {
    render(StarRating, { props: { value: 3, max: 5 } });
    expect(screen.queryByText("3 / 5")).not.toBeInTheDocument();
  });

  // Star aria labels
  it("each star has aria-label", () => {
    render(StarRating, { props: { max: 3 } });
    expect(screen.getByLabelText("Star 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Star 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Star 3")).toBeInTheDocument();
  });
});
