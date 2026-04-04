import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import TimePicker from "./TimePicker.svelte";

describe("TimePicker", () => {
  it("renders with default props", () => {
    const { container } = render(TimePicker);
    const btn = container.querySelector("button");
    expect(btn).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(TimePicker, { props: { label: "Start time" } });
    const label = screen.getByText("Start time");
    expect(label).toBeInTheDocument();
  });

  it("has aria-haspopup dialog", () => {
    const { container } = render(TimePicker);
    const btn = container.querySelector("[aria-haspopup='dialog']");
    expect(btn).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(TimePicker, { props: { error: "Invalid time" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Invalid time");
  });

  it("opens time picker on click", async () => {
    const { container } = render(TimePicker);
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).toBeInTheDocument();
  });

  it("closes on second click (toggle)", async () => {
    const { container } = render(TimePicker);
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    expect(container.querySelector("[role='dialog']")).toBeInTheDocument();
    await fireEvent.click(trigger);
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const { container } = render(TimePicker, { props: { disabled: true } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("closes on Escape keydown", async () => {
    const { container } = render(TimePicker);
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    expect(container.querySelector("[role='dialog']")).toBeInTheDocument();
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("selects an hour and minute", async () => {
    const onchange = vi.fn();
    const { container } = render(TimePicker, { props: { onchange } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const cells = container.querySelectorAll(".cy-tp__cell");
    // First column is hours (0-23), click hour 10
    const hour10 = Array.from(cells).find((c) => c.textContent?.trim() === "10");
    expect(hour10).toBeTruthy();
    await fireEvent.click(hour10!);

    // Minute column cells: find minute 30
    const minute30 = Array.from(cells).find((c) => c.textContent?.trim() === "30");
    expect(minute30).toBeTruthy();
    await fireEvent.click(minute30!);

    expect(onchange).toHaveBeenCalledWith("10:30");
  });

  it("shows 12h format hours (1-12)", async () => {
    const { container } = render(TimePicker, { props: { format: "12h" } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const cells = container.querySelectorAll(".cy-tp__cell");
    const hourTexts = Array.from(cells).map((c) => c.textContent?.trim());
    // Should include 01-12 and AM/PM
    expect(hourTexts).toContain("01");
    expect(hourTexts).toContain("12");
    expect(hourTexts).toContain("AM");
    expect(hourTexts).toContain("PM");
  });

  it("toggles AM/PM in 12h format", async () => {
    const onchange = vi.fn();
    const { container } = render(TimePicker, { props: { format: "12h", onchange } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const cells = container.querySelectorAll(".cy-tp__cell");
    // Select hour 3
    const hour3 = Array.from(cells).find((c) => c.textContent?.trim() === "03");
    await fireEvent.click(hour3!);
    // Select minute 00
    const min0 = Array.from(cells).find((c) => c.textContent?.trim() === "00");
    await fireEvent.click(min0!);

    // Toggle PM
    const pmBtn = Array.from(cells).find((c) => c.textContent?.trim() === "PM");
    await fireEvent.click(pmBtn!);
    expect(onchange).toHaveBeenCalledWith("15:00");
  });

  it("displays 12h formatted value", () => {
    const { container } = render(TimePicker, { props: { value: "14:30", format: "12h" } });
    const valueSpan = container.querySelector(".cy-tp__value");
    expect(valueSpan?.textContent?.trim()).toBe("02:30 PM");
  });

  it("displays 12h formatted value for midnight", () => {
    const { container } = render(TimePicker, { props: { value: "00:00", format: "12h" } });
    const valueSpan = container.querySelector(".cy-tp__value");
    expect(valueSpan?.textContent?.trim()).toBe("12:00 AM");
  });

  it("displays placeholder when no value", () => {
    const { container } = render(TimePicker);
    const valueSpan = container.querySelector(".cy-tp__value");
    expect(valueSpan?.textContent?.trim()).toBe("Select time");
    expect(valueSpan?.classList.contains("cy-tp__value--placeholder")).toBe(true);
  });

  it("respects minuteStep prop", async () => {
    const { container } = render(TimePicker, { props: { minuteStep: 15 } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const columns = container.querySelectorAll(".cy-tp__column");
    const minuteColumn = columns[1];
    const minuteCells = minuteColumn.querySelectorAll(".cy-tp__cell");
    // 0, 15, 30, 45
    expect(minuteCells.length).toBe(4);
    expect(minuteCells[0].textContent?.trim()).toBe("00");
    expect(minuteCells[1].textContent?.trim()).toBe("15");
    expect(minuteCells[2].textContent?.trim()).toBe("30");
    expect(minuteCells[3].textContent?.trim()).toBe("45");
  });

  it("highlights selected hour and minute from value prop", async () => {
    const { container } = render(TimePicker, { props: { value: "09:15", minuteStep: 5 } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const selectedCells = container.querySelectorAll(".cy-tp__cell--selected");
    const selectedTexts = Array.from(selectedCells).map((c) => c.textContent?.trim());
    expect(selectedTexts).toContain("09");
    expect(selectedTexts).toContain("15");
  });

  it("does not call onchange when only hour is selected (no minute)", async () => {
    const onchange = vi.fn();
    const { container } = render(TimePicker, { props: { onchange } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    // Select only hour 5 without selecting minute first
    const cells = container.querySelectorAll(".cy-tp__cell");
    const hour5 = Array.from(cells).find((c) => c.textContent?.trim() === "05");
    await fireEvent.click(hour5!);
    // selectedMinute is still -1 so updateValue should bail out
    expect(onchange).not.toHaveBeenCalled();
  });

  it("handles 12h AM with hour 12 converting to 0", async () => {
    const onchange = vi.fn();
    const { container } = render(TimePicker, { props: { format: "12h", onchange } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const cells = container.querySelectorAll(".cy-tp__cell");
    // Select hour 12
    const hour12 = Array.from(cells).find((c) => c.textContent?.trim() === "12");
    await fireEvent.click(hour12!);
    // Select minute 00
    const min0 = Array.from(cells).find((c) => c.textContent?.trim() === "00");
    await fireEvent.click(min0!);
    // AM is default, so hour 12 AM => 0:00
    expect(onchange).toHaveBeenCalledWith("00:00");
  });

  it("handles 12h PM with hour 12 staying at 12", async () => {
    const onchange = vi.fn();
    const { container } = render(TimePicker, { props: { format: "12h", onchange } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const cells = container.querySelectorAll(".cy-tp__cell");
    // Toggle PM first
    const pmBtn = Array.from(cells).find((c) => c.textContent?.trim() === "PM");
    await fireEvent.click(pmBtn!);
    // Select hour 12
    const hour12 = Array.from(cells).find((c) => c.textContent?.trim() === "12");
    await fireEvent.click(hour12!);
    // Select minute 00
    const min0 = Array.from(cells).find((c) => c.textContent?.trim() === "00");
    await fireEvent.click(min0!);
    // PM with hour 12 stays at 12
    expect(onchange).toHaveBeenCalledWith("12:00");
  });

  it("parses value with h > 12 in 12h format", () => {
    const { container } = render(TimePicker, { props: { value: "15:30", format: "12h" } });
    const valueSpan = container.querySelector(".cy-tp__value");
    expect(valueSpan?.textContent?.trim()).toBe("03:30 PM");
  });
});
