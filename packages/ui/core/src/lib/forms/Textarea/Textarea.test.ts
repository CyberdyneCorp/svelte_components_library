import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Textarea from "./Textarea.svelte";

describe("Textarea", () => {
  it("renders with default props", () => {
    render(Textarea);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(Textarea, { props: { label: "Description" } });
    const label = screen.getByText("Description");
    expect(label).toBeInTheDocument();
  });

  it("applies placeholder", () => {
    render(Textarea, { props: { placeholder: "Type here..." } });
    const textarea = screen.getByPlaceholderText("Type here...");
    expect(textarea).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(Textarea, { props: { error: "Too long" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Too long");
  });

  it("is disabled when disabled prop is true", () => {
    render(Textarea, { props: { disabled: true } });
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });
});
