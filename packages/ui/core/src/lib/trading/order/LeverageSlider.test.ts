import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import LeverageSlider from "./LeverageSlider.svelte";
import { clampLeverage, defaultMarks, leverageAfterKey } from "./leverage.js";

function slider(): HTMLInputElement {
  return screen.getByRole("slider") as HTMLInputElement;
}

describe("leverage helpers", () => {
  it.each([
    [50, [1, 10, 20, 25, 50]],
    [100, [1, 25, 50, 75, 100]],
    [20, [1, 3, 5, 10, 20]],
    [3, [1, 2, 3]],
    [1, [1]],
  ])("defaultMarks(%d) → %o", (max, marks) => {
    expect(defaultMarks(max)).toEqual(marks);
  });

  it("clamps to whole leverage in 1…max", () => {
    expect(clampLeverage(0, 50)).toBe(1);
    expect(clampLeverage(60, 50)).toBe(50);
    expect(clampLeverage(12.4, 50)).toBe(12);
    expect(clampLeverage(Number.NaN, 50)).toBe(1);
  });

  it.each([
    ["ArrowRight", 10, 11],
    ["ArrowUp", 10, 11],
    ["ArrowLeft", 10, 9],
    ["ArrowDown", 1, 1],
    ["PageUp", 45, 50],
    ["PageDown", 15, 5],
    ["Home", 30, 1],
    ["End", 3, 50],
    ["a", 10, null],
  ])("%s from %d → %s", (key, value, expected) => {
    expect(leverageAfterKey(key, value, 50)).toBe(expected);
  });
});

describe("LeverageSlider", () => {
  it("spec scenario: → twice from 10× reaches 12× with value text 12×", async () => {
    const onchange = vi.fn();
    render(LeverageSlider, { props: { value: 10, max: 50, onchange } });
    const range = slider();
    range.focus();
    await fireEvent.keyDown(range, { key: "ArrowRight" });
    await fireEvent.keyDown(range, { key: "ArrowRight" });
    expect(range.value).toBe("12");
    expect(range).toHaveAttribute("aria-valuetext", "12×");
    expect(onchange).toHaveBeenLastCalledWith(12);
    expect(screen.getByRole("spinbutton", { name: "Leverage value" })).toHaveValue(12);
  });

  it("is a labelled range input from 1 to max", () => {
    render(LeverageSlider, { props: { value: 20, max: 50 } });
    const range = slider();
    expect(range).toHaveAccessibleName("Leverage");
    expect(range).toHaveAttribute("type", "range");
    expect(range).toHaveAttribute("min", "1");
    expect(range).toHaveAttribute("max", "50");
    expect(range).toHaveAttribute("aria-valuetext", "20×");
  });

  it("supports Home / End / PageUp / PageDown and ignores other keys", async () => {
    render(LeverageSlider, { props: { value: 10, max: 50 } });
    const range = slider();
    await fireEvent.keyDown(range, { key: "End" });
    expect(range.value).toBe("50");
    await fireEvent.keyDown(range, { key: "PageDown" });
    expect(range.value).toBe("40");
    await fireEvent.keyDown(range, { key: "Home" });
    expect(range.value).toBe("1");
    await fireEvent.keyDown(range, { key: "Tab" });
    expect(range.value).toBe("1");
  });

  it("syncs the numeric input with the range, clamping to max", async () => {
    render(LeverageSlider, { props: { value: 10, max: 50 } });
    const number = screen.getByRole("spinbutton", { name: "Leverage value" }) as HTMLInputElement;
    await fireEvent.change(number, { target: { value: "75" } });
    expect(slider().value).toBe("50");
    expect(number.value).toBe("50");
    await fireEvent.change(number, { target: { value: "" } });
    expect(number.value).toBe("50");
    await fireEvent.input(slider(), { target: { value: "7" } });
    expect(number.value).toBe("7");
  });

  it("sets the value from a mark", async () => {
    const onchange = vi.fn();
    render(LeverageSlider, { props: { value: 10, max: 100, marks: [1, 25, 150], onchange } });
    expect(screen.queryByRole("button", { name: "Set leverage to 150×" })).toBeNull();
    await fireEvent.click(screen.getByRole("button", { name: "Set leverage to 25×" }));
    expect(slider()).toHaveAttribute("aria-valuetext", "25×");
    expect(onchange).toHaveBeenCalledWith(25);
  });

  it("uses custom labels and shows an error", () => {
    render(LeverageSlider, {
      props: {
        value: 5,
        max: 20,
        error: "Too high",
        labels: { label: "Alavancagem", value: (v: number) => `${v}x` },
      },
    });
    expect(slider()).toHaveAccessibleName("Alavancagem");
    expect(slider()).toHaveAttribute("aria-valuetext", "5x");
    expect(slider()).toHaveAccessibleDescription("Too high");
    expect(screen.getByRole("alert")).toHaveTextContent("Too high");
  });
});
