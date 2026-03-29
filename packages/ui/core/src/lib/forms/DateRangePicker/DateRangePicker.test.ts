import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import DateRangePicker from "./DateRangePicker.svelte";

describe("DateRangePicker", () => {
  it("renders with default props", () => {
    const { container } = render(DateRangePicker);
    const wrapper = container.querySelector(".cy-drp");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    const { container } = render(DateRangePicker, { props: { label: "Period" } });
    const label = container.querySelector("label");
    expect(label?.textContent).toContain("Period");
  });

  it("renders trigger button", () => {
    const { container } = render(DateRangePicker);
    const trigger = container.querySelector("button");
    expect(trigger).toBeInTheDocument();
  });

  it("shows error message", () => {
    const { container } = render(DateRangePicker, { props: { error: "Invalid range" } });
    const error = container.querySelector("[role='alert']");
    expect(error?.textContent).toBe("Invalid range");
  });
});
