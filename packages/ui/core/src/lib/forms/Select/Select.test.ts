import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Select from "./Select.svelte";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("Select", () => {
  it("renders with default props", () => {
    const { container } = render(Select);
    const select = container.querySelector("select");
    expect(select).toBeInTheDocument();
  });

  it("renders options", () => {
    const { container } = render(Select, { props: { options } });
    const opts = container.querySelectorAll("option");
    // includes placeholder option + 2 options
    expect(opts.length).toBeGreaterThanOrEqual(2);
  });

  it("renders label when provided", () => {
    render(Select, { props: { label: "Country" } });
    const label = screen.getByText("Country");
    expect(label).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(Select, { props: { error: "Please select" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Please select");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(Select, { props: { disabled: true } });
    const select = container.querySelector("select");
    expect(select).toBeDisabled();
  });
});
