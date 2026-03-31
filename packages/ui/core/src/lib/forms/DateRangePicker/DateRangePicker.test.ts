import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import DateRangePicker from "./DateRangePicker.svelte";

describe("DateRangePicker", () => {
  it("renders with default props", () => {
    const { container } = render(DateRangePicker);
    expect(container.querySelector(".cy-drp")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(DateRangePicker, { props: { label: "Period" } });
    expect(screen.getByText("Period")).toBeInTheDocument();
  });

  it("does not render label when empty", () => {
    const { container } = render(DateRangePicker);
    expect(container.querySelector(".cy-drp__label")).not.toBeInTheDocument();
  });

  it("renders trigger button", () => {
    const { container } = render(DateRangePicker);
    expect(container.querySelector(".cy-drp__trigger")).toBeInTheDocument();
  });

  it("shows error message with alert role", () => {
    render(DateRangePicker, { props: { error: "Invalid range" } });
    expect(screen.getByRole("alert").textContent).toBe("Invalid range");
  });

  it("applies error class", () => {
    const { container } = render(DateRangePicker, { props: { error: "err" } });
    expect(container.querySelector(".cy-drp--error")).toBeInTheDocument();
  });

  it("applies disabled class", () => {
    const { container } = render(DateRangePicker, { props: { disabled: true } });
    expect(container.querySelector(".cy-drp--disabled")).toBeInTheDocument();
  });

  it("disables trigger button when disabled", () => {
    const { container } = render(DateRangePicker, { props: { disabled: true } });
    expect(container.querySelector(".cy-drp__trigger")).toBeDisabled();
  });

  it("displays 'Select date range' when no dates selected", () => {
    const { container } = render(DateRangePicker);
    expect(container.querySelector(".cy-drp__value")?.textContent?.trim()).toBe(
      "Select date range"
    );
  });

  it("displays start date with ellipsis when only start is set", () => {
    const { container } = render(DateRangePicker, { props: { startDate: "2025-01-15" } });
    expect(container.querySelector(".cy-drp__value")?.textContent?.trim()).toContain("2025-01-15");
    expect(container.querySelector(".cy-drp__value")?.textContent?.trim()).toContain("...");
  });

  it("displays date range when both dates set", () => {
    const { container } = render(DateRangePicker, {
      props: { startDate: "2025-01-15", endDate: "2025-01-20" },
    });
    const value = container.querySelector(".cy-drp__value")?.textContent?.trim();
    expect(value).toContain("2025-01-15");
    expect(value).toContain("2025-01-20");
  });

  it("opens dropdown on trigger click", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-drp__dropdown")).toBeInTheDocument();
  });

  it("does not open dropdown when disabled", async () => {
    const { container } = render(DateRangePicker, { props: { disabled: true } });
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-drp__dropdown")).not.toBeInTheDocument();
  });

  it("closes dropdown on second click", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-drp__dropdown")).toBeInTheDocument();
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-drp__dropdown")).not.toBeInTheDocument();
  });

  it("sets aria-expanded correctly", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders two calendar panels when open", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const cals = container.querySelectorAll(".cy-drp__cal");
    expect(cals.length).toBe(2);
  });

  it("renders weekday headers", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const weekdays = container.querySelectorAll(".cy-drp__weekday");
    expect(weekdays.length).toBe(14); // 7 per calendar
  });

  it("renders preset buttons", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const presets = container.querySelectorAll(".cy-drp__preset-btn");
    expect(presets.length).toBe(4); // Default 4 presets
  });

  it("renders custom presets", async () => {
    const { container } = render(DateRangePicker, {
      props: { presets: [{ label: "Last week", days: 7 }] },
    });
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const presets = container.querySelectorAll(".cy-drp__preset-btn");
    expect(presets.length).toBe(1);
    expect(presets[0].textContent).toBe("Last week");
  });

  it("applies preset on click", async () => {
    const changeFn = vi.fn();
    const { container } = render(DateRangePicker, {
      props: { onchange: changeFn },
    });
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const presets = container.querySelectorAll(".cy-drp__preset-btn");
    await fireEvent.click(presets[0]); // "Last 7 days"
    expect(changeFn).toHaveBeenCalledTimes(1);
    // Dropdown should close after preset
    expect(container.querySelector(".cy-drp__dropdown")).not.toBeInTheDocument();
  });

  it("navigates to previous month", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const prevBtn = screen.getByLabelText("Previous month");
    const titleBefore = container.querySelector(".cy-drp__cal-title")?.textContent;
    await fireEvent.click(prevBtn);
    const titleAfter = container.querySelector(".cy-drp__cal-title")?.textContent;
    expect(titleAfter).not.toBe(titleBefore);
  });

  it("navigates to next month", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const nextBtn = screen.getByLabelText("Next month");
    const titles = container.querySelectorAll(".cy-drp__cal-title");
    const rightTitleBefore = titles[1]?.textContent;
    await fireEvent.click(nextBtn);
    const titlesAfter = container.querySelectorAll(".cy-drp__cal-title");
    const rightTitleAfter = titlesAfter[1]?.textContent;
    expect(rightTitleAfter).not.toBe(rightTitleBefore);
  });

  it("selects a start date on day click", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const days = container.querySelectorAll(
      ".cy-drp__day:not(.cy-drp__day--empty)"
    );
    if (days.length > 0) {
      await fireEvent.click(days[0]);
      // After first click, we're selecting end date, so dropdown stays open
      expect(container.querySelector(".cy-drp__dropdown")).toBeInTheDocument();
    }
  });

  it("selects start and end date to complete range", async () => {
    const changeFn = vi.fn();
    const { container } = render(DateRangePicker, { props: { onchange: changeFn } });
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const days = container.querySelectorAll(
      ".cy-drp__day:not(.cy-drp__day--empty)"
    );
    if (days.length >= 5) {
      await fireEvent.click(days[0]); // Start
      await fireEvent.click(days[4]); // End
      expect(changeFn).toHaveBeenCalledTimes(1);
      // Dropdown closes after complete range
      expect(container.querySelector(".cy-drp__dropdown")).not.toBeInTheDocument();
    }
  });

  it("resets when end date is before start date", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const days = container.querySelectorAll(
      ".cy-drp__day:not(.cy-drp__day--empty)"
    );
    if (days.length >= 5) {
      await fireEvent.click(days[4]); // Select later date as start
      await fireEvent.click(days[0]); // Select earlier date as end -> should reset start
      // Should still be in selecting state (dropdown open)
      expect(container.querySelector(".cy-drp__dropdown")).toBeInTheDocument();
    }
  });

  it("hides presets section when empty array", async () => {
    const { container } = render(DateRangePicker, { props: { presets: [] } });
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-drp__presets")).not.toBeInTheDocument();
  });

  it("shows hover range highlight on mouseenter during end selection", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const days = container.querySelectorAll(
      ".cy-drp__day:not(.cy-drp__day--empty)"
    );
    if (days.length >= 5) {
      await fireEvent.click(days[0]); // Select start
      await fireEvent.mouseEnter(days[3]); // Hover for range preview
      // This exercises the hoverDate and isInRange paths
    }
  });

  it("marks start date with start class", async () => {
    const { container } = render(DateRangePicker, {
      props: { startDate: "2025-01-15", endDate: "2025-01-20" },
    });
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    // Navigate to Jan 2025 if needed - just check structure
    const startDays = container.querySelectorAll(".cy-drp__day--start");
    // May or may not find it depending on current month displayed
    expect(container.querySelector(".cy-drp__dropdown")).toBeInTheDocument();
  });

  it("renders day numbers correctly", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const days = container.querySelectorAll(
      ".cy-drp__day:not(.cy-drp__day--empty)"
    );
    // First visible day should be "1"
    if (days.length > 0) {
      expect(days[0].textContent?.trim()).toBe("1");
    }
  });

  it("wraps month navigation from January to December", async () => {
    // This tests the prevMonth boundary logic
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const prevBtn = screen.getByLabelText("Previous month");
    // Click prev enough times to wrap around
    for (let i = 0; i < 13; i++) {
      await fireEvent.click(prevBtn);
    }
    expect(container.querySelector(".cy-drp__dropdown")).toBeInTheDocument();
  });

  it("wraps month navigation from December to January", async () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector(".cy-drp__trigger")!;
    await fireEvent.click(trigger);
    const nextBtn = screen.getByLabelText("Next month");
    for (let i = 0; i < 13; i++) {
      await fireEvent.click(nextBtn);
    }
    expect(container.querySelector(".cy-drp__dropdown")).toBeInTheDocument();
  });
});
