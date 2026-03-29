import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
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
});
