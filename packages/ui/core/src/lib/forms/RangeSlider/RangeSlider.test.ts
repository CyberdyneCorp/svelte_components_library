import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import RangeSlider from "./RangeSlider.svelte";

describe("RangeSlider", () => {
  it("renders with default props", () => {
    const { container } = render(RangeSlider);
    const sliders = container.querySelectorAll("[role='slider']");
    expect(sliders.length).toBe(2);
  });

  it("has correct aria-label on thumbs", () => {
    const { container } = render(RangeSlider);
    expect(container.querySelector("[aria-label='Low value']")).toBeInTheDocument();
    expect(container.querySelector("[aria-label='High value']")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(RangeSlider, { props: { label: "Price range" } });
    expect(screen.getByText("Price range")).toBeInTheDocument();
  });

  it("does not render label when empty", () => {
    const { container } = render(RangeSlider, { props: { label: "" } });
    expect(container.querySelector(".cy-rs__label")).not.toBeInTheDocument();
  });

  it("shows values by default", () => {
    const { container } = render(RangeSlider, { props: { low: 10, high: 90 } });
    expect(container.textContent).toContain("10");
    expect(container.textContent).toContain("90");
  });

  it("hides values when showValues is false", () => {
    const { container } = render(RangeSlider, {
      props: { low: 10, high: 90, showValues: false },
    });
    expect(container.querySelector(".cy-rs__range-text")).not.toBeInTheDocument();
    expect(container.querySelector(".cy-rs__thumb-label")).not.toBeInTheDocument();
  });

  it("shows range text without label when showValues is true and no label", () => {
    const { container } = render(RangeSlider, {
      props: { low: 25, high: 75, showValues: true },
    });
    expect(container.querySelector(".cy-rs__range-text")).toBeInTheDocument();
  });

  it("applies disabled class", () => {
    const { container } = render(RangeSlider, { props: { disabled: true } });
    expect(container.querySelector(".cy-rs--disabled")).toBeInTheDocument();
  });

  it("sets tabindex to -1 when disabled", () => {
    const { container } = render(RangeSlider, { props: { disabled: true } });
    const sliders = container.querySelectorAll("[role='slider']");
    sliders.forEach((s) => expect(s.getAttribute("tabindex")).toBe("-1"));
  });

  it("sets tabindex to 0 when not disabled", () => {
    const { container } = render(RangeSlider, { props: { disabled: false } });
    const sliders = container.querySelectorAll("[role='slider']");
    sliders.forEach((s) => expect(s.getAttribute("tabindex")).toBe("0"));
  });

  it("sets correct aria-valuemin, aria-valuemax, aria-valuenow on low thumb", () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, low: 20, high: 80 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    expect(low.getAttribute("aria-valuemin")).toBe("0");
    expect(low.getAttribute("aria-valuemax")).toBe("80");
    expect(low.getAttribute("aria-valuenow")).toBe("20");
  });

  it("sets correct aria-valuemin, aria-valuemax, aria-valuenow on high thumb", () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, low: 20, high: 80 },
    });
    const high = container.querySelector("[aria-label='High value']")!;
    expect(high.getAttribute("aria-valuemin")).toBe("20");
    expect(high.getAttribute("aria-valuemax")).toBe("100");
    expect(high.getAttribute("aria-valuenow")).toBe("80");
  });

  it("formats value with unit", () => {
    const { container } = render(RangeSlider, {
      props: { low: 10, high: 90, unit: "%" },
    });
    expect(container.textContent).toContain("10%");
    expect(container.textContent).toContain("90%");
  });

  it("increments low value on ArrowRight key", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, step: 5 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(low.getAttribute("aria-valuenow")).toBe("25");
  });

  it("increments low value on ArrowUp key", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, step: 5 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.keyDown(low, { key: "ArrowUp" });
    expect(low.getAttribute("aria-valuenow")).toBe("25");
  });

  it("decrements low value on ArrowLeft key", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, step: 5 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.keyDown(low, { key: "ArrowLeft" });
    expect(low.getAttribute("aria-valuenow")).toBe("15");
  });

  it("decrements low value on ArrowDown key", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, step: 5 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.keyDown(low, { key: "ArrowDown" });
    expect(low.getAttribute("aria-valuenow")).toBe("15");
  });

  it("increments high value on ArrowRight key", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, step: 5 },
    });
    const high = container.querySelector("[aria-label='High value']")!;
    await fireEvent.keyDown(high, { key: "ArrowRight" });
    expect(high.getAttribute("aria-valuenow")).toBe("85");
  });

  it("decrements high value on ArrowLeft key", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, step: 5 },
    });
    const high = container.querySelector("[aria-label='High value']")!;
    await fireEvent.keyDown(high, { key: "ArrowLeft" });
    expect(high.getAttribute("aria-valuenow")).toBe("75");
  });

  it("low value does not exceed high value via keyboard", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 78, high: 80, step: 5 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.keyDown(low, { key: "ArrowRight" });
    const newVal = parseInt(low.getAttribute("aria-valuenow")!);
    expect(newVal).toBeLessThanOrEqual(80);
  });

  it("high value does not go below low value via keyboard", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 22, step: 5 },
    });
    const high = container.querySelector("[aria-label='High value']")!;
    await fireEvent.keyDown(high, { key: "ArrowLeft" });
    const newVal = parseInt(high.getAttribute("aria-valuenow")!);
    expect(newVal).toBeGreaterThanOrEqual(20);
  });

  it("clamps low to min value", async () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, low: 2, high: 80, step: 5 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.keyDown(low, { key: "ArrowLeft" });
    const newVal = parseInt(low.getAttribute("aria-valuenow")!);
    expect(newVal).toBeGreaterThanOrEqual(0);
  });

  it("clamps high to max value", async () => {
    const { container } = render(RangeSlider, {
      props: { max: 100, low: 20, high: 98, step: 5 },
    });
    const high = container.querySelector("[aria-label='High value']")!;
    await fireEvent.keyDown(high, { key: "ArrowRight" });
    const newVal = parseInt(high.getAttribute("aria-valuenow")!);
    expect(newVal).toBeLessThanOrEqual(100);
  });

  it("does not change values on keyboard when disabled", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, step: 5, disabled: true },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(low.getAttribute("aria-valuenow")).toBe("20");
  });

  it("renders fill bar with correct positioning", () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, low: 20, high: 80 },
    });
    const fill = container.querySelector(".cy-rs__fill") as HTMLElement;
    expect(fill.style.left).toBe("20%");
    expect(fill.style.width).toBe("60%");
  });

  it("positions low thumb correctly", () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, low: 50, high: 80 },
    });
    const low = container.querySelector("[aria-label='Low value']") as HTMLElement;
    expect(low.style.left).toBe("50%");
  });

  it("positions high thumb correctly", () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, low: 20, high: 75 },
    });
    const high = container.querySelector("[aria-label='High value']") as HTMLElement;
    expect(high.style.left).toBe("75%");
  });

  it("ignores non-arrow keys", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, step: 5 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.keyDown(low, { key: "a" });
    expect(low.getAttribute("aria-valuenow")).toBe("20");
  });

  it("shows thumb labels when showValues is true", () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80, showValues: true },
    });
    const labels = container.querySelectorAll(".cy-rs__thumb-label");
    expect(labels.length).toBe(2);
  });

  it("starts drag on mousedown on low thumb", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80 },
    });
    const low = container.querySelector("[aria-label='Low value']")!;
    await fireEvent.mouseDown(low);
    // Drag started - test that mouseup cleans up
    await fireEvent.mouseUp(document);
  });

  it("starts drag on mousedown on high thumb", async () => {
    const { container } = render(RangeSlider, {
      props: { low: 20, high: 80 },
    });
    const high = container.querySelector("[aria-label='High value']")!;
    await fireEvent.mouseDown(high);
    await fireEvent.mouseUp(document);
  });

  it("handles track click", async () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, low: 20, high: 80 },
    });
    const track = container.querySelector(".cy-rs__track-container")!;
    await fireEvent.click(track);
    // This exercises the handleTrackClick path
  });

  it("ignores track click when disabled", async () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, low: 20, high: 80, disabled: true },
    });
    const track = container.querySelector(".cy-rs__track-container")!;
    await fireEvent.click(track);
    const low = container.querySelector("[aria-label='Low value']")!;
    expect(low.getAttribute("aria-valuenow")).toBe("20");
  });
});
