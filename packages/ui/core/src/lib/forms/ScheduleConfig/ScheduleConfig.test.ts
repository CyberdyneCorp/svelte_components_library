import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ScheduleConfig from "./ScheduleConfig.svelte";

describe("ScheduleConfig", () => {
  it("renders with default props", () => {
    const { container } = render(ScheduleConfig);
    expect(container.querySelector(".cy-sched")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(ScheduleConfig, { props: { label: "Agent Schedule" } });
    expect(screen.getByText("Agent Schedule")).toBeInTheDocument();
  });

  it("shows all mode buttons", () => {
    render(ScheduleConfig);
    expect(screen.getByText("Every N minutes")).toBeInTheDocument();
    expect(screen.getByText("Daily")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Monthly")).toBeInTheDocument();
  });

  it("shows cron mode when showCron is true", () => {
    render(ScheduleConfig, { props: { showCron: true } });
    expect(screen.getByText("Cron")).toBeInTheDocument();
  });

  it("does not show cron mode by default", () => {
    render(ScheduleConfig);
    expect(screen.queryByText("Cron")).not.toBeInTheDocument();
  });

  it("shows interval presets by default", () => {
    render(ScheduleConfig);
    expect(screen.getByText("5 min")).toBeInTheDocument();
    expect(screen.getByText("1 hr")).toBeInTheDocument();
    expect(screen.getByText("24 hr")).toBeInTheDocument();
  });

  it("switches to weekly mode on click", async () => {
    render(ScheduleConfig);
    const weeklyBtn = screen.getByText("Weekly");
    await fireEvent.click(weeklyBtn);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
  });

  it("switches to daily mode on click", async () => {
    render(ScheduleConfig);
    const dailyBtn = screen.getByText("Daily");
    await fireEvent.click(dailyBtn);
    expect(screen.getByText("Run at")).toBeInTheDocument();
  });

  it("switches to monthly mode on click", async () => {
    render(ScheduleConfig);
    const monthlyBtn = screen.getByText("Monthly");
    await fireEvent.click(monthlyBtn);
    // Should show day-of-month buttons (1-31)
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("31")).toBeInTheDocument();
  });

  it("displays summary for interval mode", () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "interval",
          intervalMinutes: 30,
          time: "09:00",
          days: [1, 2, 3, 4, 5],
          monthDays: [1],
          cron: "0 9 * * *",
          timezone: "UTC",
        },
      },
    });
    expect(screen.getByText("Every 30 minutes")).toBeInTheDocument();
  });

  it("displays summary for daily mode", () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "daily",
          intervalMinutes: 60,
          time: "14:30",
          days: [],
          monthDays: [],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    expect(screen.getByText("Daily at 14:30")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(ScheduleConfig, { props: { error: "Schedule is required" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Schedule is required");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(ScheduleConfig, { props: { disabled: true } });
    expect(container.querySelector(".cy-sched--disabled")).toBeInTheDocument();
  });

  it("shows timezone selector for non-interval modes", async () => {
    render(ScheduleConfig);
    const dailyBtn = screen.getByText("Daily");
    await fireEvent.click(dailyBtn);
    expect(screen.getByText("Timezone")).toBeInTheDocument();
  });

  it("hides timezone when showTimezone is false", async () => {
    render(ScheduleConfig, { props: { showTimezone: false } });
    const dailyBtn = screen.getByText("Daily");
    await fireEvent.click(dailyBtn);
    expect(screen.queryByText("Timezone")).not.toBeInTheDocument();
  });

  it("selects an interval preset on click", async () => {
    render(ScheduleConfig);
    const preset = screen.getByText("15 min");
    await fireEvent.click(preset);
    expect(screen.getByText("Every 15 minutes")).toBeInTheDocument();
  });

  it("accepts custom interval input", async () => {
    render(ScheduleConfig);
    const input = screen.getByLabelText("Custom (min)");
    await fireEvent.input(input, { target: { value: "45" } });
    expect(screen.getByText("Every 45 minutes")).toBeInTheDocument();
  });

  it("ignores invalid custom interval input", async () => {
    render(ScheduleConfig);
    const input = screen.getByLabelText("Custom (min)");
    await fireEvent.input(input, { target: { value: "abc" } });
    // Should still show original summary
    expect(screen.getByText("Every hour")).toBeInTheDocument();
  });

  it("toggles weekday selection", async () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "weekly",
          intervalMinutes: 60,
          time: "09:00",
          days: [1, 3, 5],
          monthDays: [1],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    // Add Tuesday (2)
    const tueBtn = screen.getByLabelText("Tuesday");
    await fireEvent.click(tueBtn);
    expect(tueBtn.getAttribute("aria-pressed")).toBe("true");

    // Remove Monday (1)
    const monBtn = screen.getByLabelText("Monday");
    await fireEvent.click(monBtn);
    expect(monBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("toggles month day selection", async () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "monthly",
          intervalMinutes: 60,
          time: "09:00",
          days: [],
          monthDays: [1, 15],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    // Add day 10
    const day10 = screen.getAllByText("10").find((el) => el.classList.contains("cy-sched__mday-btn"))!;
    await fireEvent.click(day10);
    expect(day10.getAttribute("aria-pressed")).toBe("true");

    // Remove day 15
    const day15 = screen.getAllByText("15").find((el) => el.classList.contains("cy-sched__mday-btn"))!;
    await fireEvent.click(day15);
    expect(day15.getAttribute("aria-pressed")).toBe("false");
  });

  it("changes time input in daily mode", async () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "daily",
          intervalMinutes: 60,
          time: "09:00",
          days: [],
          monthDays: [],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    const timeInput = screen.getByLabelText("Run at");
    await fireEvent.change(timeInput, { target: { value: "17:30" } });
    expect(screen.getByText("Daily at 17:30")).toBeInTheDocument();
  });

  it("changes cron expression", async () => {
    render(ScheduleConfig, {
      props: {
        showCron: true,
        value: {
          mode: "cron",
          intervalMinutes: 60,
          time: "09:00",
          days: [],
          monthDays: [],
          cron: "0 9 * * *",
          timezone: "UTC",
        },
      },
    });
    const cronInput = screen.getByLabelText("Cron expression");
    await fireEvent.input(cronInput, { target: { value: "*/5 * * * *" } });
    expect(screen.getByText("*/5 * * * *")).toBeInTheDocument();
  });

  it("changes timezone selection", async () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "daily",
          intervalMinutes: 60,
          time: "09:00",
          days: [],
          monthDays: [],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    const tzSelect = screen.getByLabelText("Timezone");
    await fireEvent.change(tzSelect, { target: { value: "America/New_York" } });
    const option = screen.getByText("America/New York") as HTMLOptionElement;
    expect(option).toBeInTheDocument();
  });

  it("displays summary for hourly interval", () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "interval",
          intervalMinutes: 60,
          time: "09:00",
          days: [],
          monthDays: [],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    expect(screen.getByText("Every hour")).toBeInTheDocument();
  });

  it("displays summary for multi-hour interval", () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "interval",
          intervalMinutes: 360,
          time: "09:00",
          days: [],
          monthDays: [],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    expect(screen.getByText("Every 6 hours")).toBeInTheDocument();
  });

  it("displays summary for mixed hours+minutes interval", () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "interval",
          intervalMinutes: 90,
          time: "09:00",
          days: [],
          monthDays: [],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    expect(screen.getByText("Every 1h 30m")).toBeInTheDocument();
  });

  it("displays weekly summary with selected days", () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "weekly",
          intervalMinutes: 60,
          time: "10:00",
          days: [1, 3, 5],
          monthDays: [],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    expect(screen.getByText("Mon, Wed, Fri at 10:00")).toBeInTheDocument();
  });

  it("displays weekly summary with no days", () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "weekly",
          intervalMinutes: 60,
          time: "10:00",
          days: [],
          monthDays: [],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    expect(screen.getByText("No days at 10:00")).toBeInTheDocument();
  });

  it("displays monthly summary", () => {
    render(ScheduleConfig, {
      props: {
        value: {
          mode: "monthly",
          intervalMinutes: 60,
          time: "06:00",
          days: [],
          monthDays: [1, 15],
          cron: "",
          timezone: "UTC",
        },
      },
    });
    expect(screen.getByText("Day 1, 15 of each month at 06:00")).toBeInTheDocument();
  });

  it("calls onchange when mode is switched", async () => {
    let changed = false;
    render(ScheduleConfig, {
      props: { onchange: () => { changed = true; } },
    });
    await fireEvent.click(screen.getByText("Daily"));
    expect(changed).toBe(true);
  });
});
