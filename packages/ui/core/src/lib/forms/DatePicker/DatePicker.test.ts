import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import DatePicker from "./DatePicker.svelte";

describe("DatePicker", () => {
  it("renders with default props", () => {
    const { container } = render(DatePicker);
    const btn = container.querySelector("button");
    expect(btn).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(DatePicker, { props: { label: "Birth date" } });
    const label = screen.getByText("Birth date");
    expect(label).toBeInTheDocument();
  });

  it("has aria-haspopup dialog", () => {
    const { container } = render(DatePicker);
    const btn = container.querySelector("[aria-haspopup='dialog']");
    expect(btn).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(DatePicker, { props: { error: "Invalid date" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Invalid date");
  });

  it("opens calendar on click", async () => {
    const { container } = render(DatePicker);
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).toBeInTheDocument();
  });

  it("closes on second click (toggle)", async () => {
    const { container } = render(DatePicker);
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    expect(container.querySelector("[role='dialog']")).toBeInTheDocument();
    await fireEvent.click(trigger);
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const { container } = render(DatePicker, { props: { disabled: true } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const { container } = render(DatePicker);
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    expect(container.querySelector("[role='dialog']")).toBeInTheDocument();
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("shows weekday headers", async () => {
    const { container } = render(DatePicker);
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    const weekdays = container.querySelectorAll(".cy-dp__weekday");
    expect(weekdays.length).toBe(7);
    expect(weekdays[0].textContent).toBe("Su");
  });

  it("navigates to previous month", async () => {
    const { container } = render(DatePicker, { props: { value: "2025-03-15" } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const prevBtn = container.querySelector("[aria-label='Previous month']")!;
    await fireEvent.click(prevBtn);
    expect(container.querySelector(".cy-dp__nav-title")?.textContent).toContain("February");
  });

  it("navigates to next month", async () => {
    const { container } = render(DatePicker, { props: { value: "2025-03-15" } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const nextBtn = container.querySelector("[aria-label='Next month']")!;
    await fireEvent.click(nextBtn);
    expect(container.querySelector(".cy-dp__nav-title")?.textContent).toContain("April");
  });

  it("selects a date and closes dropdown", async () => {
    const onchange = vi.fn();
    const { container } = render(DatePicker, { props: { value: "2025-03-15", onchange } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const dayBtns = container.querySelectorAll(".cy-dp__day");
    const day10 = Array.from(dayBtns).find((b) => b.textContent?.trim() === "10");
    await fireEvent.click(day10!);
    expect(onchange).toHaveBeenCalledWith("2025-03-10");
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("disables dates before minDate", async () => {
    const { container } = render(DatePicker, { props: { value: "2025-03-15", minDate: "2025-03-10" } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const dayBtns = container.querySelectorAll(".cy-dp__day");
    const day5 = Array.from(dayBtns).find((b) => b.textContent?.trim() === "5");
    expect(day5).toBeDisabled();
  });

  it("disables dates after maxDate", async () => {
    const { container } = render(DatePicker, { props: { value: "2025-03-15", maxDate: "2025-03-20" } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const dayBtns = container.querySelectorAll(".cy-dp__day");
    const day25 = Array.from(dayBtns).find((b) => b.textContent?.trim() === "25");
    expect(day25).toBeDisabled();
  });

  it("clears value via Clear button", async () => {
    const onchange = vi.fn();
    const { container } = render(DatePicker, { props: { value: "2025-03-15", onchange } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const clearBtn = screen.getByText("Clear");
    await fireEvent.click(clearBtn);
    expect(onchange).toHaveBeenCalledWith("");
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("selects today via Today button", async () => {
    const onchange = vi.fn();
    const { container } = render(DatePicker, { props: { onchange } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const todayBtn = screen.getByText("Today");
    await fireEvent.click(todayBtn);
    expect(onchange).toHaveBeenCalled();
    // The value should be today's date in YYYY-MM-DD format
    const calledValue = onchange.mock.calls[0][0];
    expect(calledValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("shows placeholder when no value", () => {
    const { container } = render(DatePicker, { props: { placeholder: "Pick a date" } });
    const valueSpan = container.querySelector(".cy-dp__value");
    expect(valueSpan?.textContent?.trim()).toBe("Pick a date");
    expect(valueSpan?.classList.contains("cy-dp__value--placeholder")).toBe(true);
  });

  it("shows selected date value", () => {
    const { container } = render(DatePicker, { props: { value: "2025-06-15" } });
    const valueSpan = container.querySelector(".cy-dp__value");
    expect(valueSpan?.textContent?.trim()).toBe("2025-06-15");
  });

  it("highlights selected date in calendar", async () => {
    const { container } = render(DatePicker, { props: { value: "2025-03-15" } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);

    const selected = container.querySelector(".cy-dp__day--selected");
    expect(selected).toBeInTheDocument();
    expect(selected?.textContent?.trim()).toBe("15");
  });

  it("applies disabled class to container", () => {
    const { container } = render(DatePicker, { props: { disabled: true } });
    expect(container.querySelector(".cy-dp--disabled")).toBeInTheDocument();
  });

  it("renders blank cells for first day offset", async () => {
    const { container } = render(DatePicker, { props: { value: "2025-03-01" } });
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    await fireEvent.click(trigger);
    const blanks = container.querySelectorAll(".cy-dp__blank");
    // March 2025 starts on Saturday (day 6), so 6 blanks
    expect(blanks.length).toBe(6);
  });

  it("sets aria-expanded on trigger", async () => {
    const { container } = render(DatePicker);
    const trigger = container.querySelector("[aria-haspopup='dialog']")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});
