import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TextInput from "./TextInput.svelte";

describe("TextInput", () => {
  it("renders with default props", () => {
    render(TextInput);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(TextInput, { props: { label: "Email", id: "email" } });
    const label = screen.getByText("Email");
    expect(label).toBeInTheDocument();
  });

  it("applies placeholder", () => {
    render(TextInput, { props: { placeholder: "Enter text" } });
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(TextInput, { props: { error: "Required field" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Required field");
  });

  it("is disabled when disabled prop is true", () => {
    render(TextInput, { props: { disabled: true } });
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });
});
