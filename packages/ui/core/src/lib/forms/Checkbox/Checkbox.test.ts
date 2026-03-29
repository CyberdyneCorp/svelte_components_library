import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Checkbox from "./Checkbox.svelte";

describe("Checkbox", () => {
  it("renders with default props", () => {
    render(Checkbox);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(Checkbox, { props: { label: "Accept terms" } });
    const label = screen.getByText("Accept terms");
    expect(label).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(Checkbox);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("shows error message", () => {
    render(Checkbox, { props: { error: "Must accept" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Must accept");
  });

  it("is disabled when disabled prop is true", () => {
    render(Checkbox, { props: { disabled: true } });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });
});
