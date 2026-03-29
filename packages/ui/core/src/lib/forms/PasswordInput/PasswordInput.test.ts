import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PasswordInput from "./PasswordInput.svelte";

describe("PasswordInput", () => {
  it("renders with default props", () => {
    const { container } = render(PasswordInput);
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
    expect(input?.type).toBe("password");
  });

  it("renders label when provided", () => {
    render(PasswordInput, { props: { label: "Password" } });
    const label = screen.getByText("Password");
    expect(label).toBeInTheDocument();
  });

  it("toggles password visibility on button click", async () => {
    const { container } = render(PasswordInput);
    const input = container.querySelector("input")!;
    const toggleBtn = screen.getByRole("button");
    expect(input.type).toBe("password");
    await fireEvent.click(toggleBtn);
    expect(input.type).toBe("text");
  });

  it("shows error message", () => {
    render(PasswordInput, { props: { error: "Too short" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Too short");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(PasswordInput, { props: { disabled: true } });
    const input = container.querySelector("input");
    expect(input).toBeDisabled();
  });
});
