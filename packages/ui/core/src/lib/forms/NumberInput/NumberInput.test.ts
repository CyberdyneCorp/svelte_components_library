import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import NumberInput from "./NumberInput.svelte";

describe("NumberInput", () => {
  it("renders with default props", () => {
    const { container } = render(NumberInput);
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(NumberInput, { props: { label: "Quantity" } });
    const label = screen.getByText("Quantity");
    expect(label).toBeInTheDocument();
  });

  it("renders increment and decrement buttons", () => {
    render(NumberInput);
    const decrease = screen.getByRole("button", { name: "Decrease" });
    const increase = screen.getByRole("button", { name: "Increase" });
    expect(decrease).toBeInTheDocument();
    expect(increase).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(NumberInput, { props: { error: "Out of range" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Out of range");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(NumberInput, { props: { disabled: true } });
    const input = container.querySelector("input");
    expect(input).toBeDisabled();
  });
});
