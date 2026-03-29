import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
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
});
